const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const {
  listCompanies,
  addCompany,
  editCompany,
  removeCompany,
  listUsers,
  addUser,
  editUser,
  removeUser,
  platformStats,
  companyStats,
} = require("../controllers/adminController");

// All admin routes require a valid JWT AND the admin role
router.get("/companies", protect, roleCheck("admin"), listCompanies);
router.post("/companies", protect, roleCheck("admin"), addCompany);
router.put("/companies/:id", protect, roleCheck("admin"), editCompany);
router.delete("/companies/:id", protect, roleCheck("admin"), removeCompany);
router.get("/users", protect, roleCheck("admin"), listUsers);
router.post("/users", protect, roleCheck("admin"), addUser);
router.put("/users/:id", protect, roleCheck("admin"), editUser);
router.delete("/users/:id", protect, roleCheck("admin"), removeUser);
router.get("/stats", protect, roleCheck("admin"), platformStats);
router.get("/company-stats", protect, roleCheck("admin"), companyStats);

module.exports = router;
