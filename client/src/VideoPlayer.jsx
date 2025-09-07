import React, { useContext, useEffect, useState, useRef } from "react";
import TextEffect from "./components/text/TextEffect";
import MediaPlayerContainer from "./components/mediaPlayer/MediaPlayerContainer";
import AppContext from "./AppContext";
import SubtitlesPreview from "./components/subtitles/SubtitlesPreview";
import { getCurrentSources } from "./utils/getCurrentSources";

const VideoPlayer = ({ _aspectRatio, isExportRecording }) => {
  const {
    videoPlayerRef,
    aspectRatio,
    seekerPosition,
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    maxTime,
    convertToPixels,
    isPlaying,
    setCurrentEffectsAndTiming,
    setCurrentSourceAndTiming,
    zoomTimeline,
    sourceAndTiming,
    effectsAndTiming,
    setSourceAndTiming,
    setEffectsAndTiming,
  } = useContext(AppContext);
  const [hasExportStarted, setHasExportStarted] = useState(false);
  const [scaledSourceAndTiming, setScaledSourceAndTiming] = useState([]);
  const [scaledEffectsAndTiming, setScaledEffectsAndTiming] = useState([]);
  const [originalSourceAndTiming, setOriginalSourceAndTiming] = useState([]);
  const [originalEffectsAndTiming, setOriginalEffectsAndTiming] = useState([]);
  const intervalRef = useRef(null);

  const getWidthByAspectRatio = (aspectRatio = "16/9") => {
    const [w, h] = aspectRatio.split("/").map(Number);
    const VIDEO_HEIGHT = aspectRatio === "9/16" ? 360 : 300;
    const VIDEO_WIDTH = Math.round((VIDEO_HEIGHT * w) / h);
    const vw = (VIDEO_WIDTH / window.innerWidth) * 100;

    const clampedVw = Math.min(Math.max(vw, 40), 50);
    return `${clampedVw}vw`;
  };

  // Scale sources and effects for export mode
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
  };

  const updateSeekerPositionDuringExport = () => {
    const maxPositionInPixels = convertToPixels(maxTime);
    console.log("Max position in pixels:", maxPositionInPixels);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSeekerPosition((prevSeekerPosition) => {
        const newPosition = prevSeekerPosition + 10;

        if (newPosition > maxPositionInPixels) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setHasExportStarted(true);
          return maxPositionInPixels;
        }

        return newPosition;
      });
    }, 1000);
  };

  // Scale sources and effects when export mode changes
  useEffect(() => {
    if (isExportRecording) {
      // Store original values before scaling
      setOriginalSourceAndTiming(sourceAndTiming);
      setOriginalEffectsAndTiming(effectsAndTiming);

      const scaledSources = scaleElementsForExport(sourceAndTiming, 2);
      const scaledEffects = scaleElementsForExport(effectsAndTiming, 2);
      setScaledSourceAndTiming(scaledSources);
      setScaledEffectsAndTiming(scaledEffects);

      // Update the context with scaled values
      setSourceAndTiming(scaledSources);
      setEffectsAndTiming(scaledEffects);
      console.log("scaling", scaledSources);
      
    } else {
      // Restore original values when not exporting
      console.log("restoring", sourceAndTiming);
      
      // Clear scaled arrays
      setScaledSourceAndTiming([]);
      setScaledEffectsAndTiming([]);
    }
  }, [isExportRecording]);

  useEffect(() => {
    if (isExportRecording) {
      const currentSources = isExportRecording
        ? scaledSourceAndTiming
        : sourceAndTiming;
      const currentEffects = isExportRecording
        ? scaledEffectsAndTiming
        : effectsAndTiming;

      setCurrentSourceAndTiming(
        getCurrentSources(currentSources, seekerPosition, zoomTimeline)
      );
      setCurrentEffectsAndTiming(
        getCurrentSources(currentEffects, seekerPosition, zoomTimeline)
      );
    }
  }, [seekerPosition, scaledSourceAndTiming, scaledEffectsAndTiming]);

  useEffect(() => {
    if (isExportRecording && !hasExportStarted && isPlaying) {
      updateSeekerPositionDuringExport();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying]);

  return (
    <div
      className="video-player-zoom-wrapper"
      style={{
        marginTop: isExportRecording ? "100px" : "0px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        className="video-player"
        ref={videoPlayerRef}
        style={{
          aspectRatio: _aspectRatio ? _aspectRatio : aspectRatio,
          width: isExportRecording
            ? `${
                parseFloat(getWidthByAspectRatio(_aspectRatio || aspectRatio)) *
                2
              }vw`
            : getWidthByAspectRatio(_aspectRatio || aspectRatio),
          border: isExportRecording ? "1px solid #4c51bf" : "1px solid #ccc",
          position: "relative",
        }}
      >
        <SubtitlesPreview />
        <TextEffect />
        {[5, 4, 3, 2, 1].map((trackNum) => (
          <MediaPlayerContainer key={trackNum} trackNum={trackNum} />
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
