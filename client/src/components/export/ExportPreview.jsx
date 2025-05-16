"use client";

import { useContext, useEffect, useState, useRef } from "react";
import VideoPlayer from "../../VideoPlayer";
import AppContext from "../../AppContext";
import { getCurrentSources } from "../../utils/getCurrentSources";
import { notify } from "../../utils/toast";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const ExportPreview = () => {
  const {
    setIsPlaying,
    setSourceAndTiming,
    setEffectsAndTiming,
    sourceAndTiming,
    effectsAndTiming,
    setCurrentSourceAndTiming,
    setCurrentEffectsAndTiming,
    seekerPosition,
    zoomTimeline,
    subtitleArray,
    setSubtitleArray,
    convertToPixels,
    isExportPreview,
  } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [maxTimeInSeconds, setMaxTimeInSeconds] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [showNullMessage, setShowNullMessage] = useState(false);

  // Refs for recording
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const canvasRef = useRef(null);
  const videoElRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Resolution and aspect ratio configurations
  const aspect_9_16 = {
    720: { width: 720, height: 1280 },
    1080: { width: 1080, height: 1920 },
    2160: { width: 2160, height: 3840 }, // 9:16 in 4K
  };

  const aspect_16_9 = {
    720: { width: 1280, height: 720 },
    1080: { width: 1920, height: 1080 },
    2160: { width: 3840, height: 2160 }, // Standard 4K UHD
  };

  const aspect_3_4 = {
    720: { width: 720, height: 960 },
    1080: { width: 1080, height: 1440 },
    2160: { width: 2160, height: 2880 }, // 3:4 in 4K height
  };

  const aspect_4_3 = {
    720: { width: 960, height: 720 },
    1080: { width: 1440, height: 1080 },
    2160: { width: 2880, height: 2160 }, // 4:3 in 4K width
  };

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const aspectRatio = params.get("aspectRatio") || "16/9";
  const resolution = Number(params.get("res")) || 720;
  const bitrate = Number(params.get("rate")) || 5000000;
  const fps = Number(params.get("fps")) || 30;
  const type = params.get("type") || "export";
  const projectId = window.location.pathname.split("/")[1];
  // Get supported mime type for recording
  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log("Using MIME type:", type);
        return type;
      }
    }
    return "video/webm"; // Fallback
  };

  const getProject = async () => {
    const token = await getToken();
    if (!token) {
      navigate("/auth");
    } else {
      fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/user/project/${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch project data");
          }
          return res.json();
        })
        .then((data) => {
          notify("Project data loaded succesfully!", "success");
          setSourceAndTiming(data.source_and_timing);
          setEffectsAndTiming(data.effects_and_timing);
        })
        .catch((err) => {
          notify(
            "Error loading project. Please wait or try exporting again.",
            "error"
          );
        });
    }
  };

  const handleMessage = (event) => {
    if (event.data && event.data.type === "export") {
      const maxTime = event.data.maxTime;
      const _maxTimeInSeconds = convertToPixels(maxTime) / 10; // Convert to seconds
      setMaxTimeInSeconds(_maxTimeInSeconds);
      if (_maxTimeInSeconds === 0) {
        setShowNullMessage(true);
      }
    }
  };

  useEffect(() => {
    if (seekerPosition === 0) {
      setRecordingTime(0);
    } else if (isRecording) {
      setRecordingTime((prev) => prev + 1);
      if (recordingTime !== 0 && maxTimeInSeconds !== 0) {
        setProgressValue((recordingTime / maxTimeInSeconds) * 100);
      }
      if (recordingTime >= maxTimeInSeconds) {
        setIsPlaying(false);
        cleanupRecording();
      }
    }
  }, [seekerPosition]);

  // Fetch project data only once when component mounts
  useEffect(() => {
    // Basic validation of URL parameters
    if (resolution !== 720 && resolution !== 1080 && resolution !== 2160) {
      notify("Invalid resolution, using default 720p", "warn");
    }

    if (bitrate !== 5000000 && bitrate !== 10000000 && bitrate !== 15000000) {
      notify("Invalid bitrate, using default 5Mbps", "warn");
    }

    if (fps !== 30 && fps !== 40 && fps !== 50 && fps !== 60) {
      notify("Invalid fps, using default 30fps", "warn");
    }

    notify("Loading project. Please wait.", "info");
    getProject();
    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Make sure we update current sources when needed
  useEffect(() => {
    setCurrentSourceAndTiming(
      getCurrentSources(sourceAndTiming, seekerPosition, zoomTimeline)
    );
    setCurrentEffectsAndTiming(
      getCurrentSources(effectsAndTiming, seekerPosition, zoomTimeline)
    );
  }, [sourceAndTiming, effectsAndTiming, seekerPosition]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const captureVideoPlayer = async () => {
    if (isRecording) return;

    setRecordingStatus("Initializing...");
    recordedChunksRef.current = []; // Reset recorded chunks

    const playerElement = document.querySelector(".video-player");
    if (!playerElement) {
      console.error("No .video-player found");
      setIsRecording(false);
      return;
    }

    // Get the exact dimensions of the player
    const rect = playerElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    // Determine target dimensions based on aspect ratio
    let targetWidth, targetHeight;
    if (aspectRatio === "9/16") {
      targetWidth = aspect_9_16[resolution].width;
      targetHeight = aspect_9_16[resolution].height;
    } else if (aspectRatio === "16/9") {
      targetWidth = aspect_16_9[resolution].width;
      targetHeight = aspect_16_9[resolution].height;
    } else if (aspectRatio === "3/4") {
      targetWidth = aspect_3_4[resolution].width;
      targetHeight = aspect_3_4[resolution].height;
    } else if (aspectRatio === "4/3") {
      targetWidth = aspect_4_3[resolution].width;
      targetHeight = aspect_4_3[resolution].height;
    }

    try {
      // For screen capture
      setRecordingStatus("Requesting screen capture...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: fps,
          displaySurface: "browser",
        },
        audio: false,
        preferCurrentTab: true,
      });

      streamRef.current = screenStream;
      console.log("Screen stream:", streamRef.current);

      if (streamRef.current) {
        setIsPlaying(true);
        setIsRecording(true);
        setRecordingStatus("Capturing screen...");
      }

      // Create a new audio context for each recording
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();

      // Store the audio context for cleanup
      if (window.audioContextRef) {
        try {
          window.audioContextRef.close();
        } catch (err) {
          console.warn("Error closing previous audio context:", err);
        }
      }
      window.audioContextRef = audioContext;

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
                console.log("Connected audio source from element:", element);
              }
            } catch (err) {
              console.warn("Failed to capture stream from element:", err);
            }
          }
        });

        return connectedSources;
      };

      // Initial audio setup
      setRecordingStatus("Setting up audio capture...");
      let connectedSources = connectAudioSources();
      console.log(`Initially connected ${connectedSources} audio sources`);

      // Set up audio monitoring interval
      const audioMonitoringInterval = setInterval(() => {
        const newSources = connectAudioSources();
        if (newSources > 0) {
          console.log(`Connected ${newSources} new audio sources`);
        }
      }, 1000); // Check every second

      // Store interval ID for cleanup
      window.audioMonitoringIntervalId = audioMonitoringInterval;

      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) {
        notify("No video track found in screen capture", "error");
        setIsPlaying(false);
        setIsRecording(false);
        return;
      }

      // Create video element for screen capture
      const videoEl = document.createElement("video");
      videoEl.srcObject = new MediaStream([videoTrack]);
      videoEl.style.display = "none";
      document.body.appendChild(videoEl);
      videoElRef.current = videoEl;

      // Wait for video to be ready
      await videoEl.play();

      // Create canvas with target dimensions
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvasRef.current = canvas;

      console.log(
        "Canvas dimensions:",
        canvas.width,
        canvas.height,
        "Player dimensions:",
        width,
        height,
        "Target dimensions:",
        targetWidth,
        targetHeight,
        "DPR:",
        dpr
      );

      const ctx = canvas.getContext("2d");

      // Create canvas stream
      const canvasStream = canvas.captureStream(fps);

      // Combine video from canvas with audio
      const tracks = [canvasStream.getVideoTracks()[0]];

      // Add internal audio if available, otherwise use screen capture audio
      if (audioDestination.stream.getAudioTracks().length > 0) {
        tracks.push(audioDestination.stream.getAudioTracks()[0]);
      } else if (streamRef.current.getAudioTracks().length > 0) {
        tracks.push(streamRef.current.getAudioTracks()[0]);
      }

      const combinedStream = new MediaStream(tracks);

      // Set up recorder with the best supported mime type
      setRecordingStatus("Setting up recorder...");
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
        videoBitsPerSecond: bitrate,
        audioBitsPerSecond: 128000,
      });

      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        console.log("Data available, size:", e.data.size);
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setRecordingStatus("Recording error! Stopping...");
        cleanupRecording();
      };

      recorder.onstop = async () => {
        setRecordingStatus("Processing recording...");
        stopRequested = true;
        setIsRecording(false);
        // Create blob with the mime type we're using
        let blob = null;
        try {
          blob = new Blob(recordedChunksRef.current, { type: mimeType });
        } catch (err) {
          console.error("Failed to create blob:", err);
          blob = new Blob(recordedChunksRef.current, { type: "video/webm" }); // Fallback
        }

        if (!blob || blob.size === 0) {
          console.error("Empty blob created");
          notify(
            "Recording failed to create valid data. Please try again later.",
            "error"
          );
          setIsPlaying(false);
          cleanupRecording();
          return;
        }

        console.log("Recording completed, blob size:", blob.size);

        if (type === "generate-subtitles") {
          setRecordingStatus("Generating subtitles...");
          const file = new File([blob], "video.webm");
          const formData = new FormData();
          formData.append("video", file);

          fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/upload-video`, {
            method: "POST",
            body: formData,
          })
            .then(async (res) => {
              res = await res.json();
              console.log("Video uploaded:", res);
              setRecordingStatus("Processing audio for subtitles...");
              return res.audioUrl;
            })
            .then((audioUrl) => {
              fetch(
                `${
                  import.meta.env.VITE_SERVER_URL
                }/api/user/generate-subtitles`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    audioPath: audioUrl,
                  }),
                }
              )
                .then(async (res) => {
                  const data = await res.json();
                  setRecordingStatus("Subtitles generated!");

                  // Send the subtitles back to the parent window
                  if (window.opener) {
                    window.opener.postMessage(
                      {
                        type: "SUBTITLES_GENERATED",
                        subtitles: data.subtitles,
                      },
                      "*"
                    );
                  }
                  setSubtitleArray(data.subtitles);
                  console.log("Subtitles generated:", data.subtitles);
                  setIsPlaying(false);
                  cleanupRecording();
                })
                .catch((err) => {
                  console.error("Failed to generate subtitles:", err);
                  setRecordingStatus("Failed to generate subtitles");
                  setIsPlaying(false);
                  cleanupRecording();
                });
            })
            .catch((err) => {
              console.error("Failed to upload video:", err);
              setRecordingStatus("Failed to upload video");
              setIsPlaying(false);
              cleanupRecording();
            });
        } else {
          // Download the recording
          setRecordingStatus("Preparing download...");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `recording-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          cleanupRecording();
          setIsPlaying(false);
        }
      };

      // Start the recorder with more frequent data collection
      recorder.start(1000); // Collect data every second
      setRecordingStatus("Recording...");

      let stopRequested = false;
      if (recordingTime >= maxTimeInSeconds) {
        stopRequested = true;
        setIsPlaying(false);
        cleanupRecording();
      }

      // The draw loop needs to constantly recalculate position
      // in case of scrolling or player movement
      const drawLoop = () => {
        if (!stopRequested && recorderRef.current?.state === "recording") {
          // Get current position which might have changed
          const updatedRect = playerElement.getBoundingClientRect();

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          try {
            // Calculate aspect ratios
            const playerAspectRatio = updatedRect.width / updatedRect.height;
            const targetAspectRatio = targetWidth / targetHeight;

            // Calculate dimensions to maintain aspect ratio and fill canvas
            let sourceWidth = updatedRect.width;
            let sourceHeight = updatedRect.height;
            let sourceX = updatedRect.left;
            let sourceY = updatedRect.top;

            // Determine drawing parameters for the canvas
            let destX = 0;
            let destY = 0;
            let destWidth = targetWidth;
            let destHeight = targetHeight;

            // Draw the video player to fill the canvas while maintaining aspect ratio
            ctx.drawImage(
              videoEl,
              sourceX * dpr,
              sourceY * dpr,
              sourceWidth * dpr,
              sourceHeight * dpr,
              destX,
              destY,
              destWidth,
              destHeight
            );
          } catch (err) {
            console.warn("Canvas drawing error:", err);
          }

          requestAnimationFrame(drawLoop);
        }
      };

      drawLoop();

      // Add event listener for when screen sharing is stopped by user
      videoTrack.addEventListener("ended", () => {
        console.log("Screen capture ended by user");
        stopRequested = true;
        setIsPlaying(false);
        cleanupRecording();
      });
    } catch (err) {
      console.error("Screen capture error:", err);
      notify("Error while capturing screen. Please try again later.", "error");
      setIsPlaying(false);
      cleanupRecording();
    }
  };

  const cleanupRecording = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear audio monitoring interval
    if (window.audioMonitoringIntervalId) {
      clearInterval(window.audioMonitoringIntervalId);
      window.audioMonitoringIntervalId = null;
    }

    // Close audio context if it exists
    if (window.audioContextRef) {
      try {
        window.audioContextRef.close();
      } catch (err) {
        console.warn("Error closing audio context:", err);
      }
      window.audioContextRef = null;
    }

    // Close recorder
    if (recorderRef.current) {
      if (recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
    }

    // Remove video element
    if (videoElRef.current) {
      videoElRef.current.remove();
      videoElRef.current = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      canvasRef.current = null;
    }

    setRecordingTime(0);
    setIsRecording(false);
    setRecordingStatus("");
  };
  const startRecording = () => {
    if (isRecording) return;
    captureVideoPlayer();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "80px",
        gap: "20px",
        cursor: "none",
      }}
    >
      {showNullMessage && (
        <h2 style={{ color: "white" }}>
          Something went wrong, please try again
        </h2>
      )}
      {showNullMessage}
      {!showNullMessage && (
        <>
          {type === "generate-subtitles" && isRecording && (
            <h2 style={{ color: "white" }}>Generating subtitles...</h2>
          )}
          {type === "export" && isRecording && (
            <h2 style={{ color: "white" }}>Exporting...</h2>
          )}
          <h2 style={{ color: "white" }}>
            {recordingTime} and {maxTimeInSeconds}
          </h2>
          {isRecording && (
            <progress value={recordingTime / maxTimeInSeconds}></progress>
          )}
          {type === "export" &&
            !isRecording &&
            recordingTime >= maxTimeInSeconds &&
            recordingTime !== 0 &&
            maxTimeInSeconds !== 0 && (
              <h2 style={{ color: "white" }}>Export completed!</h2>
            )}
          {type === "generate-subtitles" &&
            !isRecording &&
            recordingTime >= maxTimeInSeconds &&
            recordingTime !== 0 &&
            maxTimeInSeconds !== 0 && (
              <h2 style={{ color: "white" }}>
                Subtitles generated successfully!
              </h2>
            )}
          {recordingTime <= maxTimeInSeconds && (
              <VideoPlayer
                _aspectRatio={aspectRatio}
                isExportRecording={isRecording}
              />
            )}
          {!isRecording && (
            <div
              style={{
                bottom: "20px",
                left: "20px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {recordingTime <= maxTimeInSeconds && (
                  <button
                    className="tooltip-export"
                    data-tooltip-content={
                      maxTimeInSeconds === 0
                        ? "Please export again to proceed"
                        : isRecording
                        ? "Export has started"
                        : "Click here to export"
                    }
                    onClick={startRecording}
                    disabled={isRecording || maxTimeInSeconds === 0}
                    style={{
                      padding: "10px 20px",
                      background:
                        isRecording || maxTimeInSeconds === 0
                          ? "#888"
                          : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: isRecording ? "not-allowed" : "pointer",
                    }}
                  >
                    {"Export"}
                  </button>
                )}
            </div>
          )}
        </>
      )}
      <Tooltip
        anchorSelect=".tooltip-export"
        place="top"
        style={{
          backgroundColor: "#892fff",
          color: "white",
          fontSize: "12px",
          padding: "5px",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

export default ExportPreview;
