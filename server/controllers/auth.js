const { clerkClient, getAuth } = require("@clerk/express");
const pool = require("../model/config");

module.exports.authenticate = async (req, res, next) => {
  const auth = getAuth(req); // This reads the token from headers (e.g., Authorization Bearer)

  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await clerkClient.users.getUser(auth.userId);
    req.user = user;
    console.log("USER IS", user);
    const getQuery = `SELECT * FROM USERS WHERE email=$1`;
    const result = await pool.query(getQuery, [
      user.emailAddresses[0].emailAddress,
    ]);
    if (!result.rowCount || result.rowCount === 0) {
      const query = `INSERT INTO users (email, name) VALUES ($1, $2)`;
      const values = [
        user.emailAddresses[0].emailAddress,
        `${user.firstName} ${user.lastName}`,
      ];
      await pool.query(query, values);
    }
    res.status(200).json({ message: "User authenticated" });
    next()
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
