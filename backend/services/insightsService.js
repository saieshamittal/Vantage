const { getAllProductIds } = require("../models/predictionModel");
const { predictDemand } = require("./predictionService");
const { getSalesTrend, getTotalRevenue } = require("../models/analyticsModel");

// Severity levels for frontend colour coding
const SEVERITY = {
  CRITICAL: "critical", // red
  WARNING: "warning",   // yellow
  INFO: "info",         // blue
  POSITIVE: "positive", // green
};

const generateInsights = async (company_id) => {
  const insights = [];

  const [products, salesTrend, revenueThisWeek, revenueLastWeek] = await Promise.all([
    getAllProductIds(company_id),
    getSalesTrend(company_id),
    getTotalRevenue(
      company_id,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    ),
    getTotalRevenue(
      company_id,
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    ),
  ]);

  // Run demand prediction for every product
  const predictions = await Promise.all(
    products.map((p) => predictDemand(p.id, company_id))
  );

  for (const pred of predictions.filter(Boolean)) {
    const { product_name, current_stock, predicted_sales_next_7_days, days_until_stockout } = pred;

    // Rule 1 — Critical: runs out within 3 days
    if (days_until_stockout !== null && days_until_stockout <= 3) {
      insights.push({
        severity: SEVERITY.CRITICAL,
        type: "stockout_imminent",
        product: product_name,
        message: `"${product_name}" will run out of stock in ${days_until_stockout} day(s). Only ${current_stock} units left.`,
        recommendation: `Restock immediately. Predicted demand: ${predicted_sales_next_7_days} units this week.`,
      });
    }
    // Rule 2 — Warning: runs out within 7 days
    else if (days_until_stockout !== null && days_until_stockout <= 7) {
      insights.push({
        severity: SEVERITY.WARNING,
        type: "stockout_soon",
        product: product_name,
        message: `"${product_name}" may run out in ${days_until_stockout} day(s). ${current_stock} units remaining.`,
        recommendation: `Consider restocking soon. Predicted demand: ${predicted_sales_next_7_days} units this week.`,
      });
    }

    // Rule 3 — Info: stock is low (under 10 units) but no prediction data
    if (current_stock <= 10 && days_until_stockout === null) {
      insights.push({
        severity: SEVERITY.WARNING,
        type: "low_stock",
        product: product_name,
        message: `"${product_name}" has low stock (${current_stock} units) with no recent sales data to predict demand.`,
        recommendation: "Monitor stock levels and consider restocking.",
      });
    }

    // Rule 4 — Info: overstocked (stock > 10x weekly demand)
    if (predicted_sales_next_7_days > 0 && current_stock > predicted_sales_next_7_days * 10) {
      insights.push({
        severity: SEVERITY.INFO,
        type: "overstocked",
        product: product_name,
        message: `"${product_name}" appears overstocked. ${current_stock} units on hand vs predicted ${predicted_sales_next_7_days} units/week.`,
        recommendation: "Consider running a promotion or reducing reorder quantities.",
      });
    }
  }

  // Rule 5 & 6 — Sales trend insights per product
  for (const row of salesTrend) {
    const last = parseInt(row.last_7_days);
    const prev = parseInt(row.prev_7_days);

    if (prev > 0 && last > prev * 1.5) {
      insights.push({
        severity: SEVERITY.POSITIVE,
        type: "sales_rising",
        product: row.name,
        message: `"${row.name}" sales are up ${Math.round(((last - prev) / prev) * 100)}% this week vs last week.`,
        recommendation: "Ensure sufficient stock to meet growing demand.",
      });
    } else if (last === 0 && prev > 0) {
      insights.push({
        severity: SEVERITY.WARNING,
        type: "dead_stock",
        product: row.name,
        message: `"${row.name}" had no sales in the past 7 days (sold ${prev} units the week before).`,
        recommendation: "Consider a discount or promotion to move this product.",
      });
    } else if (prev > 0 && last < prev * 0.5) {
      insights.push({
        severity: SEVERITY.INFO,
        type: "sales_declining",
        product: row.name,
        message: `"${row.name}" sales dropped ${Math.round(((prev - last) / prev) * 100)}% this week vs last week.`,
        recommendation: "Investigate the cause — pricing, competition, or seasonality.",
      });
    }
  }

  // Rule 7 — Revenue comparison: this week vs last week
  const thisWeek = parseFloat(revenueThisWeek.total_revenue);
  const lastWeek = parseFloat(revenueLastWeek.total_revenue);

  if (lastWeek > 0 && thisWeek > lastWeek * 1.2) {
    insights.push({
      severity: SEVERITY.POSITIVE,
      type: "revenue_up",
      product: null,
      message: `Overall revenue is up ${Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}% this week compared to last week.`,
      recommendation: "Great performance — keep up current sales momentum.",
    });
  } else if (lastWeek > 0 && thisWeek < lastWeek * 0.8) {
    insights.push({
      severity: SEVERITY.WARNING,
      type: "revenue_down",
      product: null,
      message: `Overall revenue dropped ${Math.round(((lastWeek - thisWeek) / lastWeek) * 100)}% this week compared to last week.`,
      recommendation: "Review recent orders and identify underperforming products.",
    });
  }

  // Rule 8 — No sales at all
  if (thisWeek === 0) {
    insights.push({
      severity: SEVERITY.INFO,
      type: "no_recent_sales",
      product: null,
      message: "No orders have been placed in the past 7 days.",
      recommendation: "Consider running a promotion or reviewing your product listings.",
    });
  }

  // Sort: critical first, then warning, then info, then positive
  const order = { critical: 0, warning: 1, info: 2, positive: 3 };
  insights.sort((a, b) => order[a.severity] - order[b.severity]);

  return insights;
};

module.exports = { generateInsights };
