const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { getInsights } = require("../controllers/insightsController");

router.get("/", protect, roleCheck("admin", "company"), getInsights);

module.exports = router;
