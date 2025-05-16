const { execFile } = require("child_process");
const pool = require("../model/config");
const { extractAudio } = require("../utils/downloadFile");
const fs = require("fs");

module.exports.generateSubtitles = async (req, res) => {
  try {
    const audioPath = req.body.audioPath;

    if (!fs.existsSync(path.join(__dirname, audioPath))) {
      return res.status(404).json({ error: "Audio file not found" });
    }

    execFile(
      "python",
      ["../script/vosk_service.py", "." + audioPath],
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
          fs.unlinkSync(path.join(__dirname, audioPath));

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
    const audioPath = path.join(__dirname, "temp", `${Date.now()}.wav`);
    console.log("Sending audio URL:", audioPath);
    // Make sure temp directory exists
    if (!fs.existsSync(path.join(__dirname, "temp"))) {
      fs.mkdirSync(path.join(__dirname, "temp"));
    }

    // Extract audio from video
    await extractAudio(videoPath, audioPath);

    // Send the extracted audio file back to the client for browser-based speech recognition
    res.json({
      success: true,
      audioUrl: `/temp/${path.basename(audioPath)}`, // URL to access the audio file
    });

    // Cleanup will happen later through a separate endpoint
    cleanup(audioPath, videoPath);
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).json({ error: "Error processing video" });
  }
};

module.exports.saveData = async (req, res) => {
  try {
    let {
      source_and_timing,
      effects_and_timing,
      project_id,
      project_title,
      elements,
      positions,
    } = req.body;

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
      const query = `INSERT INTO projects (source_and_timing, effects_and_timing, project_id, email, project_title, elements, positions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

      const values = [
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
      console.log("THIS IS THE PROJECT", project);

      return res.status(200).json(project);
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

  const query = `DELETE FROM projects WHERE project_id = $1 AND email = $2`;

  try {
    const result = await pool.query(query, [id, userEmail]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    return res.status(200).json({ message: "Project deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.getAllProjects = async (req, res) => {
  const query = `SELECT * FROM projects WHERE email = $1`;
  try {
    const result = await pool.query(query, [
      req.user.emailAddresses[0].emailAddress,
    ]);
    console.log("RESULT", result.rows, req.user.emailAddresses[0].emailAddress);
    if (result.rows.length > 0) {
      return res.json(result.rows);
    } else {
      return res.status(404).json({ error: "No projects found" });
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    return res.status(500).json({ error: "Failed to fetch project data" });
  }
};

module.exports.feedback = async (req, res) => {
  const query = `INSERT INTO FEEDBACK(feedback, email) VALUES($1, $2)`;
  console.log("body is ", req.body);

  const { feedback } = req.body;
  console.log("FEEDBACK RECEIVED: ", feedback);

  const values = [feedback, req.user.emailAddresses[0].emailAddress];

  try {
    await pool.query(query, values);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Failed to save feedback" });
  }
};

// Route to clean up files after processing
const cleanup = (audioPath, videoPath) => {
  if (audioPath && fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath);
  }

  if (videoPath && fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
  }

  res.json({ success: true });
};
