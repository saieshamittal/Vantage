const bcrypt = require("bcryptjs");
const { findUserByEmail, createUser } = require("../models/userModel");

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@vantage.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin";

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await findUserByEmail(DEFAULT_ADMIN_EMAIL);

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await createUser(
      DEFAULT_ADMIN_NAME,
      DEFAULT_ADMIN_EMAIL,
      hashedPassword,
      "admin",
      null
    );

    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
  } catch (err) {
    console.error("Default admin bootstrap error:", err.message);
  }
};

module.exports = { ensureDefaultAdmin };
