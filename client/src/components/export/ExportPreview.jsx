import React, { useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "../../VideoPlayer";
import AppContext from "../../AppContext";
import { processVideoWithFFmpeg } from "../../utils/export";
import { notify } from "../../utils/toast";
import styles from "../header/styles/header.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const ExportPreview = () => {
  const {
    setIsPlaying,
    maxTime,
    convertToPixels,
    setIsExportPreview,
    isSubtitleGen,
    setIsSubtitleGen,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    setSubtitleArray,
  } = useContext(AppContext);
  const [recordingStatus, setRecordingStatus] = useState("");
  const exportButtonRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const maxTimeInSeconds = convertToPixels(maxTime) / 10;
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Get best supported mime type
  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];

    return (
      types.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm"
    );
  };

  const captureVideoPlayer = async () => {
    setSeekerPosition(0);
    setSeekerPositionManuallyChanged(true);
    setIsPlaying(false);
    exportButtonRef.current.style.display = "none";
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    }
    setRecordingStatus("Initializing...");
    recordedChunksRef.current = [];

    const playerElement = document.querySelector(".video-player");
    if (!playerElement) {
      notify("Something went wrong", "error");
      return;
    }

    try {
      // Request screen capture
      setRecordingStatus("Requesting screen capture...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 60,
          displaySurface: "browser",
          cursor: "never",
        },
        audio: false,
        preferCurrentTab: true,
      });

      streamRef.current = screenStream;

      // Create and store audio context
      setRecordingStatus("Setting up audio capture...");
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      audioContextRef.current = audioContext;

      // Track connected audio elements to avoid duplicates
      const connectedElements = new Set();

      // Function to connect audio sources
      const connectAudioSources = () => {
        const audioElements = playerElement.querySelectorAll("video, audio");
        let connectedSources = 0;

        audioElements.forEach((element) => {
          // Skip already connected elements
          if (connectedElements.has(element)) return;

          if (element.captureStream) {
            try {
              const elementStream = element.captureStream();
              const audioTracks = elementStream.getAudioTracks();

              if (audioTracks.length > 0) {
                const source =
                  audioContext.createMediaStreamSource(elementStream);
                source.connect(audioDestination);
                connectedElements.add(element);
                connectedSources++;
              }
            } catch (err) {
              notify("Could not capture audio stream", "error")
            }
          }
        });

        return connectedSources;
      };

      // Initial audio setup
      let connectedSources = connectAudioSources();

      // Set up audio monitoring interval to capture new audio elements
      const audioMonitoringInterval = setInterval(() => {
        const newSources = connectAudioSources();
      }, 1000); // Check every second

      // Store interval ID for cleanup
      audioContextRef.current.monitoringInterval = audioMonitoringInterval;

      // Get the video track
      const videoTrack = screenStream.getVideoTracks()[0];

      // Combine video with audio
      const tracks = [videoTrack];

      // Add audio tracks if available
      if (audioDestination.stream.getAudioTracks().length > 0) {
        tracks.push(audioDestination.stream.getAudioTracks()[0]);
      }

      const combinedStream = new MediaStream(tracks);

      setIsPlaying(true);
      setRecordingStatus("Recording...");

      // Set up recorder with the best supported mime type
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 80000000,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsPlaying(false);
        setRecordingStatus("Processing recording...");

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });

        const { width, height, top, left } =
          playerElement.getBoundingClientRect();

        const videoWidth = 1920;
        const videoHeight = 1080;
        const dpr = window.devicePixelRatio || 1;

        const normalCrop = {
          width: width * dpr,
          height: height * dpr,
          left: left * dpr,
          top: top * dpr,
        };

        setRecordingStatus("Processing video...");
        if (isSubtitleGen) {
          setRecordingStatus("Generating subtitles...");
          const file = new File([blob], "video.webm");
          const formData = new FormData();
          formData.append("video", file);

          fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/upload-video`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then(async (res) => {
              res = await res.json();
              setRecordingStatus("Processing audio for subtitles...");

              return res.audioUrl;
            })
            .then(async(audioUrl) => {
              const token = await getToken();
              if(!token){
                notify("Something went wrong", "error");
                return;
              }
              fetch(
                `${
                  import.meta.env.VITE_SERVER_URL
                }/api/user/generate-subtitles`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    audioPath: audioUrl,
                  }),
                }
              )
                .then(async (res) => {
                  const data = await res.json();
                  setRecordingStatus("Subtitles generated!");
                  setSubtitleArray(data.subtitles);
                })
                .catch((err) => {
                  setRecordingStatus("Failed to generate subtitles1");
                });
            })
            .catch((err) => {
              setRecordingStatus("Failed to upload video");
            });
        } else {
          const newBlob = await processVideoWithFFmpeg(
            blob,
            normalCrop,
            {
              width: videoWidth,
              height: videoHeight,
            },
            token,
            window.location.pathname.split("/")[1]
          );

          setRecordingStatus("Preparing download...");
          downloadBlob(newBlob, "recording.webm");
          setRecordingStatus("");
        }
        cleanupRecording();
      };

      recorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      // Auto-stop after max duration
      if (maxTimeInSeconds > 0) {
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            cleanupRecording();
          }
        }, maxTimeInSeconds * 1000);
      }

      // Stop recording if user ends screen sharing
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            cleanupRecording();
          }
        });
      }
    } catch (err) {
      notify("Screen capture failed.", "error");
      setIsPlaying(false);
      cleanupRecording();
    }
  };

  // Helper to download blob
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  // Cleanup function for all resources
  const cleanupRecording = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clean up audio resources
    if (audioContextRef.current) {
      // Clear audio monitoring interval
      if (audioContextRef.current.monitoringInterval) {
        clearInterval(audioContextRef.current.monitoringInterval);
      }

      // Close audio context
      try {
        audioContextRef.current.close();
      } catch (err) {
        // notify("Failed to close audio context", "error");
      }
      audioContextRef.current = null;
    }

    // Close recorder
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    setRecordingStatus("");
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  return (
    <>
      <div className={styles.header}>
        <button
          onClick={() => {
            setIsPlaying(false);
            setSeekerPosition(0);
            setSeekerPositionManuallyChanged(true);
            setIsExportPreview(false);
            setIsSubtitleGen(false);
          }}
          className="button-purple"
          style={{ width: "70px", height: "30px" }}
        >
          Go back
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          marginTop: "50px",
        }}
      >
        {recordingStatus && (
          <>
            <h3 style={{ color: "white" }}>{recordingStatus}</h3>
          </>
        )}
        <VideoPlayer />
        <button
          onClick={captureVideoPlayer}
          ref={exportButtonRef}
          className="button-purple"
          style={{ width: "70px", height: "30px" }}
        >
          Start
        </button>
      </div>
    </>
  );
};

export default ExportPreview;
