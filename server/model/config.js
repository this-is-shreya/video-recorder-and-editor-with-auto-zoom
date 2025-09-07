const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // or your DB server address
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // default PostgreSQL port
});


module.exports = pool;