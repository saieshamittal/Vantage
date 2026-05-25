const bcrypt = require("bcryptjs");
const { findUserByEmail } = require("../models/userModel");
const {
  getAllCompanies,
  createAdminCompany,
  updateAdminCompany,
  deleteAdminCompany,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getPlatformStats,
  getCompanyStats,
} = require("../models/adminModel");

// GET /api/admin/companies
// All companies registered on the platform
const listCompanies = async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.json(companies);
  } catch (err) {
    console.error("Admin list companies error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/companies
const addCompany = async (req, res) => {
  try {
    const { name, email, plan, users_count, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const company = await createAdminCompany({
      name: name.trim(),
      email: email?.trim().toLowerCase() || null,
      plan,
      users_count,
      status,
    });

    res.status(201).json(company);
  } catch (err) {
    console.error("Admin add company error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/companies/:id
const editCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, plan, users_count, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const company = await updateAdminCompany(id, {
      name: name.trim(),
      email: email?.trim().toLowerCase() || null,
      plan,
      users_count,
      status,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (err) {
    console.error("Admin edit company error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/companies/:id
const removeCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await deleteAdminCompany(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted", company });
  } catch (err) {
    console.error("Admin delete company error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users
// All users across all companies
const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Admin list users error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/users
const addUser = async (req, res) => {
  try {
    const { name, email, password, role, company_id } = req.body;
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const selectedRole = role || "company";
    const selectedCompanyId = selectedRole === "admin" ? null : company_id;

    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!["admin", "company"].includes(selectedRole)) {
      return res.status(400).json({ message: "Role must be admin or company" });
    }

    if (selectedRole === "company" && !selectedCompanyId) {
      return res.status(400).json({ message: "Company is required for company users" });
    }

    const existingUser = await findUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createAdminUser({
      name: trimmedName,
      email: trimmedEmail,
      hashedPassword,
      role: selectedRole,
      company_id: selectedCompanyId,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Admin add user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/users/:id
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, company_id } = req.body;
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const selectedRole = role || "company";
    const selectedCompanyId = selectedRole === "admin" ? null : company_id;

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!["admin", "company"].includes(selectedRole)) {
      return res.status(400).json({ message: "Role must be admin or company" });
    }

    if (selectedRole === "company" && !selectedCompanyId) {
      return res.status(400).json({ message: "Company is required for company users" });
    }

    const existingUser = await findUserByEmail(trimmedEmail);
    if (existingUser && Number(existingUser.id) !== Number(id)) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const user = await updateAdminUser(id, {
      name: trimmedName,
      email: trimmedEmail,
      hashedPassword,
      role: selectedRole,
      company_id: selectedCompanyId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Admin edit user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/users/:id
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await deleteAdminUser(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user });
  } catch (err) {
    console.error("Admin delete user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/stats
// Platform-wide totals
const platformStats = async (req, res) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (err) {
    console.error("Admin platform stats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/company-stats
// Per-company breakdown
const companyStats = async (req, res) => {
  try {
    const stats = await getCompanyStats();
    res.json(stats);
  } catch (err) {
    console.error("Admin company stats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
