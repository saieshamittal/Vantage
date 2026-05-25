const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const {
  revenueStats,
  revenueOverTime,
  topProducts,
  salesTrend,
} = require("../controllers/analyticsController");

router.get("/revenue", protect, roleCheck("admin", "company"), revenueStats);
router.get("/revenue-over-time", protect, roleCheck("admin", "company"), revenueOverTime);
router.get("/top-products", protect, roleCheck("admin", "company"), topProducts);
router.get("/sales-trend", protect, roleCheck("admin", "company"), salesTrend);

module.exports = router;
