"use client";

import { useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "../../VideoPlayer";
import AppContext from "../../AppContext";
import { processVideoWithFFmpeg } from "../../utils/export";
import { notify } from "../../utils/toast";
import styles from "../header/styles/header.module.css";
import { useNavigate } from "react-router-dom";
import { recordingType } from "../../utils/MediaEnum";
import AuthContext from "../../AuthContext";

const ExportPreview = () => {
  const {
    setIsPlaying,
    maxTime,
    convertToPixels,
    isExportPreview,
    setIsExportPreview,
    isSubtitleGen,
    setIsSubtitleGen,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    setSubtitleArray,
    cursorDataObj,
    isPlaying,
    screenRecorder,
    cameraRecorder,
    screenChunks,
    cameraChunks,
    activeStreams,
    sourceAndTiming,
    effectsAndTiming,
    setSourceAndTiming,
    setEffectsAndTiming,
  } = useContext(AppContext);
const {userData} = useContext(AuthContext)

  const [recordingStatus, setRecordingStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const exportButtonRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const maxTimeInSeconds = convertToPixels(maxTime) / 10;

  // Enhanced subtitle generation with better error handling
  const handleSubtitleGeneration = async (blob, token) => {
    try {
      setRecordingStatus("Generating subtitles...");
      const file = new File([blob], "video.webm");
      const formData = new FormData();
      formData.append("video", file);

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/user/upload-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      setRecordingStatus("Processing audio for subtitles...");

      const subtitleResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/user/generate-subtitles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            audioPath: uploadResult.audioUrl,
          }),
          credentials: "include",
        }
      );

      if (!subtitleResponse.ok) {
        throw new Error(
          `Subtitle generation failed: ${subtitleResponse.status}`
        );
      }

      const subtitleData = await subtitleResponse.json();
      console.log("Subtitle generation response:", subtitleData);
      setRecordingStatus("Subtitles generated!");
      notify("Subtitles generated successfully!", "success");
      setSubtitleArray(subtitleData.subtitles);
    } catch (err) {
      console.error("Subtitle generation failed:", err);
      setRecordingStatus("Failed to generate subtitles");
      notify("Subtitle generation failed", "error");
    }
  };

  const startRecording = async (type = recordingType.screen) => {
    try {
      console.log("Starting div capture recording...");
      setRecordingStatus("Initializing recording...");
      setIsPlaying(false);
      setSeekerPosition(0);
      setSeekerPositionManuallyChanged(true);
      setIsSubtitleGen(false);
      exportButtonRef.current.style.display = "none";
      // Get the video player element
      const videoPlayerElement =
        document.querySelector(".video-player") ||
        document.querySelector('[class*="video-player"]') ||
        document.querySelector("video");

      if (!videoPlayerElement) {
        throw new Error("Video player element not found");
      }

      let screenStream = null;
      let systemAudioStream = null;

      // Method 1: Try getDisplayMedia with preferCurrentTab for better element capture
      try {
        console.log(
          "Attempting getDisplayMedia with current tab preference..."
        );
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window", // Focus on window capture
            cursor: "never",
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
          },
          preferCurrentTab: true, // This helps capture the current browser tab
        });

        // Separate system audio capture for better reliability
        try {
          systemAudioStream = await navigator.mediaDevices.getDisplayMedia({
            video: false,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              sampleRate: 48000,
            },
          });
        } catch (audioError) {
          console.warn("Separate system audio capture failed:", audioError);
        }
      } catch (displayError) {
        console.log(
          "getDisplayMedia failed, trying alternative methods:",
          displayError
        );

        // Fallback for Electron-specific APIs
        if (window.electronAPI) {
          try {
            const sources = await window.electronAPI.getDesktopSources();
            const appSource = sources.find((source) =>
              source.name
                .toLowerCase()
                .includes(
                  "Rookieclip - Auto Zoom Recorder and Editor".toLowerCase()
                )
            );

            if (appSource) {
              screenStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: appSource.id,
                    echoCancellation: false,
                    noiseSuppression: false,
                  },
                },
                video: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: appSource.id,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxFrameRate: 30,
                  },
                },
              });
            }
          } catch (electronError) {
            console.error("Electron desktop capture failed:", electronError);
          }
        }

        // Final fallback
        if (!screenStream) {
          screenStream = await navigator.mediaDevices.getUserMedia({
            video: {
              mediaSource: "screen",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            },
          });
        }
      }

      if (!screenStream) {
        throw new Error("Could not obtain screen stream");
      }
      setIsRecording(true);
      // Create audio context for mixing multiple audio sources
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const audioDestination = audioContext.createMediaStreamDestination();

      // Capture video element audio specifically
      // const captureVideoElementAudio = () => {
      //   try {
      //     const videoElements = document.querySelectorAll("video, audio");
      //     videoElements.forEach((element) => {
      //       if (element.captureStream && !element.muted) {
      //         try {
      //           const elementStream = element.captureStream();
      //           const audioTracks = elementStream.getAudioTracks();

      //           if (audioTracks.length > 0) {
      //             const source =
      //               audioContext.createMediaStreamSource(elementStream);
      //             source.connect(audioDestination);
      //             console.log("Connected video element audio");
      //           }
      //         } catch (err) {
      //           console.warn("Could not capture element audio:", err);
      //         }
      //       }
      //     });
      //   } catch (err) {
      //     console.warn("Video element audio capture failed:", err);
      //   }
      // };

      // Add system audio to mix
      if (systemAudioStream) {
        const systemAudioTracks = systemAudioStream.getAudioTracks();
        if (systemAudioTracks.length > 0) {
          const systemSource =
            audioContext.createMediaStreamSource(systemAudioStream);
          systemSource.connect(audioDestination);
          console.log("Connected system audio");
        }
      } else if (screenStream.getAudioTracks().length > 0) {
        const screenAudioTracks = screenStream.getAudioTracks();
        const screenAudioSource = audioContext.createMediaStreamSource(
          new MediaStream(screenAudioTracks)
        );
        screenAudioSource.connect(audioDestination);
        console.log("Connected screen audio");
      }

      // Capture video element audio
      // captureVideoElementAudio();

      // Combine video and mixed audio
      const videoTracks = screenStream.getVideoTracks();
      const mixedAudioTracks = audioDestination.stream.getAudioTracks();

      const combinedStream = new MediaStream([
        ...videoTracks,
        ...mixedAudioTracks,
      ]);

      // Enhanced MediaRecorder options
      const getRecorderOptions = () => {
        const options = {
          mimeType: "video/webm;codecs=vp9",
          videoBitsPerSecond: 100000000, // 100 Mbps for good quality
          audioBitsPerSecond: 128000, // 128 kbps for audio
        };

        // Try different codecs in order of preference
        const codecPreferences = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm;codecs=h264,opus",
          "video/webm",
        ];

        for (const codec of codecPreferences) {
          if (MediaRecorder.isTypeSupported(codec)) {
            options.mimeType = codec;
            break;
          }
        }

        return options;
      };

      console.log("Creating MediaRecorder...");
      const recorderOptions = getRecorderOptions();
      console.log("Using recorder options:", recorderOptions);

      screenRecorder.current = new MediaRecorder(
        combinedStream,
        recorderOptions
      );
      screenChunks.current = [];

      // Enhanced event handlers
      screenRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          screenChunks.current.push(event.data);
          console.log(`Recording chunk: ${event.data.size} bytes`);
        }
      };

      screenRecorder.current.onstop = () => {
        stopRecording();
        console.log(
          `Recording stopped. Total chunks: ${screenChunks.current.length}`
        );
        setRecordingStatus("Processing recording...");

        // Process and download the recording
        setTimeout(async () => {
          if (screenChunks.current.length > 0) {
            const blob = new Blob(screenChunks.current, { type: "video/webm" });

            // Generate subtitles if enabled
            if (isSubtitleGen) {
              await handleSubtitleGeneration(blob, userData.token);
            } else {
              // Replace the cropping calculation section in your startRecording function with this:

              const computedStyle = window.getComputedStyle(videoPlayerElement);
              const rect = videoPlayerElement.getBoundingClientRect();

              // Account for borders and padding
              const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
              const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
              const borderRight =
                parseFloat(computedStyle.borderRightWidth) || 0;
              const borderBottom =
                parseFloat(computedStyle.borderBottomWidth) || 0;

              const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
              const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
              const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
              const paddingBottom =
                parseFloat(computedStyle.paddingBottom) || 0;

              const dpr = window.devicePixelRatio || 1;

              // Calculate the actual content area (excluding borders and padding)
              const contentRect = {
                left: rect.left + borderLeft + paddingLeft,
                top: rect.top + borderTop + paddingTop,
                width:
                  rect.width -
                  borderLeft -
                  borderRight -
                  paddingLeft -
                  paddingRight,
                height:
                  rect.height -
                  borderTop -
                  borderBottom -
                  paddingTop -
                  paddingBottom,
              };

              // Fine-tune margins to ensure precise cropping
              const leftMargin = 2; // 2px margin on left
              const topMargin = 0; // Remove top margin to prevent cropping from top
              const rightPadding = 4; // Remove 4px from right to avoid capturing outside content
              const bottomPadding = 2; // Reduce bottom padding to prevent showing content below

              const preciseCrop = {
                left: Math.max(
                  0,
                  (contentRect.left - leftMargin + window.scrollX) * dpr
                ),
                top: Math.max(
                  0,
                  (contentRect.top + topMargin + window.scrollY) * dpr
                ), // Add topMargin instead of subtracting
                width: Math.round(
                  (contentRect.width + leftMargin - rightPadding) * dpr
                ),
                height: Math.round(
                  (contentRect.height - topMargin - bottomPadding) * dpr
                ), // Subtract topMargin from height
              };

              console.log("Original rect:", rect);
              console.log("Content rect:", contentRect);
              console.log("Precise crop:", preciseCrop);
              console.log("Device pixel ratio:", dpr);

              const videoWidth = 1920;
              const videoHeight = 1080;

              try {
                setRecordingStatus("Processing video...");

                const newBlob = await processVideoWithFFmpeg(
                  blob,
                  preciseCrop,
                  {
                    width: videoWidth,
                    height: videoHeight,
                  },
                  userData.token,
                  window.location.pathname.split("/")[1]
                );

                setRecordingStatus("Preparing download...");
                downloadBlob(newBlob, "recording.webm");
              } catch (processError) {
                notify("Video processing failed", "error");
                console.error("Video processing failed:", processError);
                // Fallback: download original blob
              }
            }
            screenChunks.current = [];
          }

          // Cleanup
          audioContext.close().catch(console.warn);
          setRecordingStatus("");
        }, 1000);
      };

      screenRecorder.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setRecordingStatus("Recording error occurred");
      };

      // Handle stream ending
      const handleStreamEnd = () => {
        console.log("Stream ended by user");
        if (
          screenRecorder.current &&
          screenRecorder.current.state === "recording"
        ) {
          screenRecorder.current.stop();
        }
      };

      screenStream.getVideoTracks().forEach((track) => {
        track.onended = handleStreamEnd;
      });

      // Store references for cleanup
      activeStreams.current = [screenStream];
      if (systemAudioStream) {
        activeStreams.current.push(systemAudioStream);
      }

      // Start recording with time slicing for better performance
      screenRecorder.current.start(1000); // 1 second chunks
      setRecordingStatus("Recording...");

      // Start video playback AFTER recording starts
      setTimeout(() => {
        setIsPlaying(true);
        console.log("Started video playback");
      }, 100);

      // Auto-stop after maxTime if set
      if (maxTimeInSeconds > 0) {
        setTimeout(() => {
          if (
            screenRecorder.current &&
            screenRecorder.current.state === "recording"
          ) {
            console.log("Auto-stopping recording after max time");
            screenRecorder.current.stop();
          }
        }, maxTimeInSeconds * 1000);
      }

      console.log("Recording started successfully");
    } catch (err) {
      console.error("Recording setup failed:", err);

      // Cleanup on error
      activeStreams.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      activeStreams.current = [];

      // User-friendly error messages
      let errorMessage = "Recording failed: ";
      switch (err.name) {
        case "NotAllowedError":
          errorMessage +=
            "Permission denied. Please allow screen recording access.";
          break;
        case "NotSupportedError":
          errorMessage += "Screen recording is not supported in this browser.";
          break;
        case "NotFoundError":
          errorMessage += "No recording source found.";
          break;
        case "AbortError":
          errorMessage += "Recording was cancelled by user.";
          break;
        default:
          errorMessage += "Unknown error occurred.";
      }

      setRecordingStatus("");
      notify(errorMessage, "error");
    }
  };

  // Enhanced stop recording function

  const stopRecording = async () => {
    console.log("Stopping recording...");
    setRecordingStatus("Stopping recording...");
    setIsRecording(false);
    exportButtonRef.current.style.display = "none";
    try {
      // Stop cursor recording if active (Electron specific)
      if (
        window.electronAPI &&
        typeof window.electronAPI.forceStopRecording === "function"
      ) {
        await window.electronAPI.forceStopRecording();
      }

      // Stop MediaRecorder
      if (
        screenRecorder.current &&
        screenRecorder.current.state === "recording"
      ) {
        screenRecorder.current.stop();
      }

      if (
        cameraRecorder.current &&
        cameraRecorder.current.state === "recording"
      ) {
        cameraRecorder.current.stop();
      }

      // Stop all active streams
      activeStreams.current.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          console.log(`Stopping ${track.kind} track:`, track.label);
          track.stop();
        });
      });
      activeStreams.current = [];

      setIsPlaying(false);
      console.log("Recording stopped successfully");
    } catch (err) {
      console.error("Error stopping recording:", err);
      setRecordingStatus("Error stopping recording");
    }
  };

  // Utility function for better blob downloading
  const downloadBlob = (chunks, filename) => {
    try {
      const blob = Array.isArray(chunks)
        ? new Blob(chunks, { type: "video/webm" })
        : chunks;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`Downloaded: ${filename}`);
      notify("Recording downloaded successfully!", "success");
    } catch (error) {
      console.error("Download failed:", error);
      notify("Failed to download recording", "error");
    }
  };

  // const handleSubtitleGeneration = async (blob, token) => {
  //   try {
  //     setRecordingStatus("Generating subtitles...");
  //     const file = new File([blob], "video.webm");
  //     const formData = new FormData();
  //     formData.append("video", file);

  //     const uploadResponse = await fetch(
  //       `${import.meta.env.VITE_SERVER_URL}/api/user/upload-video`,
  //       {
  //         method: "POST",
  //         headers: { Authorization: `Bearer ${token}` },
  //         body: formData,
  //         credentials: "include",
  //       }
  //     );

  //     const uploadResult = await uploadResponse.json();
  //     setRecordingStatus("Processing audio for subtitles...");

  //     const subtitleResponse = await fetch(
  //       `${import.meta.env.VITE_SERVER_URL}/api/user/generate-subtitles`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ audioPath: uploadResult.audioUrl }),
  //         credentials: "include",
  //       }
  //     );

  //     const subtitleData = await subtitleResponse.json();
  //     setRecordingStatus("Subtitles generated!");
  //     setSubtitleArray(subtitleData.subtitles);
  //   } catch (err) {
  //     console.error("Subtitle generation failed:", err);
  //     setRecordingStatus("Failed to generate subtitles");
  //   }
  // };

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.monitoringInterval) {
        clearInterval(audioContextRef.current.monitoringInterval);
      }
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.warn("Failed to close audio context:", err);
      }
      audioContextRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    setRecordingStatus("");
  };

  const scaleElementsForExport = (elements, scale) => {
    return elements.map((element) => ({
      ...element,
      size: element.size
        ? {
            width: element.size.width * scale,
            height: element.size.height * scale,
          }
        : element.size,
      position: element.position
        ? {
            x: element.position.x * scale,
            y: element.position.y * scale,
          }
        : element.position,
    }));
    console.log("SCALED DOWN", sourceAndTiming);
  };

  const handleScale = () => {
    // Scale sources and effects for export mode
    const scaledSources = scaleElementsForExport(sourceAndTiming, 0.5);
    const scaledEffects = scaleElementsForExport(effectsAndTiming, 0.5);

    // Update the context with scaled values
    setSourceAndTiming(scaledSources);
    setEffectsAndTiming(scaledEffects);

    console.log("SCALED DOWN", scaledSources);
  };
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [isPlaying]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      <VideoPlayer isExportRecording={true} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "50px",
          gap: "20px",
        }}
      >
        <button
          ref={exportButtonRef}
          onClick={() => {
            startRecording(recordingType.screen);
          }}
          className="button-purple"
          style={{
            minWidth: "60px",
            maxWidth: "fit-content",
            height: "30px",
          }}
        >
          Start
        </button>
        <button
          onClick={() => {
            stopRecording();
            handleScale();
            setIsExportPreview(false);
            setSeekerPosition(0);
            setSeekerPositionManuallyChanged(true);
            setIsPlaying(false);
            setIsSubtitleGen(false);
          }}
          className="button-purple"
          style={{
            minWidth: "60px",
            maxWidth: "fit-content",
            height: "30px",
          }}
        >
          Go back
        </button>

        {recordingStatus !== "" && (
          <p style={{ marginTop: "20px", color: "white", fontSize: "15px" }}>
            Recording status: {recordingStatus}
          </p>
        )}
        {isRecording && (
          <div style={{ marginTop: "20px", color: "white", fontSize: "15px" }}>
            <label>Don't close this window or open any other window</label>
            <ul style={{ listStyleType: "disc", paddingLeft: "10px" }}>
              <li>Your entire screen is being recorded</li>
              <li>
                After recording is completed, it will be cropped to only include
                the video
              </li>
              <li>The recording will then be enhanced and downloaded</li>
              <li>The result might be inaccurate</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPreview;
