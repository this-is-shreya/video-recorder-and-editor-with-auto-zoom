import React, { useRef, useState } from "react";
import { recordingType } from "../../utils/MediaEnum"; // Ensure it has 'screen', 'camera', 'screenAndCamera'
import { FaCameraRetro } from "react-icons/fa";
import { MdOutlineScreenshotMonitor, MdScreenShare } from "react-icons/md";
import { PiWebcamSlash } from "react-icons/pi";

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const screenRecorder = useRef(null);
  const cameraRecorder = useRef(null);
  const screenChunks = useRef([]);
  const cameraChunks = useRef([]);
  const activeStreams = useRef([]);

  // Function to start recording
  const startRecording = async (type) => {
    let screenStream, cameraStream, micStream, combinedScreenStream;

    try {
      if (
        type === recordingType.screen ||
        type === recordingType.screenAndCamera
      ) {
        // Get screen stream
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Get microphone audio (in case system audio is not captured)
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Combine screen video + mic audio
        combinedScreenStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...micStream.getAudioTracks(),
        ]);

        // Initialize screen recorder
        screenRecorder.current = new MediaRecorder(combinedScreenStream);
        screenChunks.current = [];

        screenRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) screenChunks.current.push(event.data);
        };

        // Auto-stop when user clicks "Stop Sharing"
        screenStream.getVideoTracks()[0].onended = () => {
          console.log("Screen sharing stopped by user.");
          stopRecording();
        };

        screenRecorder.current.start();
        activeStreams.current.push(screenStream, micStream);
      }

      if (
        type === recordingType.camera ||
        type === recordingType.screenAndCamera
      ) {
        // Get camera stream
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Initialize camera recorder
        cameraRecorder.current = new MediaRecorder(cameraStream);
        cameraChunks.current = [];

        cameraRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) cameraChunks.current.push(event.data);
        };

        cameraRecorder.current.start();
        activeStreams.current.push(cameraStream);
      }

      setIsRecording(true);
      console.log("Recording started.");
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  // Function to stop recording and download both streams
  const stopRecording = () => {
    if (screenRecorder.current && screenRecorder.current.state !== "inactive") {
      screenRecorder.current.stop();
    }
    if (cameraRecorder.current && cameraRecorder.current.state !== "inactive") {
      cameraRecorder.current.stop();
    }

    // Stop all active media streams (camera, mic, screen)
    activeStreams.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    activeStreams.current = [];

    // Download after slight delay to ensure data is fully captured
    setTimeout(() => {
      downloadRecording(screenChunks.current, "screen_recording.webm");
      downloadRecording(cameraChunks.current, "camera_recording.webm");
    }, 500);

    setIsRecording(false);
    console.log("Recording stopped and downloaded.");
  };

  // Helper function to download recordings
  const downloadRecording = (chunks, filename) => {
    if (chunks.length === 0) return;
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    console.log(`${filename} downloaded.`);
  };

  return (
    <div
      className="panel"
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: "10px",
        padding: "20px",
      }}
    >
      <button
        onClick={() => startRecording(recordingType.screen)}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
        }}
      >
        <MdOutlineScreenshotMonitor size={30} style={{ marginRight: "8px" }} />
        <p>Record Screen</p>
      </button>
      <button
        onClick={() => startRecording(recordingType.camera)}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
        }}
      >
        <FaCameraRetro size={30} style={{ marginRight: "8px" }} />
        <p>Record Camera</p>
      </button>
      <button
        onClick={() => startRecording(recordingType.screenAndCamera)}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
        }}
      >
        <MdScreenShare size={30} style={{ marginRight: "8px" }} />
        <p>Record Camera and Screen</p>
      </button>
      <button
        onClick={stopRecording}
        disabled={!isRecording}
        style={{
          cursor: isRecording ? "pointer" : "not-allowed",
          backgroundColor: isRecording ? "red" : "grey",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
        }}
      >
        <PiWebcamSlash size={30} style={{ marginRight: "8px" }} />
        <p>Stop Recording</p>
      </button>
    </div>
  );
};

export default Recorder;
