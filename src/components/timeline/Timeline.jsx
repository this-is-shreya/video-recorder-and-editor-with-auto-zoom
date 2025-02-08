import React, { useContext, useEffect, useRef, useState } from "react";
import Track from "./Track";
import Seeker from "./Seeker";
import Controls from "./Controls";
import { getCurrentSources } from "../../utils/getCurrentSources";
import AppContext from "../../AppContext";

const Timeline = () => {
  const intervalRef = useRef(null);
  const [isSplit, setIsSplit] = useState(false);
  const [isDeleteMedia, setIsDeleteMedia] = useState(false);

  const {
    seekerPosition,
    setSeekerPosition,
    sourceAndTiming,
    setSourceAndTiming,
    currentSourceAndTiming,
    setCurrentSourceAndTiming,
    isPlaying,
    selectedElement,
    setSelectedElement
  } = useContext(AppContext);

  // const handleButtonClick = () => {
  //   setIsPlaying((prevIsPlaying) => {
  if (!isPlaying) {
    // Pause the playback
    clearInterval(intervalRef.current); // Stop interval
    intervalRef.current = null;
    // console.log("stopped", intervalRef.current)
  } else {
    if (intervalRef.current !== null) {
      // Clear any existing interval to avoid duplication
      clearInterval(intervalRef.current);
    }
    // Play the playback
    intervalRef.current = setInterval(() => {
      setSeekerPosition((prevPosition) => {
        const newPosition = prevPosition + 10;
        // console.log("New seeker position:", newPosition);
        return newPosition;
      });
      // console.log("sk is ", seekerPosition);
    }, 1000);
  }
  // return !prevIsPlaying; // Toggle isPlaying state
  // });
  // };
const handleSplit = () => {
  if (selectedElement === null) return;

  let newSources = [];

  sourceAndTiming.forEach((source) => {
    if (
      source.id === selectedElement &&
      seekerPosition * 0.1 >= source.newStart &&
      seekerPosition * 0.1 <= source.newEnd
    ) {
      // First half (new split segment)
      const newSource = {
        id: Date.now(),
        source: source.source,
        start: source.newStart,
        newStart: source.newStart,
        end: seekerPosition * 0.1,
        newEnd: seekerPosition * 0.1,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 225 },
        mediaType: source.mediaType,
        trackX: source.trackX, // Keep same position
        
      };

      // Second half (remaining part)
      const updatedSource = {
        ...source,
        newStart: seekerPosition * 0.1,
        start: seekerPosition * 0.1,
        trackX: seekerPosition, // Move right on the track
      };

      newSources.push(newSource, updatedSource);
    } else {
      newSources.push(source);
    }
  });

  setSourceAndTiming(newSources);

  setIsSplit(true);
};
const handleDeleteTrackMedia = () => {
  if(!selectedElement) return;

  const updatedSourceAndTiming = sourceAndTiming.filter(
    (item) => {
      console.log("item", item, selectedElement);
      
      return item.id !== selectedElement}
  );
  setSourceAndTiming(updatedSourceAndTiming);
  setIsDeleteMedia(true)
  console.log("sourceandtiming", sourceAndTiming);
  
}
  useEffect(() => {
    setCurrentSourceAndTiming(
      getCurrentSources(sourceAndTiming, seekerPosition)
    );
    console.log("from timeline: currentsandt", currentSourceAndTiming);
  }, [seekerPosition, sourceAndTiming]);
  return (
    <div className="timeline">
      <div>
        <button onClick={handleSplit}>Split</button>
        <button onClick={handleDeleteTrackMedia}>Delete</button>
      </div>

      <Controls
        setSeekerPosition={setSeekerPosition}
      />
      <Seeker seekerPosition={seekerPosition} />
      <Track
        isSplit={isSplit}
        setIsSplit={setIsSplit}
        isDeleteMedia={isDeleteMedia}
        setIsDeleteMedia={setIsDeleteMedia}
      />
    </div>
  );
};

export default Timeline;
