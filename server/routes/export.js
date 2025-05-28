const { processUsingFfmpeg } = require("../controllers/export");
const { authenticate } = require("../controllers/auth");
const exportRouter = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

exportRouter.post(
  "/process-video",
  authenticate,
  upload.single("video"),
  processUsingFfmpeg
);

module.exports = exportRouter;
