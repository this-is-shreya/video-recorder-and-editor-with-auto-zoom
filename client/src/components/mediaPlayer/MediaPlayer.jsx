import React, { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { mediaType } from "../../utils/MediaEnum";

const useKeyPress = (key, callback, withCtrl = false) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (withCtrl ? event.ctrlKey && event.key === key : event.key === key) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, withCtrl]);
};

const MediaPlayer = ({ trackNum, setIsTransitioning, setTransitionType }) => {
  const {
    currentSourceAndTiming,
    isPlaying,
    seekerPosition,
    setCurrentSourceAndTiming,
    sourceAndTiming,
    setSourceAndTiming,
    selectedElement,
    seekerPositionManuallyChanged,
    setSeekerPositionManuallyChanged,
    setSeekerPosition,
    isSplit,
    zoomTimeline,
    isTrim,
    setIsTrim,
    setIsPlaying,
    isExportPreview,
    convertToPixels,
    maxTime,
  } = useContext(AppContext);

  // Ensure there is valid video data
  const currentSourceAndTimingFiltered = currentSourceAndTiming.filter(
    (item) => item.trackNum === trackNum
  );
  console.log("MP: ", currentSourceAndTimingFiltered, trackNum);
  if (!currentSourceAndTiming || !currentSourceAndTimingFiltered[0]) {
    return null;
  }

  const [currentZoomLevel, setCurrentZoomLevel] = useState(1);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  // const key = Object.keys(currentSourceAndTimingFiltered)[0];
  const {
    source,
    start,
    end,
    newStart,
    newEnd,
    borderRadius,
    speed,
    zoomCenter,
    zoomStart,
    zoomDuration,
    zoomLevel,
    startsFrom,
    volume,
    transitionType,
    transitionFromId,
  } = currentSourceAndTimingFiltered[0];
  console.log("currentsandt", currentSourceAndTiming);
  // Initialize state for position and size from currentSourceAndTiming
  const [position, setPosition] = useState(
    currentSourceAndTimingFiltered[0].position || { x: 0, y: 0 }
  );
  const [currentEffect, setCurrentEffect] = useState(
    currentSourceAndTimingFiltered[0].effectType
  );

  const [size, setSize] = useState(currentSourceAndTimingFiltered[0].size);
  const videoRef = useRef(null); // Reference to the video element
  const audioRef = useRef(null); // Reference to the audio element
  const imgRef = useRef(null); // Reference to the img element
  const lastSeekerPosition = useRef(seekerPosition); // To track the last seeker position
  const lastIsPlaying = useRef(isPlaying); // To track the last isPlaying state
  const hasSetStartTime = useRef(false); // Flag to track if startTime has been set
  const [videoSource, setVideoSource] = useState(source); // To track video source changes
  const [audioSource, setAudioSource] = useState(source); // To track audio source changes
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Update `currentSourceAndTiming` when size or position changes
  const updateContext = (newPosition, newSize) => {
    // setCurrentSourceAndTiming(updatedData);

    setSourceAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentSourceAndTimingFiltered[0].id
          ? { ...item, position: newPosition, size: newSize }
          : item
      )
    );
    console.log(
      "Updated Context with New Size:",
      newSize,
      " for ",
      currentSourceAndTimingFiltered[0].id
    );
  };

  useEffect(() => {
    if (currentSourceAndTimingFiltered[0]) {
      setPosition(currentSourceAndTimingFiltered[0].position || { x: 0, y: 0 });
      setSize(currentSourceAndTimingFiltered[0].size);
    }
  }, [currentSourceAndTimingFiltered[0]?.id]); // Trigger update when the video ID changes

  useEffect(() => {
    setVideoSource(source);
    setVideoLoaded(false); // Reset load state to force update
  }, [source]);

  //for video
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.volume = volume;

    if (!hasSetStartTime.current) {
      setTimeout(() => {
        video.currentTime = startsFrom;
        hasSetStartTime.current = true;
      }, 50);
    }
    if (!videoSource || videoSource !== source) {
      console.log("New video loaded, updating start time");
      // videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);
      // if (isPlaying) videoRef.current.play();
      hasSetStartTime.current = false;
      setVideoSource(source);
    }
    video.onloadedmetadata = () => {
      setSize({ width: size.width, height: size.height });
      setVideoLoaded(true);
    };

    // Set playback speed
    video.playbackRate = speed;

    // Only seek if the user manually scrubs
    if (seekerPositionManuallyChanged || isSplit || isTrim) {
      const newTime =
        Math.floor(seekerPosition / pixels[zoomTimeline]) -
        newStart +
        startsFrom;
      video.currentTime =newTime
      
      console.log(">>Seeking to:", newTime);
      console.log(">>",
        seekerPosition,
        newStart,
        startsFrom,
        newTime,
      );
      setSeekerPositionManuallyChanged(false);
      setIsTrim(false);
    }

    // Handle playing/pausing
    if (isPlaying) {
      video.play().catch((error) => console.warn("Playback error:", error));
    } else {
      video.pause();
    }

    lastSeekerPosition.current = seekerPosition;
  }, [seekerPosition, isPlaying, speed, isSplit, isTrim]);

  //for audio
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = volume;

    if (isSplit) {
      hasSetStartTime.current = false;
    }
    if (!audioSource || audioSource !== source) {
      console.log("New audio loaded, updating start time");
      // audioRef.current.currentTime = Math.floor(startTime - newStart * 0.1);
      // if (isPlaying) audioRef.current.play();
      hasSetStartTime.current = false;
      setAudioSource(source);
    }
    if (!hasSetStartTime.current) {
      setTimeout(() => {
        audio.currentTime = startsFrom;
        hasSetStartTime.current = true;
      }, 50);
    }

    // Set playback speed
    audio.playbackRate = speed;

    // Only seek if the user manually scrubs
    if (seekerPositionManuallyChanged) {
      console.log("Seeking to:", seekerPosition);
      audio.currentTime =
        Math.floor(seekerPosition / pixels[zoomTimeline]) -
        newStart +
        startsFrom;
      setSeekerPositionManuallyChanged(false);
    }

    // Handle playing/pausing
    if (isPlaying) {
      audio.play().catch((error) => console.warn("Playback error:", error));
    } else {
      audio.pause();
    }
    lastSeekerPosition.current = seekerPosition;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= newEnd) {
        console.log("Reached end time, stopping playback");
        audio.pause();
        audio.currentTime = newEnd; // Ensure it doesn't go beyond
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [seekerPosition, isPlaying, speed]);

  //for applying zoom
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(seekerPosition / pixels[zoomTimeline]);

      if (video.currentTime >= startsFrom + (newEnd - newStart)) {
        video.pause();
        // video.currentTime = startsFrom; // Reset to the start position
      }
      if (zoomStart !== null && zoomDuration !== null) {
        if (
          currentTime >= Math.floor(newStart + zoomStart) &&
          currentTime <= Math.floor(newStart + zoomStart + zoomDuration)
        ) {
          // Zoom in
          setCurrentZoomLevel(Number(zoomLevel));
        } else {
          // Zoom out smoothly after zoomDuration
          setCurrentZoomLevel(1);
        }
        console.log("setting zoom as ", currentZoomLevel);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [zoomStart, zoomDuration, zoomLevel, seekerPosition]);

  //for transition
  useEffect(() => {
    if (
      newEnd - Math.floor(seekerPosition / pixels[zoomTimeline]) <= 1 &&
      transitionType != null
    ) {
      setIsTransitioning(true);
      setTransitionType(transitionType);
      console.log(">> set transition", transitionType);
    }
    if (newStart - Math.floor(seekerPosition / pixels[zoomTimeline]) > 1) {
      setIsTransitioning(false);
      setTransitionType(null);
    }
  }, [seekerPosition]);

  // Process video and stream it to an RND video element
  useEffect(() => {
    setCurrentEffect(currentSourceAndTimingFiltered[0].effectType);
  }, [currentSourceAndTimingFiltered]);



  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds=".video-player"
      enableResizing={!isExportPreview}
      onDragStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        updateContext(newPosition, size);
      }}
      onResizeStop={(e, direction, ref, delta, _position) => {
        let newWidth = ref.offsetWidth;
        let newHeight = ref.offsetHeight;

        if (borderRadius >= 50) {
          // Force a square for circular shape
          newWidth = newHeight = Math.min(newWidth, newHeight);
        }

        const newSize = { width: newWidth, height: newHeight };
        const newPosition = { x: _position.x, y: _position.y };

        setSize(newSize);
        setPosition(newPosition);
        updateContext(newPosition, newSize);
      }}
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        backgroundColor: "transparent",
        zIndex: trackNum,
        borderRadius: `${(borderRadius / 100) * size.height}px / ${
          (borderRadius / 100) * size.width
        }px`, // Ensures proper rounding
        cursor: isExportPreview ? "none" : "",
      }}
      className={`${selectedElement.id}-preview`}
    >
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.video && (
        <video
          key={source}
          ref={videoRef}
          src={source}
          autoPlay={false}
          muted={false}
          crossOrigin="anonymous"
          className={`video-player ${
            currentEffect !== "none" ? `video-effect-${currentEffect}` : ""
          }`}
          onLoadedMetadata={() => setVideoLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: videoLoaded ? 1 : 0, // Avoid display issues
            visibility: videoLoaded ? "visible" : "hidden",
            transition: `transform 0.3s ease-in-out, border-radius 0.3s ease-in-out`, // Apply transition to both transform and border-radius
            transform: isPlaying
              ? `scale(${currentZoomLevel}, ${currentZoomLevel})`
              : "",
            transformOrigin: isPlaying
              ? `${zoomCenter.x * 100}% ${zoomCenter.y * 100}%`
              : "", // Set origin,
            cursor: isExportPreview ? "none" : "",
          }}
        />
      )}
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.image && (
        <img
          src={source}
          ref={imgRef}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: isExportPreview ? "none" : "",
          }}
        ></img>
      )}
      {currentSourceAndTimingFiltered[0].source === "blurred-element" && (
        <div
          style={{
            position: "absolute", // Ensures it overlays correctly
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(5px)", // Creates the blur effect
            WebkitBackdropFilter: "blur(5px)", // Safari support
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay
            borderRadius: `${(borderRadius / 100) * size.height}px / ${
              (borderRadius / 100) * size.width
            }px`,
            pointerEvents: "none", // Allows clicks to pass through,
            cursor: isExportPreview ? "none" : "",
          }}
        />
      )}

      {currentSourceAndTimingFiltered[0].source !== "blurred-element" &&
        currentSourceAndTimingFiltered[0].mediaType === mediaType.icons && (
          <img
            src={`https://api.iconify.design/${
              currentSourceAndTimingFiltered[0].source.split(":")[0]
            }/${
              currentSourceAndTimingFiltered[0].source.split(":")[1]
            }.svg?height=40`}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: isExportPreview ? "none" : "",
            }}
          ></img>
        )}
      {currentSourceAndTimingFiltered[0].mediaType === mediaType.audio && (
        <audio src={source} autoPlay={false} ref={audioRef}></audio>
      )}
    </Rnd>
  );
};

export default MediaPlayer;
