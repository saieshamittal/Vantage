const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const { getAllOrders, getOneOrder, placeOrder } = require("../controllers/orderController");

router.get("/", protect, roleCheck("admin", "company"), getAllOrders);
router.get("/:id", protect, roleCheck("admin", "company"), getOneOrder);
router.post("/", protect, roleCheck("admin", "company"), placeOrder);

module.exports = router;
