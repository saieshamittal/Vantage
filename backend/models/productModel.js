const pool = require("../config/db");

// Get all products for a company (with optional search and category filter)
const getProducts = async (company_id, search = "", category = "") => {
  let query = "SELECT * FROM products WHERE company_id = $1";
  const params = [company_id];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND name ILIKE $${params.length}`;
  }

  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

// Get a single product by id, scoped to the company
const getProductById = async (id, company_id) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1 AND company_id = $2",
    [id, company_id]
  );
  return result.rows[0];
};

// Create a new product
const createProduct = async (name, price, stock, category, company_id) => {
  const result = await pool.query(
    "INSERT INTO products (name, price, stock, category, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, price, stock, category, company_id]
  );
  return result.rows[0];
};

// Update a product — only if it belongs to the company
const updateProduct = async (id, company_id, fields) => {
  const { name, price, stock, category } = fields;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, price = $2, stock = $3, category = $4
     WHERE id = $5 AND company_id = $6
     RETURNING *`,
    [name, price, stock, category, id, company_id]
  );
  return result.rows[0];
};

// Delete a product — only if it belongs to the company
const deleteProduct = async (id, company_id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING *",
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
