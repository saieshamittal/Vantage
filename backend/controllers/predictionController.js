const { getAllProductIds } = require("../models/predictionModel");
const { predictDemand } = require("../services/predictionService");

// GET /api/predictions/:product_id
// Predict demand for a single product
const predictOne = async (req, res) => {
  const { company_id } = req.user;
  const { product_id } = req.params;

  try {
    const result = await predictDemand(product_id, company_id);

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result);
  } catch (err) {
    console.error("Prediction error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/predictions
// Predict demand for all products in the company
const predictAll = async (req, res) => {
  const { company_id } = req.user;

  try {
    const products = await getAllProductIds(company_id);

    if (products.length === 0) {
      return res.json([]);
    }

    // Run predictions for all products in parallel
    const predictions = await Promise.all(
      products.map((p) => predictDemand(p.id, company_id))
    );

    // Sort by most urgent stockout first
    const sorted = predictions
      .filter(Boolean)
      .sort((a, b) => {
        if (a.days_until_stockout === null) return 1;
        if (b.days_until_stockout === null) return -1;
        return a.days_until_stockout - b.days_until_stockout;
      });

    res.json(sorted);
  } catch (err) {
    console.error("Predict all error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { predictOne, predictAll };
