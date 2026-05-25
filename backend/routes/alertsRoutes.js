const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { getAlerts } = require("../controllers/alertsController");

router.get("/", protect, roleCheck("admin", "company"), getAlerts);

module.exports = router;
