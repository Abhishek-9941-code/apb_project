const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateItemTotals,
  buildSalesInsight,
  calculateProfitMargin,
  buildFiveDayComparison
} = require('../services/ownerSalesService');

test('calculateItemTotals computes revenue, cost and profit', () => {
  const result = calculateItemTotals({
    quantity: 3,
    sellingPrice: 6,
    costPrice: 4
  });

  assert.equal(result.revenue, 18);
  assert.equal(result.cost, 12);
  assert.equal(result.profit, 6);
});

test('profit margin handles zero revenue safely', () => {
  assert.equal(calculateProfitMargin(0, 50), 0);
  assert.equal(calculateProfitMargin(100, 25), 25);
});

test('insights are generated dynamically from actual data', () => {
  const insight = buildSalesInsight({
    todayRevenue: 120,
    avgRevenue: 100,
    todayProfit: 30,
    avgProfit: 20,
    productName: 'DOMS Pencil'
  });

  assert.match(insight, /DOMS Pencil/i);
  assert.match(insight, /20%/i);
});

test('five-day comparison builds six ordered points', () => {
  const data = buildFiveDayComparison([
    { label: 'Day -5', revenue: 50 },
    { label: 'Day -4', revenue: 60 },
    { label: 'Day -3', revenue: 70 },
    { label: 'Day -2', revenue: 80 },
    { label: 'Yesterday', revenue: 90 },
    { label: 'Today', revenue: 110 }
  ]);

  assert.equal(data.length, 6);
  assert.equal(data[data.length - 1].label, 'Today');
  assert.equal(data[0].revenue, 50);
});
