const {
  getTotalRevenue,
  getRevenueOverTime,
  getTopProducts,
  getSalesTrend,
} = require("../models/analyticsModel");

// GET /api/analytics/revenue
// Optional query params: ?from=2026-01-01&to=2026-04-16
const revenueStats = async (req, res) => {
  const { company_id } = req.user;
  const { from, to } = req.query;

  try {
    const data = await getTotalRevenue(company_id, from, to);
    res.json(data);
  } catch (err) {
    console.error("Revenue stats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analytics/revenue-over-time
// Optional query params: ?from=2026-01-01&to=2026-04-16
const revenueOverTime = async (req, res) => {
  const { company_id } = req.user;
  const { from, to } = req.query;

  try {
    const data = await getRevenueOverTime(company_id, from, to);
    res.json(data);
  } catch (err) {
    console.error("Revenue over time error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analytics/top-products
// Optional query param: ?limit=5
const topProducts = async (req, res) => {
  const { company_id } = req.user;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const data = await getTopProducts(company_id, limit);
    res.json(data);
  } catch (err) {
    console.error("Top products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analytics/sales-trend
const salesTrend = async (req, res) => {
  const { company_id } = req.user;

  try {
    const data = await getSalesTrend(company_id);

    // Add a human-readable trend label to each product
    const withTrend = data.map((row) => {
      const last = parseInt(row.last_7_days);
      const prev = parseInt(row.prev_7_days);
      let trend = "stable";
      if (prev === 0 && last > 0) trend = "new";
      else if (last > prev) trend = "rising";
      else if (last < prev) trend = "declining";

      return { ...row, trend };
    });

    res.json(withTrend);
  } catch (err) {
    console.error("Sales trend error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { revenueStats, revenueOverTime, topProducts, salesTrend };
