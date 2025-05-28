const { clerkMiddleware } = require("@clerk/express");
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./model/config");
const app = express();
app.use(cors());
app.use(express.json({ limit: "100gb" }));
app.use(express.urlencoded({ limit: "100gb", extended: true }));
app.use(clerkMiddleware());
// In your Node.js backend (e.g., server.js or routes/subtitles.js)
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const exportRouter = require("./routes/export");

app.use(
  "/temp",
  (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "credentialless");
    next();
  },
  express.static(path.join(__dirname, "temp"))
);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/export", exportRouter);
app.use((req, res) => {
  res.status(404).send("Not Found");
});

const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL,
  name TEXT NOT NULL,
  num_exports INT DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  plan VARCHAR(255) DEFAULT 'free',
  can_export BOOLEAN DEFAULT FALSE,
  last_paid TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`;

const createTableQuery = `
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_and_timing JSON NOT NULL,
  effects_and_timing JSON NOT NULL,
  elements JSON NOT NULL,
  positions JSON NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_title TEXT NOT NULL,
  is_exported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
const createMediaTableQuery = `
CREATE TABLE IF NOT EXISTS media_store (
  id text PRIMARY KEY,
  mimetype TEXT,
  buffer TEXT
);
`;
const createFeedbackTableQuery = `
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback TEXT,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
(async () => {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`); // for gen_random_uuid()
  await pool.query(createTableQuery);
  await pool.query(createMediaTableQuery);
  await pool.query(createFeedbackTableQuery);
  await pool.query(createUserTableQuery);
  console.log("Table created");
})();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
