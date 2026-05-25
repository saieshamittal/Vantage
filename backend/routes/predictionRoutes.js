const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { predictOne, predictAll } = require("../controllers/predictionController");

// Predict demand for all products
router.get("/", protect, roleCheck("admin", "company"), predictAll);

// Predict demand for a single product
router.get("/:product_id", protect, roleCheck("admin", "company"), predictOne);

module.exports = router;
