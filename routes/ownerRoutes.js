const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Customer = require('../models/customer');
const OfflineSale = require('../models/offlineSale');
const OfflineSaleItem = require('../models/offlineSaleItem');
const { isLoggedIn, isOwner } = require('../middleware');
const { createOfflineSale, calculateItemTotals, calculateProfitMargin } = require('../services/ownerSalesService');

router.get('/apb/owner/dashboard', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const products = await Product.find().sort({ name: 1 }).limit(100);
    res.render('owner/owner_dashboard.ejs', { products });
  } catch (error) {
    next(error);
  }
});

router.get('/apb/owner/offline-sale', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.render('owner/offline_sale.ejs', { products, cart: [] });
  } catch (error) {
    next(error);
  }
});

router.get('/apb/owner/sales-history', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const sales = await OfflineSale.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).populate('customerId');
    res.render('owner/sales_history.ejs', { sales });
  } catch (error) {
    next(error);
  }
});

router.get('/apb/owner/sales/:id', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const sale = await OfflineSale.findOne({ _id: req.params.id, ownerId: req.user._id }).populate('customerId');
    if (!sale) {
      req.flash('error', 'Sale not found.');
      return res.redirect('/apb/owner/sales-history');
    }

    const items = await OfflineSaleItem.find({ saleId: sale._id }).sort({ createdAt: 1 });
    res.render('owner/sale_details.ejs', { sale, items });
  } catch (error) {
    next(error);
  }
});

router.get('/apb/owner/analytics', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const summary = await OfflineSale.aggregate([
      { $match: { ownerId: req.user._id } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, cost: { $sum: '$totalCost' }, profit: { $sum: '$totalProfit' }, orders: { $sum: 1 }, customers: { $addToSet: '$customerId' } } }
    ]);

    const result = summary[0] || { revenue: 0, cost: 0, profit: 0, orders: 0, customers: [] };
    res.render('owner/analytics_dashboard.ejs', {
      summary: {
        revenue: result.revenue || 0,
        cost: result.cost || 0,
        profit: result.profit || 0,
        orders: result.orders || 0,
        unitsSold: 0,
        customers: result.customers ? result.customers.length : 0
      },
      insights: []
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/owner/offline-sales', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];

    const createdSale = await createOfflineSale({
      ownerId: req.user._id,
      customerData: {
        name: body.customerName,
        phone: body.customerPhone,
        email: body.customerEmail,
        address: body.customerAddress
      },
      items,
      paymentMethod: body.paymentMethod
    });

    res.status(201).json({ success: true, sale: createdSale });
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/offline-sales', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const sales = await OfflineSale.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).populate('customerId');
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/offline-sales/:id', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const sale = await OfflineSale.findOne({ _id: req.params.id, ownerId: req.user._id }).populate('customerId');
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const items = await OfflineSaleItem.find({ saleId: sale._id });
    res.json({ sale, items });
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/offline-sales/:id/customer-history', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const sale = await OfflineSale.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const history = await OfflineSale.find({ customerId: sale.customerId, ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/daily', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [daily] = await OfflineSale.aggregate([
      { $match: { ownerId: req.user._id, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, cost: { $sum: '$totalCost' }, profit: { $sum: '$totalProfit' }, orders: { $sum: 1 }, unitsSold: { $sum: '$itemsCount' } } }
    ]);

    const itemUnits = await OfflineSaleItem.aggregate([
      { $match: { saleId: { $in: await OfflineSale.distinct('_id', { ownerId: req.user._id, createdAt: { $gte: start, $lte: end } }) } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    res.json({
      revenue: daily?.revenue || 0,
      cost: daily?.cost || 0,
      profit: daily?.profit || 0,
      orders: daily?.orders || 0,
      unitsSold: itemUnits[0]?.total || daily?.unitsSold || 0,
      customers: await OfflineSale.distinct('customerId', { ownerId: req.user._id, createdAt: { $gte: start, $lte: end } }).then((arr) => arr.length)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/five-days', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const days = [];
    const today = new Date();
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 0, 0, 0, 0);
      const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
      const sales = await OfflineSale.find({ ownerId: req.user._id, createdAt: { $gte: date, $lt: next } });
      const revenue = sales.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const cost = sales.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
      const profit = sales.reduce((sum, item) => sum + Number(item.totalProfit || 0), 0);
      const unitsSold = await OfflineSaleItem.aggregate([
        { $match: { saleId: { $in: sales.map((sale) => sale._id) } } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      days.push({
        label: offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : `Day -${offset}`,
        revenue: Number(revenue.toFixed(2)),
        cost: Number(cost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        orders: sales.length,
        unitsSold: unitsSold[0]?.total || 0
      });
    }
    res.json(days);
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/six-months', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const months = [];
    const now = new Date();
    for (let offset = 5; offset >= 0; offset -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
      const sales = await OfflineSale.find({ ownerId: req.user._id, createdAt: { $gte: start, $lte: end } });
      const revenue = sales.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const cost = sales.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
      const profit = sales.reduce((sum, item) => sum + Number(item.totalProfit || 0), 0);
      const unitsSold = await OfflineSaleItem.aggregate([
        { $match: { saleId: { $in: sales.map((sale) => sale._id) } } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      months.push({
        label: start.toLocaleString('en-US', { month: 'short' }),
        revenue: Number(revenue.toFixed(2)),
        cost: Number(cost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        orders: sales.length,
        unitsSold: unitsSold[0]?.total || 0
      });
    }
    res.json(months);
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/company-comparison', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const rows = await OfflineSaleItem.aggregate([
      { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: {
          _id: { productName: '$product.name', company: { $ifNull: ['$company', '$product.company'] }, category: '$product.Category' },
          unitsSold: { $sum: '$quantity' },
          revenue: { $sum: '$revenue' },
          totalCost: { $sum: '$cost' },
          totalProfit: { $sum: '$profit' }
        }
      }
    ]);

    const payload = rows.map((row) => ({
      product: row._id.productName,
      company: row._id.company || 'General',
      category: row._id.category || 'General',
      unitsSold: row.unitsSold,
      revenue: row.revenue,
      totalCost: row.totalCost,
      totalProfit: row.totalProfit,
      averageSellingPrice: row.unitsSold > 0 ? row.revenue / row.unitsSold : 0,
      profitMargin: calculateProfitMargin(row.revenue, row.totalProfit)
    }));

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/top-products', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const topSelling = await OfflineSaleItem.aggregate([
      { $group: { _id: '$productId', unitsSold: { $sum: '$quantity' }, revenue: { $sum: '$revenue' }, productName: { $first: '$productName' }, company: { $first: '$company' } } },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 10 }
    ]);

    const mostProfitable = await OfflineSaleItem.aggregate([
      { $group: { _id: '$productId', revenue: { $sum: '$revenue' }, profit: { $sum: '$profit' }, productName: { $first: '$productName' }, company: { $first: '$company' } } },
      { $sort: { profit: -1, revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({ topSelling, mostProfitable });
  } catch (error) {
    next(error);
  }
});

router.get('/api/owner/analytics/profitability', isLoggedIn, isOwner, async (req, res, next) => {
  try {
    const rows = await OfflineSaleItem.aggregate([
      { $group: { _id: '$productId', productName: { $first: '$productName' }, company: { $first: '$company' }, unitsSold: { $sum: '$quantity' }, revenue: { $sum: '$revenue' }, profit: { $sum: '$profit' } } },
      { $sort: { profit: -1 } }
    ]);

    const payload = rows.map((row) => ({
      productName: row.productName,
      company: row.company,
      unitsSold: row.unitsSold,
      revenue: row.revenue,
      profit: row.profit,
      profitMargin: calculateProfitMargin(row.revenue, row.profit)
    }));

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
