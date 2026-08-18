const mongoose = require('mongoose');
const Product = require('../models/product');
const Customer = require('../models/customer');
const OfflineSale = require('../models/offlineSale');
const OfflineSaleItem = require('../models/offlineSaleItem');

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function calculateItemTotals({ quantity, sellingPrice, costPrice }) {
  const qty = Math.max(0, toNumber(quantity));
  const sellPrice = Math.max(0, toNumber(sellingPrice));
  const costPriceNumber = Math.max(0, toNumber(costPrice));

  const revenue = Number((sellPrice * qty).toFixed(2));
  const cost = Number((costPriceNumber * qty).toFixed(2));
  const profit = Number((revenue - cost).toFixed(2));

  return { revenue, cost, profit, quantity: qty };
}

function calculateProfitMargin(revenue, profit) {
  const revenueValue = Math.max(0, toNumber(revenue));
  const profitValue = toNumber(profit);

  if (revenueValue <= 0) return 0;
  return Number(((profitValue / revenueValue) * 100).toFixed(2));
}

function buildSalesInsight({
  todayRevenue,
  avgRevenue,
  todayProfit,
  avgProfit,
  productName,
  monthLabel,
  currentMonthName,
  prevMonthName,
  currentValue,
  previousValue,
  metricLabel
}) {
  const revenueDiff = avgRevenue ? ((todayRevenue - avgRevenue) / avgRevenue) * 100 : 0;
  const profitDiff = avgProfit ? ((todayProfit - avgProfit) / avgProfit) * 100 : 0;

  if (productName) {
    return `${productName} is ${revenueDiff >= 0 ? 'ahead of' : 'below'} the previous 5-day revenue average by ${Math.abs(revenueDiff).toFixed(1)}%.`;
  }

  if (monthLabel && currentMonthName && prevMonthName) {
    const growth = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    return `${monthLabel} ${metricLabel || 'revenue'} ${growth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared with ${prevMonthName}.`;
  }

  if (avgRevenue) {
    return `Today's revenue is ${Math.abs(revenueDiff).toFixed(1)}% ${revenueDiff >= 0 ? 'higher' : 'lower'} than the average revenue of the previous 5 days.`;
  }

  if (avgProfit) {
    return `Today's profit is ${Math.abs(profitDiff).toFixed(1)}% ${profitDiff >= 0 ? 'higher' : 'lower'} than the average profit of the previous 5 days.`;
  }

  return 'No additional sales insight available.';
}

function buildFiveDayComparison(data) {
  const sorted = [...data].slice(-6);
  return sorted.map((item) => ({
    label: item.label,
    revenue: toNumber(item.revenue),
    cost: toNumber(item.cost),
    profit: toNumber(item.profit),
    orders: toNumber(item.orders),
    unitsSold: toNumber(item.unitsSold)
  }));
}

async function createOfflineSale({ ownerId, customerData = {}, items = [], paymentMethod = 'cash' }) {
  if (!ownerId) {
    const error = new Error('Owner is required to create an offline sale.');
    error.statusCode = 401;
    throw error;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Offline sale requires at least one product.');
    error.statusCode = 400;
    throw error;
  }

  const customerPhone = String(customerData.phone || '').trim();
  const customerName = String(customerData.name || '').trim();

  if (!customerName) {
    const error = new Error('Customer name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!customerPhone) {
    const error = new Error('Customer phone is required.');
    error.statusCode = 400;
    throw error;
  }

  const validPaymentMethods = ['cash', 'upi', 'card', 'bank-transfer', 'credit'];
  if (!validPaymentMethods.includes(String(paymentMethod || '').toLowerCase())) {
    const error = new Error('Invalid payment method selected.');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  let createdSale = null;

  try {
    session.startTransaction();

    const lookupIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: lookupIds } }).session(session);

    if (products.length !== lookupIds.length) {
      const error = new Error('One or more selected products are invalid.');
      error.statusCode = 400;
      throw error;
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const normalizedItems = [];
    let totalAmount = 0;
    let totalCost = 0;
    let totalProfit = 0;

    for (const item of items) {
      const product = productMap.get(String(item.productId));
      if (!product) {
        const error = new Error('Selected product could not be found.');
        error.statusCode = 400;
        throw error;
      }

      const quantity = Math.max(0, toNumber(item.quantity));
      if (quantity <= 0) {
        const error = new Error(`Quantity for ${product.name} must be greater than zero.`);
        error.statusCode = 400;
        throw error;
      }

      const stock = Math.max(0, toNumber(product.stock));
      if (stock < quantity) {
        const error = new Error(`Insufficient stock for ${product.name}. Available: ${stock}.`);
        error.statusCode = 400;
        throw error;
      }

      const sellingPrice = Math.max(0, toNumber(product.Selling_price));
      const costPrice = Math.max(0, toNumber(product.orginal_price || product.costPrice || 0));
      const itemTotals = calculateItemTotals({ quantity, sellingPrice, costPrice });

      totalAmount += itemTotals.revenue;
      totalCost += itemTotals.cost;
      totalProfit += itemTotals.profit;

      normalizedItems.push({
        productId: product._id,
        productName: product.name,
        company: product.company || product.brand || 'General',
        category: product.Category || 'general',
        quantity,
        sellingPriceSnapshot: sellingPrice,
        costPriceSnapshot: costPrice,
        revenue: itemTotals.revenue,
        cost: itemTotals.cost,
        profit: itemTotals.profit
      });

      product.stock = stock - quantity;
      product.salesCount = toNumber(product.salesCount) + quantity;
      await product.save({ session });
    }

    let customer = await Customer.findOne({ ownerId, phone: customerPhone }).session(session);
    if (!customer) {
      customer = await Customer.create([
        {
          ownerId,
          name: customerName,
          phone: customerPhone,
          email: String(customerData.email || '').trim(),
          address: String(customerData.address || '').trim()
        }
      ], { session });
      customer = customer[0];
    }

    const itemsCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

    const saleData = {
      ownerId,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      itemsCount,
      paymentMethod: String(paymentMethod).toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [sale] = await OfflineSale.create([saleData], { session });

    const saleItemDocs = normalizedItems.map((item) => ({
      saleId: sale._id,
      productId: item.productId,
      productName: item.productName,
      company: item.company,
      category: item.category,
      quantity: item.quantity,
      sellingPriceSnapshot: item.sellingPriceSnapshot,
      costPriceSnapshot: item.costPriceSnapshot,
      revenue: item.revenue,
      cost: item.cost,
      profit: item.profit
    }));

    await OfflineSaleItem.insertMany(saleItemDocs, { session });

    createdSale = await OfflineSale.findById(sale._id)
      .populate('customerId')
      .session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return createdSale;
}

module.exports = {
  toNumber,
  calculateItemTotals,
  calculateProfitMargin,
  buildSalesInsight,
  buildFiveDayComparison,
  createOfflineSale
};
