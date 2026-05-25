const { getAllProductIds } = require("../models/predictionModel");
const { getSalesTrend } = require("../models/analyticsModel");

const SEVERITY = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
};

// Default low stock threshold — can be made configurable per product later
const LOW_STOCK_THRESHOLD = 10;

const generateAlerts = async (company_id) => {
  const alerts = [];

  const [products, salesTrend] = await Promise.all([
    getAllProductIds(company_id),
    getSalesTrend(company_id),
  ]);

  // Build a quick lookup map for sales trend by product id
  const trendMap = {};
  for (const row of salesTrend) {
    trendMap[row.id] = row;
  }

  for (const product of products) {
    const trend = trendMap[product.id];
    const last7 = trend ? parseInt(trend.last_7_days) : 0;
    const prev7 = trend ? parseInt(trend.prev_7_days) : 0;

    // Alert 1 — Out of stock
    if (product.stock === 0) {
      alerts.push({
        severity: SEVERITY.CRITICAL,
        type: "out_of_stock",
        product_id: product.id,
        product: product.name,
        message: `"${product.name}" is completely out of stock.`,
        action: "Restock immediately to avoid lost sales.",
      });
    }
    // Alert 2 — Low stock
    else if (product.stock <= LOW_STOCK_THRESHOLD) {
      alerts.push({
        severity: SEVERITY.WARNING,
        type: "low_stock",
        product_id: product.id,
        product: product.name,
        message: `"${product.name}" is running low — only ${product.stock} units left.`,
        action: `Restock before stock hits zero. Threshold is ${LOW_STOCK_THRESHOLD} units.`,
      });
    }

    // Alert 3 — Demand spike (this week sales > 2x last week)
    if (prev7 > 0 && last7 >= prev7 * 2) {
      const spike = Math.round(((last7 - prev7) / prev7) * 100);
      alerts.push({
        severity: SEVERITY.WARNING,
        type: "demand_spike",
        product_id: product.id,
        product: product.name,
        message: `"${product.name}" demand spiked ${spike}% this week (${last7} sold vs ${prev7} last week).`,
        action: "Check stock levels — higher demand may drain inventory faster than expected.",
      });
    }

    // Alert 4 — New product with no sales after 7+ days
    if (last7 === 0 && prev7 === 0 && product.stock > 0) {
      alerts.push({
        severity: SEVERITY.INFO,
        type: "no_sales",
        product_id: product.id,
        product: product.name,
        message: `"${product.name}" has had no sales in the past 14 days.`,
        action: "Consider a discount, promotion, or reviewing the product listing.",
      });
    }
  }

  // Sort: critical → warning → info
  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return alerts;
};

module.exports = { generateAlerts };
