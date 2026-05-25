const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  findUserById,
  createUser,
  createCompany,
  updateUserProfile,
  updateCompanyProfile,
} = require("../models/userModel");

// Generate a JWT token for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
  phone: user.phone || "",
  location: user.location || "",
  company: user.company || "",
  website: user.website || "",
  address: user.address || "",
  notificationSettings: user.notification_settings || {},
});

// POST /api/auth/register
// Registers a new company + admin user in one step
const register = async (req, res) => {
  const { name, email, password, company_name } = req.body;

  if (!name || !email || !password || !company_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email is already taken
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create the company first
    const company = await createCompany(company_name);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user as 'company' role (tenant admin)
    const user = await createUser(name, email, hashedPassword, "company", company.id);

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: serializeUser(await findUserById(user.id)),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: serializeUser(await findUserById(user.id)),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: serializeUser(user) });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, phone, location, company, website, address, notificationSettings } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const existingUser = await findUserById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailOwner = await findUserByEmail(email);
    if (emailOwner && emailOwner.id !== req.user.id) {
      return res.status(409).json({ message: "Email already in use" });
    }

    await updateUserProfile(req.user.id, {
      name,
      email,
      phone,
      location,
      notification_settings: notificationSettings || {},
    });

    if (req.user.company_id) {
      await updateCompanyProfile(req.user.company_id, {
        name: company || existingUser.company || "Client Company",
        website,
        address,
      });
    }

    const refreshedUser = await findUserById(req.user.id);
    res.json({
      message: "Profile updated successfully",
      user: serializeUser(refreshedUser),
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getProfile, updateProfile };
