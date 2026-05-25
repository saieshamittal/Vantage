const { generateInsights } = require("../services/insightsService");

// GET /api/insights
// Returns all AI-generated insights for the company
const getInsights = async (req, res) => {
  const { company_id } = req.user;

  try {
    const insights = await generateInsights(company_id);
    res.json({
      total: insights.length,
      insights,
    });
  } catch (err) {
    console.error("Insights error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getInsights };
