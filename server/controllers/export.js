const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
ffmpeg.setFfmpegPath(ffmpegPath);
const pool = require("../model/config");

module.exports.processUsingFfmpeg = async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputFilename = `processed-${uuidv4()}.webm`;
    const outputPath = path.join(__dirname, "..", "temp", outputFilename);
    console.log("entered hereprocess", outputPath);

    const { top, left, width, height, targetWidth, targetHeight, projectId } =
      Object.fromEntries(
        Object.entries(req.body).map(([k, v]) => [k, parseInt(v, 10)])
      );

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
        return res.status(400).send(`Invalid value for ${key}`);
      }
    }

    // Smart scaling limit
    const MAX_SCALE_FACTOR = 2.0; // e.g. don't scale more than 2x original cropped resolution

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
    console.log("Original: ", width, height);
    console.log("New: ", adjustedWidth, adjustedHeight);

    ffmpeg(inputPath)
      .videoFilters([
        {
          filter: "crop",
          options: `${width}:${height}:${left}:${top}`,
        },
        {
          filter: "scale",
          options: `${adjustedWidth}:${adjustedHeight}:flags=lanczos`,
        },
        {
          filter: "hqdn3d",
          options: "0:0:2:2", // Very light denoise (luma:chroma:luma temporal:chroma temporal)
        },
      ])
      .fps(60)
      .videoBitrate(80000000) // Ensure at least 20Mbps
      .videoCodec("libvpx-vp9")
      .addOption("-quality", "best") // good, best, realtime
      .addOption("-crf", "23") // 0-63, lower is better quality
      .addOption("-row-mt", "1") // Enable row-based multithreading
      .addOption("-deadline", "good")
      .addOption("-cpu-used", "2") // CPU usage (0-5), lower is better quality
      .format("webm")
      .on("end", () => {
        res.setHeader("Content-Type", "video/webm");
        const readStream = fs.createReadStream(outputPath);
        readStream.pipe(res);

        readStream.on("end", () => {
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
        res.status(500).send("FFmpeg processing failed");
      })
      .save(outputPath);

    //cleanup
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    const inputFilePath = path.join(__dirname, ".." + inputPath);

    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
    //increment export
    const updateUserQuery = `UPDATE users SET num_exports = num_exports + 1 WHERE email = $1`;
    const checkProjectQuery = `SELECT id FROM projects WHERE id = $1 AND email = $2`;
    const updateProjectQuery = `UPDATE projects SET is_exported = $1 WHERE id = $2`;

    const email = req.user.emailAddresses[0].emailAddress;

    await pool.query(updateUserQuery, [email]);
    const result = await pool.query(checkProjectQuery, [
      uuidv4(projectId),
      email,
    ]);
    if (result.rowCount > 0) {
      await pool.query(updateProjectQuery, [true, uuidv4(projectId)]);
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).send(`Internal server error`);
  }
};
