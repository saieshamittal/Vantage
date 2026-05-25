const { generateAlerts } = require("../services/alertsService");

// GET /api/alerts
// Returns all active alerts for the company, sorted by severity
const getAlerts = async (req, res) => {
  const { company_id } = req.user;

  try {
    const alerts = await generateAlerts(company_id);
    res.json({
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      alerts,
    });
  } catch (err) {
    console.error("Alerts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAlerts };
