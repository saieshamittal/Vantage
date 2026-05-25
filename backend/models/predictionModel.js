const pool = require("../config/db");

// Get weekly sales totals for a product over the past N weeks
const getWeeklySales = async (product_id, company_id, weeks = 6) => {
  const result = await pool.query(
    `SELECT
       FLOOR(EXTRACT(EPOCH FROM (NOW() - created_at)) / 604800)::int AS weeks_ago,
       COALESCE(SUM(quantity), 0) AS total_sold
     FROM orders
     WHERE product_id = $1 AND company_id = $2
       AND created_at >= NOW() - ($3 * INTERVAL '1 week')
     GROUP BY weeks_ago
     ORDER BY weeks_ago ASC`,
    [product_id, company_id, weeks]
  );
  return result.rows;
};

// Get current stock for a product
const getProductStock = async (product_id, company_id) => {
  const result = await pool.query(
    "SELECT stock, name, price FROM products WHERE id = $1 AND company_id = $2",
    [product_id, company_id]
  );
  return result.rows[0];
};

// Get all products for a company (for bulk prediction)
const getAllProductIds = async (company_id) => {
  const result = await pool.query(
    "SELECT id, name, stock FROM products WHERE company_id = $1",
    [company_id]
  );
  return result.rows;
};

module.exports = { getWeeklySales, getProductStock, getAllProductIds };
