import React, { useRef, useState, useContext } from "react";
import html2canvas from "html2canvas";
import AppContext from "../AppContext";

const VE = () => {
  const { videoPlayerRef } = useContext(AppContext);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef(null);

  const startRecording = async () => {
    if (!videoPlayerRef.current) {
      console.error("No video player found!");
      return;
    }

    setIsRecording(true);
    recordedChunks.current = [];

    // Create a canvas and capture the div content repeatedly
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { width, height } = videoPlayerRef.current.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    streamRef.current = canvas.captureStream(30); // 30 FPS
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
      videoBitsPerSecond: 40_000_000,
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_video.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorderRef.current.start();

    // Capture frames continuously
    const captureFrame = async () => {
      if (!isRecording) return;

      const snapshot = await html2canvas(videoPlayerRef.current, {
        backgroundColor: null, // Preserve transparency
        scale: 2, // High quality
      });

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(snapshot, 0, 0, width, height);

      requestAnimationFrame(captureFrame);
    };

    captureFrame();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
};

export default VE;
