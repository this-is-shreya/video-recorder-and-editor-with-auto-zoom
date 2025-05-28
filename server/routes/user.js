const { authenticate } = require("../controllers/auth");
const {
  generateSubtitles,
  uploadVideo,
  saveData,
  getParticularDBMedia,
  getParticularProject,
  getAllProjects,
  feedback,
  deleteParticularProject,
  checkProject,
  checkAdmin,
  getNumUsers,
  getNumExports,
  getFeedbacks,
} = require("../controllers/user");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const userRouter = require("express").Router();

userRouter.get("/db-media/:id", authenticate, getParticularDBMedia);
userRouter.get("/project/:id", authenticate, getParticularProject);
userRouter.get("/projects", authenticate, getAllProjects);
userRouter.get("/num-users", authenticate, getNumUsers);
userRouter.get("/num-exports", authenticate, getNumExports);
userRouter.get("/feedbacks", authenticate, getFeedbacks);

userRouter.post("/generate-subtitles", authenticate, generateSubtitles);
userRouter.post(
  "/upload-video",
  authenticate,
  upload.single("video"),
  uploadVideo
);
userRouter.post("/save-data", authenticate, saveData);
userRouter.post("/feedback", authenticate, feedback);
userRouter.post("/check-project", checkProject);
userRouter.post("/check-admin", authenticate, checkAdmin)

userRouter.delete("/project/:id", authenticate, deleteParticularProject);

module.exports = userRouter;
