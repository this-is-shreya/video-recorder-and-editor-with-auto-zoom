import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import React from "react";


const VideoExporter = () => {
  const startExporting = async () => {
    try {
      const ffmpeg = new FFmpeg();
      // Load FFmpeg if not loaded
      if (!ffmpeg.loaded) {
        console.log("Loading FFmpeg...");
        await ffmpeg.load({
          totalMemory: 33554432 * 16, // 512MB 
        });
        console.log("FFmpeg Loaded!");
      }
      // Attach log and progress listeners
      ffmpeg.on("log", ({ message }) => console.log("[FFmpeg Log]", message));
      ffmpeg.on("progress", ({ progress }) =>
        console.log(`Processing: ${Math.round(progress * 100)}%`)
      );

      // Select all video elements in the .video-player container
      const videoElements = document.querySelectorAll(".video-player video");
      if (videoElements.length === 0) {
        console.error("No video elements found inside '.video-player'");
        return;
      }

      const inputFiles = [];

      for (let i = 0; i < videoElements.length; i++) {
        const videoSrc = videoElements[i]?.src;
        const fileName = `input${i}.webm`;

        if (!videoSrc) {
          console.error(`Video element ${i} has no valid source`);
          return;
        }

        console.log(`Fetching video file: ${videoSrc}`);
        const fileData = await fetchFile(videoSrc);
        console.log(`Fetched file size for ${fileName}:`, fileData.byteLength);

        // Test FFmpeg file writing
        await ffmpeg.writeFile(fileName, fileData);
        const files = await ffmpeg.listDir("/");
        console.log("Files in FFmpeg FS after writing:", files);

        const hasFile = files.find((item) => item.name === fileName);
        if (!hasFile) {
          console.error(`FFmpeg did not write ${fileName} correctly!`);
          return;
        }

        inputFiles.push(fileName);
      }

      // Simple test FFmpeg command to check execution
      const outputFileName = "output_test.webm";
      try {
        console.log("Executing FFmpeg command...");
        await ffmpeg.exec([
          "-i",
          "input0.webm",
          "-b:v",
          "500k", // Reduce bitrate to 500kbps
          "-c:v",
          "libvpx-vp9",
          outputFileName,
        ]);
        console.log("FFmpeg command executed successfully.");
      } catch (execError) {
        console.error("FFmpeg execution error:", execError);
        return;
      }

      // Verify output file generation
      const outputFiles = await ffmpeg.listDir("/");
      console.log("Files after FFmpeg execution:", outputFiles);
      const hasOutput = outputFiles.find(
        (item) => item.name === outputFileName
      );

      if (!hasOutput) {
        console.error("FFmpeg failed to generate output file!");
        return;
      }

      console.log("Output file successfully created!");

      // Download the exported video
      try {
        console.log("Reading output file...");
        const data = await ffmpeg.readFile(outputFileName);
        console.log("Successfully read output file:", data);

        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/webm" })
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported_video.webm";
        document.body.appendChild(a);
        a.click();
        console.log("Download initiated.");
      } catch (readError) {
        console.error("Error accessing output file:", readError);
      }
      await ffmpeg.deleteFile("input.webm");
      await ffmpeg.deleteFile("output.webm");
      console.log("Cleared FFmpeg memory.");
    } catch (error) {
      console.error("Unexpected error during export:", error);
    }
  };

  return (
    <div>
      <button onClick={startExporting}>Export Video</button>
    </div>
  );
};

export default VideoExporter;
