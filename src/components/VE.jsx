import React, { useRef, useContext, useState } from "react";
import html2canvas from "html2canvas";
import AppContext from "../AppContext";

const VE = () => {
  const { videoPlayerRef } = useContext(AppContext);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const animationFrameRef = useRef(null);
  const uiSnapshotRef = useRef(null);

  // 📌 Capture UI snapshot initially and every second
  const captureUI = async () => {
    if (!videoPlayerRef.current) return;

    uiSnapshotRef.current = await html2canvas(videoPlayerRef.current, {
      backgroundColor: null,
      scale: 4, // ✅ Higher scale for better resolution
    });

    setTimeout(captureUI, 1000); // Capture every second
  };

  const captureFrame = () => {
    const videoPlayerDiv = videoPlayerRef.current;
    const canvas = canvasRef.current;
    if (!videoPlayerDiv || !canvas) return;

    const { width, height } = videoPlayerDiv.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const scaleFactor = 10;
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(scaleFactor, scaleFactor);
    ctx.clearRect(0, 0, width, height);

    // 📌 ✅ Ensure UI Snapshot is drawn first to pick up colors
    if (uiSnapshotRef.current) {
      ctx.drawImage(uiSnapshotRef.current, 0, 0, width, height);
    } else {
      console.warn("UI snapshot not available yet!");
    }

    // 📌 ✅ Overlay video separately to keep quality high
    const videoElement = videoPlayerDiv.querySelector("video");
    if (videoElement) {
      const videoRect = videoElement.getBoundingClientRect();
      const offsetX =
        videoRect.left - videoPlayerDiv.getBoundingClientRect().left;
      const offsetY =
        videoRect.top - videoPlayerDiv.getBoundingClientRect().top;

      ctx.drawImage(
        videoElement,
        offsetX,
        offsetY,
        videoRect.width,
        videoRect.height
      );
    }

    animationFrameRef.current = requestAnimationFrame(captureFrame);
  };

  const startRecording = async () => {
    recordedChunks.current = [];

    await captureUI(); // 📌 First snapshot to prevent black-and-white issue
    setTimeout(() => captureFrame(), 100); // 📌 Delay slightly to ensure colors are picked up

    const canvasStream = canvasRef.current.captureStream(60);
    let videoElement = videoPlayerRef.current?.querySelector("video");
    let audioStream = videoElement?.captureStream();
    let audioTracks = audioStream?.getAudioTracks() || [];

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 40_000_000, // ✅ Increase bitrate to 100 Mbps
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      cancelAnimationFrame(animationFrameRef.current);

      if (recordedChunks.current.length === 0) {
        console.error("No recorded data available.");
        return;
      }

      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_video.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelExport = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      recordedChunks.current = []; // Clear recorded data to prevent download
      console.log("Export canceled.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <button onClick={cancelExport} disabled={!isRecording}>
        Cancel Export
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default VE;
