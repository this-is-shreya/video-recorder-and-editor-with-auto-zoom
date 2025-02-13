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
    zoomEnd,
    zoomLevel,
  } = currentSourceAndTiming[0];
  // console.log("currentsandt", currentSourceAndTiming);
  const zoomDuration = zoomStart === null ? 0 : zoomEnd - zoomStart;
  // Initialize state for position and size from currentSourceAndTiming
  const [position, setPosition] = useState(
    currentSourceAndTiming[0].position || { x: 0, y: 0 }
  );
  const [size, setSize] = useState(
    currentSourceAndTiming[0].size || { width: 400, height: 225 } // Default to 16:9
  );

  const videoRef = useRef(null); // Reference to the video element
  const lastSeekerPosition = useRef(seekerPosition); // To track the last seeker position
  const lastIsPlaying = useRef(isPlaying); // To track the last isPlaying state
  const hasSetStartTime = useRef(false); // Flag to track if startTime has been set
  const [videoSource, setVideoSource] = useState(null); // To track video source changes
  // Calculate video start time based on seeker's position
  const calculateStartTime = () => {
    const startTime = Math.max(seekerPosition * 0.1 - newStart, 0); // Ensure it's positive
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
  useEffect(() => {
    console.log("video players: ", currentSourceAndTiming);
    
    if (videoRef.current) {
      const startTime = calculateStartTime();
      videoRef.current.playbackRate = speed;
      // Set startTime only once when not playing
      if (!hasSetStartTime.current) {
        // console.log("Setting startTime:", Math.floor(startTime));
        videoRef.current.currentTime = Math.max(startTime, 0);
        hasSetStartTime.current = true; // Mark start time as set
        if (isPlaying) videoRef.current.play();
      }
      // if(isPlaying && lastIsPlaying.current && seekerPosition !== lastSeekerPosition.current){
      //   videoRef.current.currentTime = Math.floor(startTime - newStart);
      //   // videoRef.current.play();
      // }
      // Control video playback state based on `isPlaying`
      if (isPlaying && !lastIsPlaying.current) {
        // console.log("Starting video playback");
        // videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);

        videoRef.current.play().catch((error) => {
          console.warn("Playback error:", error);
        });
      } else if (!isPlaying && lastIsPlaying.current) {
        // console.log("Pausing video playback");
        videoRef.current.pause();
        // hasSetStartTime.current = false; // Reset the start time
      }
      if (!videoSource || videoSource !== source) {
        console.log("New video loaded, updating start time");
        videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);
        if (isPlaying) videoRef.current.play();
        setVideoSource(source);
      }
      if (!isPlaying) {
        hasSetStartTime.current = false; // Reset the start time
      }
      // Update the last known state of isPlaying
      lastIsPlaying.current = isPlaying;

      // Update last known seeker position only if it's changed significantly
      if (Math.abs(seekerPosition - lastSeekerPosition.current) > 1) {
        lastSeekerPosition.current = seekerPosition;
      }
    }
  }, [isPlaying, seekerPosition, videoRef]); // Re-run when isPlaying or seekerPosition changes

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.ceil(seekerPosition * 0.1);
      // console.log("currenttime", currentTime, zoomStart, zoomEnd);

      if (zoomStart !== null && zoomEnd !== null) {
        if (currentTime >= zoomStart && currentTime <= zoomEnd) {
          // Zoom in
          setCurrentZoomLevel(zoomLevel);
        } else {
          // Zoom out smoothly after zoomEnd
          setCurrentZoomLevel(1);
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [zoomStart, zoomEnd, zoomLevel, seekerPosition]);

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
          transition: "border-radius 0.3s ease-in-out",
          borderRadius: `${(borderRadius / 100) * size.height}px / ${
            (borderRadius / 100) * size.width
          }px`, // Ensures proper rounding
        }}
      />
    </Rnd>
  );
};

export default VideoPlayer;
