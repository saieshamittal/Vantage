const { Pool } = require("pg");
require("dotenv").config();

// Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
  } else {
    console.log("Connected to PostgreSQL database");
    release();
  }
});

module.exports = pool;
