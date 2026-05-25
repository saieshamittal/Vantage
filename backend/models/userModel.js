const pool = require("../config/db");

// Find a user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT users.*, companies.name AS company, companies.website, companies.address
     FROM users
     LEFT JOIN companies ON users.company_id = companies.id
     WHERE users.email = $1`,
    [email]
  );
  return result.rows[0];
};

// Find a user by id
const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT users.id, users.name, users.email, users.role, users.company_id, users.phone, users.location,
            users.notification_settings, companies.name AS company, companies.website, companies.address
     FROM users
     LEFT JOIN companies ON users.company_id = companies.id
     WHERE users.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Create a new user
const createUser = async (name, email, hashedPassword, role, company_id) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id, phone, location, notification_settings",
    [name, email, hashedPassword, role, company_id]
  );
  return result.rows[0];
};

// Create a new company
const createCompany = async (name) => {
  const result = await pool.query(
    "INSERT INTO companies (name) VALUES ($1) RETURNING *",
    [name]
  );
  return result.rows[0];
};

const updateUserProfile = async (id, fields) => {
  const { name, email, phone, location, notification_settings } = fields;
  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         email = $2,
         phone = $3,
         location = $4,
         notification_settings = $5
     WHERE id = $6
     RETURNING id, name, email, role, company_id, phone, location, notification_settings`,
    [name, email, phone || null, location || null, notification_settings || {}, id]
  );
  return result.rows[0];
};

const updateCompanyProfile = async (id, fields) => {
  const { name, website, address } = fields;
  const result = await pool.query(
    `UPDATE companies
     SET name = $1,
         website = $2,
         address = $3
     WHERE id = $4
     RETURNING *`,
    [name, website || null, address || null, id]
  );
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  createCompany,
  updateUserProfile,
  updateCompanyProfile,
};
