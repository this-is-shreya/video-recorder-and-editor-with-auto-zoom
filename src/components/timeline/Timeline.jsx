import React, { useContext, useEffect, useRef, useState } from "react";
import Track from "./Track";
import Seeker from "./Seeker";
import Controls from "./Controls";
import { getCurrentSources } from "../../utils/getCurrentSources";
import AppContext from "../../AppContext";

const Timeline = () => {
  const intervalRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSplit, setIsSplit] = useState(false);

  const {
    seekerPosition,
    setSeekerPosition,
    sourceAndTiming,
    setSourceAndTiming,
    currentSourceAndTiming,
    setCurrentSourceAndTiming,
    isPlaying,
    setIsPlaying,
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
      </div>

      <Controls
        seekerPosition={seekerPosition}
        setSeekerPosition={setSeekerPosition}
        selectedElement={selectedElement}
        sourceAndTiming={sourceAndTiming}
        setSourceAndTiming={setSourceAndTiming}
      />
      <Seeker seekerPosition={seekerPosition} />
      <Track
        sourceAndTiming={sourceAndTiming}
        setSourceAndTiming={setSourceAndTiming}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        isSplit={isSplit}
        setIsSplit={setIsSplit}
         />
    </div>
  );
};

export default Timeline;
