const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const {
  getAllProducts,
  getOneProduct,
  addProduct,
  editProduct,
  removeProduct,
} = require("../controllers/productController");

// All product routes require a valid JWT
// roleCheck allows both company owners and admins
router.get("/", protect, roleCheck("admin", "company"), getAllProducts);
router.get("/:id", protect, roleCheck("admin", "company"), getOneProduct);
router.post("/", protect, roleCheck("admin", "company"), addProduct);
router.put("/:id", protect, roleCheck("admin", "company"), editProduct);
router.delete("/:id", protect, roleCheck("admin", "company"), removeProduct);

module.exports = router;
