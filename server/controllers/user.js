const { execFile } = require("child_process");
const pool = require("../model/config");
const { extractAudio } = require("../utils/downloadFile");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");
const {
  decryptData,
  encryptData,
  sendEncryptedResponse,
} = require("../utils/crypto");
const { v4: uuidv4 } = require("uuid");

module.exports.checkProject = async (req, res) => {
  try {
    const { projectId, email } = req.body;
    console.log("RECEIVEEDD", req.body);

    const getQuery = `SELECT * FROM projects where project_id = $1 AND email = $2`;
    const result = await pool.query(getQuery, [projectId, email]);
    console.log("ROWS-->", result.rows.length, result.rowCount);

    if (result.rows.length > 0) {
      return res.status(200).json({ projectExists: true });
    } else {
      return res.status(200).json({ projectExists: false });
    }
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports.generateSubtitles = async (req, res) => {
  try {
    console.log("ENTERED FOR GEN SUB");

    const audioPath = req.body.audioPath;
    console.log(audioPath);
    const audioFilePath = path.join(__dirname, ".." + audioPath);
    if (!fs.existsSync(audioFilePath)) {
      console.log(path.join(__dirname, ".." + audioPath));

      return res.status(404).json({ error: "Audio file not found" });
    }

    execFile(
      "python",
      ["../server/script/vosk_service.py", "." + audioPath],
      (err, stdout, stderr) => {
        if (err) {
          console.error("Python error:", err);
          return res.status(500).json({ error: "Python execution failed" });
        }

        try {
          const lines = stdout.trim().split("\n");
          const lastLine = lines[lines.length - 1];
          const transcript = JSON.parse(lastLine);
          console.log("TRANSCRIPT IS ", transcript);
          //cleanup
          console.log("AUDIO FILE PATH", audioFilePath);

          if (audioFilePath && fs.existsSync(audioFilePath)) {
            fs.unlinkSync(audioFilePath);
          }
          return res.json({ success: true, subtitles: transcript });
        } catch (parseErr) {
          console.error("Parsing error:", parseErr, "Output:", stdout);
          return res.status(500).json({ error: "Failed to parse transcript" });
        }
      }
    );
  } catch (err) {
    console.error("Subtitle generation error:", err);
    return res.status(500).json({ error: "Subtitle generation failed" });
  }
};

module.exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoPath = req.file.path;
    const audioPath = path.join(__dirname, "../temp", `${Date.now()}.wav`);
    console.log("Sending audio URL:", audioPath);
    // Make sure temp directory exists
    if (!fs.existsSync(path.join(__dirname, "../temp"))) {
      fs.mkdirSync(path.join(__dirname, "../temp"));
      console.log(path.join(__dirname, "../temp"));
    }

    // Extract audio from video
    await extractAudio(videoPath, audioPath);
    console.log("EXTRACTED AUDIO");

    // Send the extracted audio file back to the client for browser-based speech recognition
    res.json({
      success: true,
      audioUrl: `/temp/${path.basename(audioPath)}`, // URL to access the audio file
    });

    // Cleanup will happen later through a separate endpoint
    cleanup(videoPath);
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).json({ error: "Error processing video" });
  }
};

module.exports.saveData = async (req, res) => {
  try {
    console.log("entered save data", req.body);

    // const decrypted = decryptData(req.body.encryptedData);
    // let {
    //   source_and_timing,
    //   effects_and_timing,
    //   project_id,
    //   project_title,
    //   elements,
    //   positions,
    // } = decrypted;

    let {
      source_and_timing,
      effects_and_timing,
      project_id,
      project_title,
      elements,
      positions,
    } = req.body.data;

    console.log(
      "RECEIVED",
      source_and_timing,
      effects_and_timing,
      project_id,
      project_title,
      elements,
      positions
    );

    const getQuery = `SELECT * FROM projects where project_id = $1`;
    const getResult = await pool.query(getQuery, [project_id]);

    if (getResult.rows.length > 0) {
      const updateQuery = `UPDATE projects SET source_and_timing = $1, effects_and_timing = $2, elements = $3, positions = $4, project_title = $5 WHERE project_id = $6`;
      const updateValues = [
        JSON.stringify(source_and_timing),
        JSON.stringify(effects_and_timing),
        JSON.stringify(elements),
        JSON.stringify(positions),
        project_title,
        project_id,
      ];

      await pool.query(updateQuery, updateValues);
      return res.status(200).json({ success: true, id: project_id });
    } else {
      const query = `INSERT INTO projects (id, source_and_timing, effects_and_timing, project_id, email, project_title, elements, positions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      const id = uuidv4(); // Generate a new UUID
      const values = [
        id,
        JSON.stringify(source_and_timing),
        JSON.stringify(effects_and_timing),
        project_id,
        req.user.emailAddresses[0].emailAddress,
        project_title,
        JSON.stringify(elements),
        JSON.stringify(positions),
      ];

      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, id: result.rows[0].id });
    }
  } catch (error) {
    console.error("Error saving or updating data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getParticularDBMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM media_store WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Media not found");
    }
    const base64Data = result.rows[0].buffer; // e.g., 'AAAAGGZ0eXB...'
    const base64 = base64Data.split(",")[1]; // Extract base64 part
    if (!base64) {
      return res.status(404).send("Media not found");
    }
    const mimeType = result.rows[0].mimetype; // Extract MIME type
    const buffer = Buffer.from(base64, "base64");
    res.setHeader("Content-Type", mimeType);

    return res.send(buffer);
  } catch (err) {
    console.error("DB media fetch error:", err);
    return res.status(500).send("Error fetching media");
  }
};

module.exports.getParticularProject = async (req, res) => {
  const { id } = req.params;
  console.log("entered here ", id);

  const query = `SELECT * FROM projects WHERE project_id = $1 AND email = $2`;
  // console.log(query, id);

  try {
    const result = await pool.query(query, [
      id,
      req.user.emailAddresses[0].emailAddress,
    ]);
    console.log("result", result.rows);

    if (result.rows.length > 0) {
      let project = result.rows[0];
      let source_and_timing = project.source_and_timing;
      if (source_and_timing && source_and_timing.length !== 0) {
        source_and_timing = await Promise.all(
          source_and_timing.map(async (item) => {
            const getQuery = `SELECT * FROM media_store WHERE id = $1`;
            const getResult = await pool.query(getQuery, [item.id]);
            if (getResult.rows.length > 0) {
              return item;
            }
            const mimeType = item.source.split(";")[0].split(":")[1]; // Extract MIME type
            const query = `INSERT INTO media_store (id, mimetype, buffer) VALUES ($1, $2, $3)`;
            await pool.query(query, [item.id, mimeType, item.source]);
            item.source = `${process.env.SERVER_URL}/db-media/${item.id}`;
            return item;
          })
        );
      }
      project.source_and_timing = source_and_timing;
      // sendEncryptedResponse(res, { data: project });
      return res.status(200).json({ data: project });
    } else {
      return res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    return res.status(500).json({ error: "Failed to fetch project data" });
  }
};

module.exports.deleteParticularProject = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.emailAddresses[0].emailAddress;

  console.log("Attempting to delete project:", id);
  const projectGetQuery = `SELECT * FROM projects WHERE project_id = $1 AND email = $2`;
  const projectDeleteQuery = `DELETE FROM projects WHERE project_id = $1 AND email = $2`;
  const mediaQuery = `DELETE FROM media_store WHERE id = $1`;
  try {
    const result = await pool.query(projectGetQuery, [id, userEmail]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }
    let project = result.rows[0];
    let source_and_timing = project.source_and_timing;
    if (source_and_timing && source_and_timing.length !== 0) {
      source_and_timing.forEach(async (item) => {
        try {
          await pool.query(mediaQuery, [item.id]);
        } catch (error) {
          console.error("Error deleting media:", error);
          return res.status(500).json({ message: "Error deleting media" });
        }
      });
    }
    try {
      await pool.query(projectDeleteQuery, [id, userEmail]);
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(500).json({ message: "Error deleting project" });
    }

    return res
      .status(200)
      .json({ message: "Project and media deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.getAllProjects = async (req, res) => {
  const query = `SELECT project_id, project_title, created_at FROM projects WHERE email = $1`;
  try {
    const result = await pool.query(query, [
      req.user.emailAddresses[0].emailAddress,
    ]);
    console.log("RESULT", result.rows, req.user.emailAddresses[0].emailAddress);
    if (result.rows.length > 0) {
      sendEncryptedResponse(res, { result: result.rows });
    } else {
      return res.status(404).json({ error: "No projects found" });
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    return res.status(500).json({ error: "Failed to fetch project data" });
  }
};

module.exports.feedback = async (req, res) => {
  const query = `INSERT INTO FEEDBACK(id, feedback, email) VALUES($1, $2, $3)`;
  console.log("body is ", req.body);

  const { feedback } = req.body;
  console.log("FEEDBACK RECEIVED: ", feedback);
  const id = uuidv4(); // Generate a new UUID for the feedback entry
  if (!feedback || feedback.trim() === "") {
    return res.status(400).json({ error: "Feedback cannot be empty" });
  }
  const values = [id, feedback, req.user.emailAddresses[0].emailAddress];

  try {
    await pool.query(query, values);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Failed to save feedback" });
  }
};
module.exports.checkAdmin = async (req, res) => {
  try {
    const email = req.user.emailAddresses[0].emailAddress;
    const query = `SELECT * FROM users where email = $1`;

    const result = await pool.query(query, [email]);

    return res.status(200).json({ isAdmin: result.rows[0].is_admin });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
module.exports.getNumUsers = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) FROM users AS count`;

    const result = await pool.query(query, []);
    return res.status(200).json({ numUsers: result.rows[0].count });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
module.exports.getNumExports = async (req, res) => {
  try {
    const query = `SELECT SUM(num_exports) AS total FROM users`;

    const result = await pool.query(query, []);
    console.log("RESULT", result);

    return res.status(200).json({ numExports: result.rows[0].total });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
module.exports.getFeedbacks = async (req, res) => {
  try {
    const query = `SELECT * FROM FEEDBACK ORDER BY created_at DESC LIMIT 10`;

    const result = await pool.query(query, []);
    return res.status(200).json({ feedbacks: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" + error });
  }
};
// Route to clean up files after processing
const cleanup = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
