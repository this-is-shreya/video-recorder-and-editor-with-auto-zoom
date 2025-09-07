const pool = require("../model/config");
const { v4: uuidv4 } = require("uuid");

module.exports.authenticate = async (req, res, next) => {
  
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await getUserInfo(req.headers.authorization)
    req.user = user;
    const getQuery = `SELECT * FROM USERS WHERE email=$1`;
    const result = await pool.query(getQuery, [
      user.email,
    ]);
    if (!result.rowCount || result.rowCount === 0) {
      const id = uuidv4();
      // console.log("USER-->", user);
      
      const query = `INSERT INTO users (id, email, name) VALUES ($1, $2, $3)`;
      const values = [
        id,
        user.email,
        `${user.name}`,
      ];
      await pool.query(query, values);
    }
    console.log("AUTHENTICATED");
    
    next();
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserInfo = async (accessToken) => {
  try {
    // console.log("ACCESS TOKEN->", accessToken);
    
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: accessToken,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }
};
