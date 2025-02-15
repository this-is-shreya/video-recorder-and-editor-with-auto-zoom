import React, { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import AppContext from "../AppContext";

const VideoPlayer = () => {
  const {
    currentSourceAndTiming,
    isPlaying,
    seekerPosition,
    setCurrentSourceAndTiming,
    selectedElement,
    videoPlayerRef,
  } = useContext(AppContext);

  // Ensure there is valid video data
  if (!currentSourceAndTiming || !currentSourceAndTiming[0]) {
    return null;
  }

  const [currentZoomLevel, setCurrentZoomLevel] = useState(1);
  // const key = Object.keys(currentSourceAndTiming[0])[0];
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
    startsFrom
  } = currentSourceAndTiming[0];
  // console.log("currentsandt", currentSourceAndTiming);
  // Initialize state for position and size from currentSourceAndTiming
  const [position, setPosition] = useState(
    currentSourceAndTiming[0].position || { x: 0, y: 0 }
  );
  const [size, setSize] = useState(
    currentSourceAndTiming[0].size || { width: "40vw", height: "22.5vh" } // Default to 16:9
  );

  const videoRef = useRef(null); // Reference to the video element
  const lastSeekerPosition = useRef(seekerPosition); // To track the last seeker position
  const lastIsPlaying = useRef(isPlaying); // To track the last isPlaying state
  const hasSetStartTime = useRef(false); // Flag to track if startTime has been set
  const [videoSource, setVideoSource] = useState(null); // To track video source changes
  // Calculate video start time based on seeker's position
  const calculateStartTime = () => {
    const startTime = Math.max(Math.floor(seekerPosition * 0.1 - start), 0); // Ensure it's positive
    // console.log(
    //   "starttimefromvideoplayer",
    //   startTime,
    //   seekerPosition,
    //   newStart,
    //   start
    // );

    return startTime;
  };
  // Update `currentSourceAndTiming` when size or position changes
  const updateContext = (newPosition, newSize) => {
    const updatedData = { ...currentSourceAndTiming };
    updatedData[0].position = newPosition;
    updatedData[0].size = newSize;
    setCurrentSourceAndTiming(updatedData); // Update the context
  };

  // Control video playback based on `isPlaying` and seeker position
  // useEffect(() => {
  //   console.log("video players: ", currentSourceAndTiming);

  //   if (videoRef.current) {
  //     const startTime = calculateStartTime();
  //     videoRef.current.playbackRate = speed;
  //     // Set startTime only once when not playing
  //     if (!hasSetStartTime.current) {
  //       console.log("Setting startTime:", startsFrom);
  //       // videoRef.current.currentTime = startsFrom;
  //       videoRef.current.currentTime = Math.floor(seekerPosition*0.1 - newStart) + startsFrom;

  //       hasSetStartTime.current = true; // Mark start time as set
  //       if (isPlaying) videoRef.current.play();
  //     }
  //     if(isPlaying && lastIsPlaying.current && Math.abs(seekerPosition - lastSeekerPosition.current) >= 2){
  //       // videoRef.current.currentTime = Math.floor(startTime - newStart);
  //       videoRef.current.currentTime = Math.floor(seekerPosition*0.1 - newStart) + startsFrom;

  //       // videoRef.current.play();
  //     }
  //     // Control video playback state based on `isPlaying`
  //     if (isPlaying && !lastIsPlaying.current) {
  //       // console.log("Starting video playback");
  //       // videoRef.current.currentTime = Math.floor(seekerPosition*0.1 - newStart) + startsFrom;

  //       videoRef.current.play().catch((error) => {
  //         console.warn("Playback error:", error);
  //       });
  //     } else if (!isPlaying && lastIsPlaying.current) {
  //       // console.log("Pausing video playback");
  //       videoRef.current.pause();
  //       // hasSetStartTime.current = false; // Reset the start time
  //     }
  //     if (!videoSource || videoSource !== source) {
  //       console.log("New video loaded, updating start time");
  //       videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);
  //       if (isPlaying) videoRef.current.play();
  //       setVideoSource(source);
  //     }
  //     if (!isPlaying) {
  //       hasSetStartTime.current = false; // Reset the start time
  //     }
  //     // Update the last known state of isPlaying
  //     lastIsPlaying.current = isPlaying;

  //     // Update last known seeker position only if it's changed significantly
  //     if (Math.abs(seekerPosition - lastSeekerPosition.current) > 1) {
  //       lastSeekerPosition.current = seekerPosition;
  //     }
  //   }
  // }, [isPlaying, seekerPosition, videoRef]); // Re-run when isPlaying or seekerPosition changes

  useEffect(() => {
    if (videoRef.current) {

      videoRef.current.onloadedmetadata = () => {
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const aspectRatio = videoWidth / videoHeight;

        // Fit video into the container while maintaining aspect ratio
        let newWidth = 300; // Set an initial width (adjust as needed)
        let newHeight = newWidth / aspectRatio;

        setSize({ width: newWidth, height: newHeight });
      };

      const startTime = Math.max(
        Math.floor(seekerPosition * 0.1 - newStart) + startsFrom,
        0
      );
      videoRef.current.playbackRate = speed;

      // Always set currentTime when seekerPosition changes significantly
      if (Math.abs(seekerPosition - lastSeekerPosition.current) >= 1) {
        console.log("Seeking to:", startTime);
        videoRef.current.currentTime = startTime;
        hasSetStartTime.current = true; // Allow updates on seek
      }

      // Play video if necessary
      if (isPlaying) {
        videoRef.current
          .play()
          .catch((error) => console.warn("Playback error:", error));
      } else {
        videoRef.current.pause();
      }

      lastSeekerPosition.current = seekerPosition; // Track last position
      lastIsPlaying.current = isPlaying;
    }
  }, [seekerPosition, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(seekerPosition * 0.1);
      console.log(currentSourceAndTiming);
      
      // console.log(
      //   "currenttime",
      //   currentTime,
      //   newStart + zoomStart,
      //   newStart + zoomStart + zoomDuration,
      // );

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

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds=".video-player"
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
        backgroundColor: "black",
      }}
      className={`${selectedElement}-preview`}
    >
      <video
        ref={videoRef}
        src={source}
        autoPlay={false}
        muted={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transition: `transform 0.3s ease-in-out, border-radius 0.3s ease-in-out`, // Apply transition to both transform and border-radius
          transform: isPlaying
            ? `scale(${currentZoomLevel}, ${currentZoomLevel})`
            : "",
          transformOrigin: isPlaying
            ? `${zoomCenter.x * 100}% ${zoomCenter.y * 100}%`
            : "", // Set origin
          borderRadius: `${(borderRadius / 100) * size.height}px / ${
            (borderRadius / 100) * size.width
          }px`, // Ensures proper rounding
        }}
      />
    </Rnd>
  );
};

export default VideoPlayer;
