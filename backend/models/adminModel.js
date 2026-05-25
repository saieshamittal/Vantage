const pool = require("../config/db");

const getCompanyColumnSet = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'companies'`
  );

  return new Set(result.rows.map((row) => row.column_name));
};

// Get all companies on the platform
const getAllCompanies = async () => {
  const columns = await getCompanyColumnSet();
  const hasEmail = columns.has("email");
  const hasPlan = columns.has("plan");
  const hasStatus = columns.has("status");
  const hasUsersCount = columns.has("users_count");
  const hasCreatedAt = columns.has("created_at");
  const groupByFields = ["companies.id", "companies.name"];

  if (hasEmail) groupByFields.push("companies.email");
  if (hasPlan) groupByFields.push("companies.plan");
  if (hasStatus) groupByFields.push("companies.status");
  if (hasUsersCount) groupByFields.push("companies.users_count");
  if (hasCreatedAt) groupByFields.push("companies.created_at");

  const result = await pool.query(
    `SELECT
       companies.id,
       companies.name,
       ${hasEmail ? "companies.email" : "NULL::text AS email"},
       ${hasPlan ? "companies.plan" : "'Starter'::text AS plan"},
       ${hasUsersCount ? "COALESCE(companies.users_count, COUNT(DISTINCT users.id))" : "COUNT(DISTINCT users.id)"} AS users_count,
       ${hasStatus ? "companies.status" : "'Active'::text AS status"},
       ${hasCreatedAt ? "companies.created_at" : "NULL::timestamp AS created_at"}
     FROM companies
     LEFT JOIN users ON users.company_id = companies.id
     GROUP BY ${groupByFields.join(", ")}
     ORDER BY ${hasCreatedAt ? "companies.created_at DESC" : "companies.id DESC"}`
  );
  return result.rows;
};

const createAdminCompany = async ({ name, email, plan, users_count, status }) => {
  const columns = await getCompanyColumnSet();
  const insertColumns = ["name"];
  const values = [name];

  if (columns.has("email")) {
    insertColumns.push("email");
    values.push(email || null);
  }

  if (columns.has("plan")) {
    insertColumns.push("plan");
    values.push(plan || "Starter");
  }

  if (columns.has("users_count")) {
    insertColumns.push("users_count");
    values.push(users_count ?? 0);
  }

  if (columns.has("status")) {
    insertColumns.push("status");
    values.push(status || "Active");
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ");
  const result = await pool.query(
    `INSERT INTO companies (${insertColumns.join(", ")})
     VALUES (${placeholders})
     RETURNING *`,
    values
  );

  return result.rows[0];
};

const updateAdminCompany = async (id, { name, email, plan, users_count, status }) => {
  const columns = await getCompanyColumnSet();
  const updates = ["name = $1"];
  const values = [name];

  if (columns.has("email")) {
    updates.push(`email = $${values.length + 1}`);
    values.push(email || null);
  }

  if (columns.has("plan")) {
    updates.push(`plan = $${values.length + 1}`);
    values.push(plan || "Starter");
  }

  if (columns.has("users_count")) {
    updates.push(`users_count = $${values.length + 1}`);
    values.push(users_count ?? 0);
  }

  if (columns.has("status")) {
    updates.push(`status = $${values.length + 1}`);
    values.push(status || "Active");
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE companies
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

const deleteAdminCompany = async (id) => {
  const result = await pool.query(
    `DELETE FROM companies
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

// Get all users across all companies
const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT users.id, users.name, users.email, users.role, users.company_id, users.created_at,
            companies.name AS company_name
     FROM users
     LEFT JOIN companies ON users.company_id = companies.id
     ORDER BY users.created_at DESC`
  );
  return result.rows;
};

const createAdminUser = async ({ name, email, hashedPassword, role, company_id }) => {
  const result = await pool.query(
    `WITH inserted_user AS (
       INSERT INTO users (name, email, password, role, company_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, company_id, created_at
     )
     SELECT inserted_user.id,
            inserted_user.name,
            inserted_user.email,
            inserted_user.role,
            inserted_user.company_id,
            inserted_user.created_at,
            companies.name AS company_name
     FROM inserted_user
     LEFT JOIN companies ON inserted_user.company_id = companies.id`,
    [name, email, hashedPassword, role, company_id]
  );

  return result.rows[0];
};

const updateAdminUser = async (id, { name, email, hashedPassword, role, company_id }) => {
  const updates = ["name = $1", "email = $2", "role = $3", "company_id = $4"];
  const values = [name, email, role, company_id];

  if (hashedPassword) {
    updates.push(`password = $${values.length + 1}`);
    values.push(hashedPassword);
  }

  values.push(id);

  const result = await pool.query(
    `WITH updated_user AS (
       UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, name, email, role, company_id, created_at
     )
     SELECT updated_user.id,
            updated_user.name,
            updated_user.email,
            updated_user.role,
            updated_user.company_id,
            updated_user.created_at,
            companies.name AS company_name
     FROM updated_user
     LEFT JOIN companies ON updated_user.company_id = companies.id`,
    values
  );

  return result.rows[0];
};

const deleteAdminUser = async (id) => {
  const result = await pool.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id, name, email, role, company_id, created_at`,
    [id]
  );

  return result.rows[0];
};

// Platform-wide stats
const getPlatformStats = async () => {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM companies) AS total_companies,
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM orders) AS total_orders,
       (SELECT COALESCE(SUM(total_price), 0) FROM orders) AS total_revenue,
       (SELECT COUNT(*) FROM products) AS total_products`
  );
  return result.rows[0];
};

// Per-company breakdown — products, orders, revenue
const getCompanyStats = async () => {
  const result = await pool.query(
    `SELECT
       companies.id,
       companies.name,
       companies.created_at,
       COUNT(DISTINCT products.id) AS total_products,
       COUNT(DISTINCT orders.id) AS total_orders,
       COALESCE(SUM(orders.total_price), 0) AS total_revenue
     FROM companies
     LEFT JOIN products ON products.company_id = companies.id
     LEFT JOIN orders ON orders.company_id = companies.id
     GROUP BY companies.id, companies.name, companies.created_at
     ORDER BY total_revenue DESC`
  );
  return result.rows;
};

module.exports = {
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
};
