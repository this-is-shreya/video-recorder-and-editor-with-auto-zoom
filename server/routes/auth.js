const { authenticate } = require("../controllers/auth");

const authRouter = require("express").Router();

authRouter.post("/", authenticate);

module.exports = authRouter;