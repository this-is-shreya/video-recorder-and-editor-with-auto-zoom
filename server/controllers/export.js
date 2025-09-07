const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
ffmpeg.setFfmpegPath(ffmpegPath);
const pool = require("../model/config");

module.exports.processUsingFfmpeg = async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    inputPath = req.file.path;
    const outputFilename = `processed-${uuidv4()}.webm`;
    outputPath = path.join(__dirname, "..", "temp", outputFilename);

    console.log("Input path:", inputPath);
    console.log("Output path:", outputPath);

    // Verify input file exists and is readable
    if (!fs.existsSync(inputPath)) {
      console.error("Input file does not exist:", inputPath);
      return res.status(400).send("Input file not found");
    }

    const { top, left, width, height, targetWidth, targetHeight, projectId } =
      Object.fromEntries(
        Object.entries(req.body).map(([k, v]) => [k, parseInt(v, 10)])
      );

    console.log("Received parameters:", req.body);

    // Validate parameters
    const requiredParams = {
      top,
      left,
      width,
      height,
      targetWidth,
      targetHeight,
      projectId,
    };

    for (const [key, value] of Object.entries(requiredParams)) {
      if (isNaN(value)) {
        return res
          .status(400)
          .send(`Invalid value for ${key}: ${req.body[key]}`);
      }
    }

    // Smart scaling limit
    const MAX_SCALE_FACTOR = 1.5;

    // Compute ideal max upscale
    let scaleX = targetWidth / width;
    let scaleY = targetHeight / height;
    let adjustedHeight = targetHeight;
    let adjustedWidth = targetWidth;

    if (scaleX > MAX_SCALE_FACTOR || scaleY > MAX_SCALE_FACTOR) {
      const safeScale = Math.min(MAX_SCALE_FACTOR, scaleX, scaleY);
      adjustedWidth = Math.round(width * safeScale);
      adjustedHeight = Math.round(height * safeScale);
      console.log(
        `⚠️ Scaling limited to ${safeScale.toFixed(2)}x for clarity.`
      );
    }

    console.log("Original dimensions:", width, "x", height);
    console.log("Adjusted dimensions:", adjustedWidth, "x", adjustedHeight);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }


    const ffmpegCommand = ffmpeg(inputPath)
      .videoFilters([
        { filter: "crop", options: `${width}:${height}:${left}:${top}` },
        {
          filter: "scale",
          options: `${adjustedWidth}:${adjustedHeight}:flags=lanczos`,
        },
        { filter: "unsharp", options: "5:5:1.0:5:5:0.0" }, // optional sharpen
      ])
      .fps(30)
      .videoBitrate("5000000")
      .videoCodec("libvpx")
      .addOption("-crf", "23") // improved quality
      .addOption("-quality", "best")
      .addOption("-deadline", "good")
      .addOption("-row-mt", "1")
      .addOption("-cpu-used", "2")
      .addOption("-pix_fmt", "yuv420p")
      .addOption("-row-mt", "1")
      .format("webm")
      .on("start", (commandLine) => {
        // console.log("FFmpeg command:", commandLine);
      })
      .on("progress", (progress) => {
        // console.log("Processing: " + progress.percent + "% done");
      })
      .on("end", async () => {
        console.log("FFmpeg processing completed");

        try {
          // Verify output file was created
          if (!fs.existsSync(outputPath)) {
            console.error("Output file was not created:", outputPath);
            return res.status(500).send("Processing failed - no output file");
          }

          const stats = fs.statSync(outputPath);
          console.log("Output file size:", stats.size, "bytes");

          // Set proper headers
          res.setHeader("Content-Type", "video/webm");
          res.setHeader("Content-Length", stats.size);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${outputFilename}"`
          );

          // Create read stream and pipe to response
          const readStream = fs.createReadStream(outputPath);

          readStream.on("error", (streamError) => {
            console.error("Read stream error:", streamError);
            if (!res.headersSent) {
              res.status(500).send("Error reading processed file");
            }
          });

          readStream.on("end", () => {
            console.log("File sent successfully");
            // Clean up files after successful download
            setTimeout(() => {
              try {
                if (fs.existsSync(inputPath)) {
                  fs.unlinkSync(inputPath);
                  console.log("Cleaned up input file");
                }
                if (fs.existsSync(outputPath)) {
                  fs.unlinkSync(outputPath);
                  console.log("Cleaned up output file");
                }
              } catch (cleanupError) {
                console.error("Cleanup error:", cleanupError);
              }
            }, 1000);
          });

          readStream.pipe(res);

          // Update database
          try {
            const email = req.user.email;
            const updateUserQuery = `UPDATE users SET num_exports = num_exports + 1 WHERE email = $1`;
            await pool.query(updateUserQuery, [email]);

            const checkProjectQuery = `SELECT id FROM projects WHERE id = $1 AND email = $2`;
            const result = await pool.query(checkProjectQuery, [
              uuidv4(projectId),
              email,
            ]);

            if (result.rowCount > 0) {
              const updateProjectQuery = `UPDATE projects SET is_exported = $1 WHERE id = $2`;
              await pool.query(updateProjectQuery, [true, projectId]); // Fixed: removed uuidv4()
              console.log("Project marked as exported");
            }
          } catch (dbError) {
            console.error("Database update error:", dbError);
            // Don't fail the request for DB errors
          }
        } catch (endError) {
          console.error("Error in ffmpeg end handler:", endError);
          if (!res.headersSent) {
            res.status(500).send("Error processing completed file");
          }
        }
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err);
        console.error("FFmpeg stdout:", stdout);
        console.error("FFmpeg stderr:", stderr);

        // Clean up files on error
        try {
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up files:", cleanupError);
        }

        if (!res.headersSent) {
          res.status(500).send(`FFmpeg processing failed: ${err.message}`);
        }
      });

    // Start processing
    ffmpegCommand.save(outputPath);
  } catch (err) {
    console.error("Unhandled error:", err);

    // Clean up files on any error
    try {
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up files:", cleanupError);
    }

    if (!res.headersSent) {
      return res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
};
