import React, { useContext, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import AppContext from "../AppContext";

const VideoPlayer = () => {
  const {
    currentSourceAndTiming,
    isPlaying,
    seekerPosition,
    setCurrentSourceAndTiming,
  } = useContext(AppContext);

  // Ensure there is valid video data
  if (!currentSourceAndTiming || !currentSourceAndTiming[0]) {
    return null;
  }

  // const key = Object.keys(currentSourceAndTiming[0])[0];
  const { source, start, end, newStart, newEnd } = currentSourceAndTiming[0];
  console.log("currentsandt", currentSourceAndTiming);
  
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
    const startTime = Math.max(seekerPosition * 0.1 - start, 0); // Ensure it's positive
    console.log(
      "starttimefromvideoplayer",
      startTime, seekerPosition, newStart, start
    );
    
    return startTime;
  };

  // Control video playback based on `isPlaying` and seeker position
  useEffect(() => {
    if (videoRef.current) {
      const startTime = calculateStartTime();

      // Set startTime only once when not playing
      if (!hasSetStartTime.current) {
        console.log("Setting startTime:", Math.floor(startTime));//probably .tofixed would be much better
        videoRef.current.currentTime = Math.floor(startTime - newStart*0.1);
        hasSetStartTime.current = true; // Mark start time as set
        if (isPlaying) videoRef.current.play();
      }

      // Control video playback state based on `isPlaying`
      if (isPlaying && !lastIsPlaying.current) {
        console.log("Starting video playback");
        // videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);

        videoRef.current.play().catch((error) => {
          console.warn("Playback error:", error);
        });
      } else if (!isPlaying && lastIsPlaying.current) {
        console.log("Pausing video playback");
        videoRef.current.pause();
      } 
      if (!videoSource || videoSource !== source) {
        console.log("New video loaded, updating start time");
        videoRef.current.currentTime = Math.floor(startTime - newStart * 0.1);
        if (isPlaying) videoRef.current.play();
        setVideoSource(source);
      }
      // Update the last known state of isPlaying
      lastIsPlaying.current = isPlaying;

      // Update last known seeker position only if it's changed significantly
      if (Math.abs(seekerPosition - lastSeekerPosition.current) > 1) {
        lastSeekerPosition.current = seekerPosition;
      }
    }
  }, [isPlaying, seekerPosition, videoRef]); // Re-run when isPlaying or seekerPosition changes

  // Update `currentSourceAndTiming` when size or position changes
  const updateContext = (newPosition, newSize) => {
    const updatedData = { ...currentSourceAndTiming };
    updatedData[0].position = newPosition;
    updatedData[0].size = newSize;
    setCurrentSourceAndTiming(updatedData); // Update the context
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds=".video-player" // Constrain within the parent container
      lockAspectRatio // Maintain aspect ratio during resizing
      onDragStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        updateContext(newPosition, size);
      }}
      onResizeStop={(e, direction, ref, delta, _position) => {
        const newSize = {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        };
        const newPosition = {
          x: _position.x,
          y: _position.y,
        };
        setSize(newSize);
        setPosition(newPosition);
        updateContext(newPosition, newSize);
      }}
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "black", // Fallback color
      }}
    >
      <video
        ref={videoRef}
        src={source}
        autoPlay={false} // Control autoplay manually
        muted={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      ></video>
    </Rnd>
  );
};

export default VideoPlayer;
