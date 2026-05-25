const pool = require("../config/db");

// Get all orders for a company
const getOrders = async (company_id) => {
  const result = await pool.query(
    `SELECT orders.*, products.name AS product_name
     FROM orders
     LEFT JOIN products ON orders.product_id = products.id
     WHERE orders.company_id = $1
     ORDER BY orders.created_at DESC`,
    [company_id]
  );
  return result.rows;
};

// Get a single order by id, scoped to the company
const getOrderById = async (id, company_id) => {
  const result = await pool.query(
    `SELECT orders.*, products.name AS product_name
     FROM orders
     LEFT JOIN products ON orders.product_id = products.id
     WHERE orders.id = $1 AND orders.company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

// Create an order
const createOrder = async (product_id, quantity, total_price, company_id) => {
  const result = await pool.query(
    `INSERT INTO orders (product_id, quantity, total_price, company_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [product_id, quantity, total_price, company_id]
  );
  return result.rows[0];
};

// Deduct stock from a product (called inside a transaction)
const deductStock = async (client, product_id, quantity, company_id) => {
  const result = await client.query(
    `UPDATE products
     SET stock = stock - $1
     WHERE id = $2 AND company_id = $3 AND stock >= $1
     RETURNING *`,
    [quantity, product_id, company_id]
  );
  return result.rows[0];
};

module.exports = { getOrders, getOrderById, createOrder, deductStock };
