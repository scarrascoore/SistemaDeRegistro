const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error.message);
});

async function testConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT NOW() AS current_time");
    console.log("PostgreSQL connected:", result.rows[0].current_time);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testConnection
};