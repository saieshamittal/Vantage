const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST /api/auth/register — create a new company + tenant admin user
router.post("/register", register);

// POST /api/auth/login — authenticate and receive a JWT
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
