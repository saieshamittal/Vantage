const pool = require("../config/db");

// Total revenue for a company (optional date range)
const getTotalRevenue = async (company_id, from, to) => {
  let query = "SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM orders WHERE company_id = $1";
  const params = [company_id];

  if (from) {
    params.push(from);
    query += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    query += ` AND created_at <= $${params.length}`;
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

// Revenue grouped by day (for charting over time)
const getRevenueOverTime = async (company_id, from, to) => {
  let query = `
    SELECT
      DATE(created_at) AS date,
      COALESCE(SUM(total_price), 0) AS revenue,
      COUNT(*) AS order_count
    FROM orders
    WHERE company_id = $1
  `;
  const params = [company_id];

  if (from) {
    params.push(from);
    query += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    query += ` AND created_at <= $${params.length}`;
  }

  query += " GROUP BY DATE(created_at) ORDER BY date ASC";

  const result = await pool.query(query, params);
  return result.rows;
};

// Top selling products by quantity sold
const getTopProducts = async (company_id, limit = 5) => {
  const result = await pool.query(
    `SELECT
       products.id,
       products.name,
       products.category,
       SUM(orders.quantity) AS total_sold,
       SUM(orders.total_price) AS total_revenue
     FROM orders
     JOIN products ON orders.product_id = products.id
     WHERE orders.company_id = $1
     GROUP BY products.id, products.name, products.category
     ORDER BY total_sold DESC
     LIMIT $2`,
    [company_id, limit]
  );
  return result.rows;
};

// Sales trend: compare last 7 days vs the 7 days before that, per product
const getSalesTrend = async (company_id) => {
  const result = await pool.query(
    `SELECT
       products.id,
       products.name,
       COALESCE(SUM(CASE WHEN orders.created_at >= NOW() - INTERVAL '7 days' THEN orders.quantity ELSE 0 END), 0) AS last_7_days,
       COALESCE(SUM(CASE WHEN orders.created_at >= NOW() - INTERVAL '14 days'
                         AND orders.created_at < NOW() - INTERVAL '7 days'
                         THEN orders.quantity ELSE 0 END), 0) AS prev_7_days
     FROM products
     LEFT JOIN orders ON orders.product_id = products.id AND orders.company_id = $1
     WHERE products.company_id = $1
     GROUP BY products.id, products.name
     ORDER BY last_7_days DESC`,
    [company_id]
  );
  return result.rows;
};

module.exports = { getTotalRevenue, getRevenueOverTime, getTopProducts, getSalesTrend };
