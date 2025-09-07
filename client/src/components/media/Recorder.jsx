"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { recordingType } from "../../utils/MediaEnum";
import { FaCameraRetro } from "react-icons/fa";
import { MdOutlineScreenshotMonitor, MdScreenShare } from "react-icons/md";
import { PiWebcamSlash } from "react-icons/pi";
import AppContext from "../../AppContext";

const Recorder = () => {
  const {
    setCursorDataObj,
    isRecording,
    setIsRecording,
    screenRecorder,
    cameraRecorder,
    screenChunks,
    cameraChunks,
    activeStreams,
    recordingStartTime,
    setRecordingStartTime,
    isRecordingCursor,
    setIsRecordingCursor
  } = useContext(AppContext);

  // Set up IPC listeners
  useEffect(() => {
    const handleRecordingStarted = () => {
      console.log("Cursor recording started");
      setIsRecordingCursor(true);
    };

    const handleRecordingStopped = (event, sessionData) => {
      console.log("Cursor recording stopped with session:", sessionData);
      setIsRecordingCursor(false);
      // Refresh cursor data
      refreshCursorData();
    };

    const handleRecordingCancelled = () => {
      console.log("Cursor recording cancelled");
      setIsRecordingCursor(false);
    };

    const handleRecordingForceStopped = (event, sessionData) => {
      console.log("Cursor recording force stopped with data:", sessionData);
      setIsRecordingCursor(false);
      // Refresh cursor data
      refreshCursorData();
    };

    const handleCursorCapture = async (e) => {
      await window.electronAPI.toggleRecording(recordingStartTime);
    };

    // Set up listeners using electronAPI
    window.electronAPI.onCursorCapture(handleCursorCapture);
    window.electronAPI.onRecordingStarted(handleRecordingStarted);
    window.electronAPI.onRecordingStopped(handleRecordingStopped);
    window.electronAPI.onRecordingCancelled(handleRecordingCancelled);
    window.electronAPI.onRecordingForceStopped(handleRecordingForceStopped);

    // Cleanup function
    return () => {
      // Note: You'll need to implement removeListener methods in your preload script
      // or keep track of listeners to clean them up properly
      window.electronAPI.removeAllListeners?.();
    };
  }, [recordingStartTime]);

  const refreshCursorData = async () => {
    try {
      const cursorData = await window.electronAPI.getAllSessions();
      console.log("Refreshed cursor data:", cursorData);
      setCursorDataObj(cursorData);
    } catch (error) {
      console.error("Error refreshing cursor data:", error);
    }
  };

  const clearCursorData = async () => {
    try {
      await window.electronAPI.clearAllSessions();
      setCursorDataObj([]);
      console.log("All cursor data cleared");
    } catch (error) {
      console.error("Error clearing cursor data:", error);
    }
  };
  // Function to start recording
  const startRecording = async (type) => {
    const now = Date.now();
    setRecordingStartTime(now);
    console.log("Recording start time set:", now);
    setIsRecording(true);

    try {
      console.log("Starting recording type:", type);
      clearCursorData(); // Clear previous cursor data
      // Add double-click listener for cursor recording
      const handleDoubleClick = () => {
        console.log("Double click detected, toggling cursor recording");
        window.electronAPI.toggleRecording(now);
      };

      // document.addEventListener("dblclick", handleDoubleClick);

      // Store the cleanup function
      const cleanupDoubleClick = () => {
        // document.removeEventListener("dblclick", handleDoubleClick);
      };

      // Handle screen recording
      if (
        type === recordingType.screen ||
        type === recordingType.screenAndCamera
      ) {
        console.log("Attempting to get screen stream...");

        let screenStream = null;

        try {
          console.log("Trying getDisplayMedia...");
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "always",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              volume: 1.0,
              sampleRate: 48000,
              channelCount: 2,
            },
          });
          console.log("getDisplayMedia successful!");
        } catch (displayError) {
          console.log("getDisplayMedia failed:", displayError.message);

          try {
            console.log("Trying getUserMedia with desktop source...");
            screenStream = await navigator.mediaDevices.getUserMedia({
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  maxWidth: 1920,
                  maxHeight: 1080,
                  maxFrameRate: 30,
                },
              },
              audio: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                  volume: 1.0,
                  sampleRate: 48000,
                  channelCount: 2,
                },
              },
            });
            console.log("getUserMedia with desktop source successful!");
          } catch (desktopError) {
            console.log(
              "getUserMedia with desktop failed:",
              desktopError.message
            );

            try {
              console.log("Trying getUserMedia with screen constraints...");
              screenStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  mediaSource: "screen",
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                },
              });
              console.log("getUserMedia with screen constraints successful!");
            } catch (screenError) {
              console.error("All screen capture methods failed");
              throw new Error(`Screen capture failed: ${screenError.message}`);
            }
          }
        }

        if (!screenStream) {
          throw new Error("Could not obtain screen stream");
        }

        // Get microphone for audio
        let micStream = null;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              volume: 1.0,
              sampleRate: 48000,
              channelCount: 2,
            },
          });
          console.log("Microphone stream obtained");
        } catch (micError) {
          console.warn("Could not get microphone:", micError.message);
        }

        // Combine streams
        const combinedTracks = [...screenStream.getVideoTracks()];

        if (screenStream.getAudioTracks().length > 0) {
          combinedTracks.push(...screenStream.getAudioTracks());
          console.log("Added system audio tracks");
        }

        if (micStream && micStream.getAudioTracks().length > 0) {
          combinedTracks.push(...micStream.getAudioTracks());
          console.log("Added microphone audio tracks");
        }

        const combinedStream = new MediaStream(combinedTracks);

        const options = { mimeType: "video/webm" };

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          options.mimeType = "video/webm;codecs=vp9";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
          options.mimeType = "video/webm;codecs=vp8";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
          options.mimeType = "video/webm;codecs=h264";
        }

        console.log("Using MediaRecorder options:", options);

        screenRecorder.current = new MediaRecorder(combinedStream, options);
        screenChunks.current = [];

        screenRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            screenChunks.current.push(event.data);
            console.log("Screen data chunk:", event.data.size, "bytes");
          }
        };

        screenRecorder.current.onstop = () => {
          console.log(
            "Screen recording stopped, total chunks:",
            screenChunks.current.length
          );
          cleanupDoubleClick(); // Clean up double-click listener
        };

        screenRecorder.current.onerror = (event) => {
          console.error("Screen recorder error:", event.error);
        };

        screenStream.getVideoTracks()[0].onended = () => {
          console.log("Screen sharing ended by user");
          stopRecording();
        };

        screenRecorder.current.start(1000);
        activeStreams.current.push(screenStream);
        if (micStream) activeStreams.current.push(micStream);

        console.log("Screen recording started successfully");
      }

      // Handle camera recording
      if (
        type === recordingType.camera ||
        type === recordingType.screenAndCamera
      ) {
        console.log("Starting camera recording...");

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            volume: 1.0,
            sampleRate: 48000,
            channelCount: 2,
          },
        });

        const cameraOptions = { mimeType: "video/webm" };
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          cameraOptions.mimeType = "video/webm;codecs=vp9";
        }

        cameraRecorder.current = new MediaRecorder(cameraStream, cameraOptions);
        cameraChunks.current = [];

        cameraRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            cameraChunks.current.push(event.data);
            console.log("Camera data chunk:", event.data.size, "bytes");
          }
        };

        cameraRecorder.current.start(1000);
        activeStreams.current.push(cameraStream);

        console.log("Camera recording started successfully");
      }

    } catch (err) {
      console.error("Recording failed:", err);

      activeStreams.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      activeStreams.current = [];

      setIsRecording(false);

      let errorMsg = "Recording failed: ";
      if (err.name === "NotAllowedError") {
        errorMsg += "Permission denied. Please allow screen/camera access.";
      } else if (err.name === "NotSupportedError") {
        errorMsg += "Screen recording not supported.";
      } else if (err.name === "NotFoundError") {
        errorMsg += "No camera or screen found.";
      } else {
        errorMsg += "Unknown error occurred.";
      }

      notify(errorMsg, "error");
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");

    // Force stop cursor recording if it's active
    if (isRecordingCursor) {
      window.electronAPI.forceStopRecording();
    }

    // Get the recorded cursor data
    try {
      const cursorData = await window.electronAPI.getAllSessions();
      console.log("Final cursor data:", cursorData, screenRecorder.current);
      setCursorDataObj(cursorData);
    } catch (error) {
      console.error("Error getting cursor data:", error);
    }

    if (screenRecorder.current && screenRecorder.current.state !== "inactive") {
      console.log("Stopping screen recorder...");

      screenRecorder.current.stop();
    }
    if (cameraRecorder.current && cameraRecorder.current.state !== "inactive") {
      console.log("Stopping camera recorder...");

      cameraRecorder.current.stop();
    }

    // Stop all streams
    activeStreams.current.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind, track.label);
        track.stop();
      });
    });
    activeStreams.current = [];

    // Download recordings
    setTimeout(() => {
      if (screenChunks.current.length > 0) {
        downloadRecording(screenChunks.current, "screen_recording.webm");
        screenChunks.current = [];
      }
      if (cameraChunks.current.length > 0) {
        downloadRecording(cameraChunks.current, "camera_recording.webm");
        cameraChunks.current = [];
      }
    }, 1000);

    setIsRecording(false);
    setIsRecordingCursor(false);
  };

  const downloadRecording = (chunks, filename) => {
    if (chunks.length === 0) return;

    console.log(`Downloading ${filename} with ${chunks.length} chunks`);
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
      <label>Use Ctrl+Shift+K for auto zoom</label>

      <label>
        Any existing zooms will be replaced upon zooming after clicking on the
        record button
      </label>
      <button
        onClick={() => {startRecording(recordingType.screen)}}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "15px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        <MdOutlineScreenshotMonitor size={24} style={{ marginRight: "10px" }} />
        Record Screen
      </button>

      <button
        onClick={() => startRecording(recordingType.camera)}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "15px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        <FaCameraRetro size={24} style={{ marginRight: "10px" }} />
        Record Camera
      </button>

      <button
        onClick={() => startRecording(recordingType.screenAndCamera)}
        disabled={isRecording}
        style={{
          cursor: isRecording ? "not-allowed" : "pointer",
          backgroundColor: isRecording ? "#ccc" : "#892fff",
          color: "#fff",
          padding: "15px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        <MdScreenShare size={24} style={{ marginRight: "10px" }} />
        Record Screen & Camera
      </button>

      <button
        onClick={stopRecording}
        disabled={!isRecording}
        style={{
          cursor: isRecording ? "pointer" : "not-allowed",
          backgroundColor: isRecording ? "#dc3545" : "#6c757d",
          color: "#fff",
          padding: "15px",
          borderRadius: "5px",
          border: "none",
          width: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        <PiWebcamSlash size={24} style={{ marginRight: "10px" }} />
        Stop Recording
      </button>
    </div>
  );
};

export default Recorder;
