// useCaptureVideoPlayer.js
import { useContext, useRef } from "react";
import AppContext from "../AppContext";
import { notify } from "./toast";

export const useCaptureVideoPlayer = () => {
  const {
    setIsPlaying,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    seekerPosition,
    maxTime,
    convertToPixels,
    setZoomTimeline,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useContext(AppContext);

  // Add refs to manage streams and cleanup
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const capture = async () => {
    try {
      // Reset state
      setIsPlaying(false);
      setSeekerPosition(0);
      setSeekerPositionManuallyChanged(true);
      setZoomTimeline("1");
      let seeker = seekerPosition;
      const maxTimeInPixels = convertToPixels(maxTime);

      // Get the video player element
      const playerElement = document.querySelector(".video-player");
      if (!playerElement) {
        // console.error("No .video-player found");
        notify(
          "Something went wrong. Please refresh the page or try exporting again.",
          "error"
        );
        return;
      }

      // Get more precise coordinates of the player in the viewport
      const rect = playerElement.getBoundingClientRect();

      // Record these dimensions for later processing with FFmpeg
      window.captureRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        // Store window scroll position to adjust for it
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };


      // Use react-media-recorder's startRecording (from context)
      await startRecording();
      // Start playback
      setIsPlaying(true);

      // Clear any existing intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Monitor playback progress
      intervalRef.current = setInterval(async () => {
        if (seeker >= maxTimeInPixels) {
          // End recording when we reach the end
          setIsPlaying(false);
          stopRecording();
          clearInterval(intervalRef.current);
          await processVideoWithExactCoordinates(mediaBlobUrl, clearBlobUrl);
        } else {
          seeker += 9; // Increment seeker position
        }
      }, 1000);
    } catch (error) {
      notify("Something went wrong during capture", "error");
      cleanupCapture();
    }
  };

  const cleanupCapture = () => {
    // Stop any active intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop any active streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsPlaying(false);
  };

  const processVideoWithExactCoordinates = async (
    mediaBlobUrl,
    clearBlobUrl
  ) => {
    try {
      const blobUrl = await checkBlobUrl(() => mediaBlobUrl);
      const recordedBlob = await fetch(blobUrl).then((r) => r.blob());
      // Get the stored capture rectangle that we saved during recording
      const captureRect =
        window.captureRect ||
        document.querySelector(".video-player").getBoundingClientRect();

      // Account for scroll position in the coordinates
      const processedBlob = await processVideoWithFFmpeg(
        recordedBlob,
        {
          // Add scroll offsets to get absolute document coordinates
          top: captureRect.top + (captureRect.scrollY || 0),
          left: captureRect.left + (captureRect.scrollX || 0),
          width: captureRect.width,
          height: captureRect.height,
        },
        { width: 1920, height: 1280 },
        1000000,
        30
      );

      const url = URL.createObjectURL(processedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      clearBlobUrl();

      // Clear the stored capture rectangle
      delete window.captureRect;
    } catch (error) {
      notify("Error processing video", "error");
    }
  };

  return capture;
};

const checkBlobUrl = (getMediaBlobUrl, timeout = 30000, intervalTime = 500) =>
  new Promise((resolve, reject) => {
    const start = Date.now();

    const interval = setInterval(() => {
      const currentUrl = getMediaBlobUrl();

      if (currentUrl) {
        clearInterval(interval);
        resolve(currentUrl);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Timed out waiting for media blob URL"));
      }
    }, intervalTime);
  });

// Keep the processVideoWithFFmpeg function as it is
export const processVideoWithFFmpeg = async (
  blob,
  dimensions,
  targetDimensions,
  token,
  projectId
) => {
  try {
    const { top, left, width, height } = dimensions;
    const { width: targetWidth, height: targetHeight } = targetDimensions;
    const formData = new FormData();
    formData.append("video", blob);
    formData.append("top", top);
    formData.append("left", left);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("targetWidth", targetWidth);
    formData.append("targetHeight", targetHeight);
    formData.append("projectId", projectId);
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/export/process-video`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Processing failed");

    const processedBlob = await response.blob();
    return processedBlob;
  } catch (err) {
    // console.error("FFmpeg processing error:", err);
    // throw err;
  }
};
