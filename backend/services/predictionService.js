const { getWeeklySales, getProductStock } = require("../models/predictionModel");

// Weighted moving average — more recent weeks have higher weight
// e.g. for 3 weeks of data: weights are [1, 2, 3] (oldest to newest)
const weightedMovingAverage = (weeklySalesMap, totalWeeks) => {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const weeksAgo = totalWeeks - 1 - i; // 0 = current week, highest index = oldest
    const sold = weeklySalesMap[weeksAgo] || 0;
    const weight = i + 1; // older weeks get lower weight
    weightedSum += sold * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
};

// Core prediction function for a single product
const predictDemand = async (product_id, company_id) => {
  const WEEKS = 6;

  const [salesRows, product] = await Promise.all([
    getWeeklySales(product_id, company_id, WEEKS),
    getProductStock(product_id, company_id),
  ]);

  if (!product) return null;

  // Build a map of { weeks_ago: total_sold }
  const weeklySalesMap = {};
  for (const row of salesRows) {
    weeklySalesMap[row.weeks_ago] = parseInt(row.total_sold);
  }

  // Predicted sales for next 7 days
  const avgWeeklySales = weightedMovingAverage(weeklySalesMap, WEEKS);
  const predictedNext7Days = Math.round(avgWeeklySales);

  // Days until stock runs out based on daily burn rate
  const dailyRate = avgWeeklySales / 7;
  const daysUntilStockout =
    dailyRate > 0 ? Math.floor(product.stock / dailyRate) : null;

  return {
    product_id: parseInt(product_id),
    product_name: product.name,
    current_stock: product.stock,
    predicted_sales_next_7_days: predictedNext7Days,
    avg_weekly_sales: parseFloat(avgWeeklySales.toFixed(2)),
    days_until_stockout: daysUntilStockout,
    weeks_of_data_used: salesRows.length,
  };
};

module.exports = { predictDemand };
