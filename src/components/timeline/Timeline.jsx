import React, { useContext, useEffect, useRef, useState } from "react";
import Track from "./Track";
import Seeker from "./Seeker";
import Controls from "./Controls";
import { getCurrentSources } from "../../utils/getCurrentSources";
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

const Timeline = ({ undo, redo, setUndo, setRedo, getWidthByAspectRatio }) => {
  const {
    seekerPosition,
    setSeekerPosition,
    sourceAndTiming,
    setSourceAndTiming,
    currentSourceAndTiming,
    setCurrentSourceAndTiming,
    effectsAndTiming,
    setEffectsAndTiming,
    currentEffectsAndTiming,
    setCurrentEffectsAndTiming,
    isPlaying,
    selectedElement,
    setSelectedElement,
    maxTime,
    convertToFormattedTime,
    zoomTimeline,
    setZoomTimeline,
    isSplit,
    setIsSplit,
    aspectRatio,
    setAspectRatio,
  } = useContext(AppContext);

  const intervalRef = useRef(null);
  const [isDeleteMedia, setIsDeleteMedia] = useState(false);
  const [positions, setPositions] = useState({}); // Store positions and sizes
  const [elements, setElements] = useState([]); // Store element IDs
  const [top, setTop] = useState(
    "22.5vh"
  );

  const [timelineWidth, setTimelineWidth] = useState(
    (90 * window.innerWidth) / 100
  );
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
      const time = convertToFormattedTime(
        Math.floor(seekerPosition / pixels[zoomTimeline])
      );

      if (time >= maxTime) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }
      setSeekerPosition((prevPosition) => {
        const newPosition = prevPosition + pixels[zoomTimeline];
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
    if (
      selectedElement.id === null ||
      (selectedElement.mediaType !== mediaType.audio &&
        selectedElement.mediaType !== mediaType.video)
    )
      return;

    let newSources = [];

    sourceAndTiming.forEach((source) => {
      if (
        source.id === selectedElement.id &&
        seekerPosition / pixels[zoomTimeline] >= source.newStart &&
        seekerPosition / pixels[zoomTimeline] <= source.newEnd
      ) {
        const roundedTime = Math.floor(seekerPosition / pixels[zoomTimeline]);
        // Second half (new split segment)
        const newSource = {
          ...source,
          id: Date.now(),
          start: roundedTime,
          newStart: roundedTime,
          speedStart: roundedTime,
          trackX:
            source.trackX +
            Math.floor(roundedTime - source.newStart) * pixels[zoomTimeline] +
            1,
          // zoomCenter: { x: 0, y: 0 },
          // zoomStart: null,
          // zoomDuration: null,
          // zoomLevel: 1,
          startsFrom: roundedTime - source.newStart + source.startsFrom,
          trackNum: source.trackNum,
        };

        // First half
        const updatedSource = {
          ...source,
          speedEnd: roundedTime, //it's a special case, instead of newEnd I'm using seekerPosition
          newEnd: roundedTime,
          end: roundedTime,
          // zoomCenter: { x: 0, y: 0 },
          // zoomStart: null,
          // zoomDuration: null,
          // zoomLevel: 1
        };
        console.log(">>new sources are ", newSource, updatedSource);

        newSources.push(newSource, updatedSource);
      } else {
        newSources.push(source);
      }
    });

    setSourceAndTiming(newSources);

    setIsSplit(true);
  };
  const handleDeleteTrackMedia = () => {
    if (!selectedElement) return;
    const isSource = sourceAndTiming.find(
      (item) => item.id == selectedElement.id
    );
    if (isSource) {
      const updatedSourceAndTiming = sourceAndTiming.filter((item) => {
        console.log("item", item, selectedElement);

        return item.id !== selectedElement.id;
      });
      console.log("updated sandt", updatedSourceAndTiming);
      setSourceAndTiming(() => [...updatedSourceAndTiming]);
    } else {
      const updatedEffectsAndTiming = effectsAndTiming.filter((item) => {
        console.log("item", item, selectedElement);

        return item.id !== selectedElement.id;
      });
      console.log("updated sandt", updatedEffectsAndTiming);
      setEffectsAndTiming(() => [...updatedEffectsAndTiming]);
    }
    setIsDeleteMedia(true);
  };
  const getHeightByAspectRatio = (aspectRatio, width) => {
    switch (aspectRatio) {
      case "9/16":
        return `35.5vh`; // Height = Width * (16 / 9)
      case "3/4":
        return `26.6vh`;
      case "4/3":
        return `46.6vh`;
      case "16/9":
        return `22.5vh`; // Height = Width * (9 / 16)
      default:
        return `22.5vh`; // Default to 16:9
    }
  };

  useEffect(() => {
    setCurrentSourceAndTiming(
      getCurrentSources(sourceAndTiming, seekerPosition, zoomTimeline)
    );
  }, [seekerPosition, sourceAndTiming]);
  useEffect(() => {
    setCurrentEffectsAndTiming(
      getCurrentSources(effectsAndTiming, seekerPosition, zoomTimeline)
    );
  }, [seekerPosition, effectsAndTiming]);

  useEffect(() => {
    setTop(getHeightByAspectRatio(aspectRatio))
    console.log("top is ", top);
    
  }, [aspectRatio]);

  useKeyPress("s", handleSplit);

  return (
    <div
      className="timeline"
      style={{
        minWidth: `${timelineWidth}px`,
        top: `calc(${top} + 50vh)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button onClick={handleSplit}>Split</button>
        <button onClick={handleDeleteTrackMedia}>Delete</button>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.5}
          onChange={(e) => {
            setZoomTimeline(Number(e.target.value));
          }}
        />
        <label>{zoomTimeline}</label>
        <select
          onChange={(e) => {
            setAspectRatio(e.target.value);
          }}
        >
          <option value="16/9">16:9</option>
          <option value="9/16">9:16</option>
          <option value="4/3">4:3</option>
          <option value="3/4">3:4</option>
        </select>
      </div>

      <Controls />
      <Seeker />
      <div className="all-tracks">
        <Track
          isDeleteMedia={isDeleteMedia}
          setIsDeleteMedia={setIsDeleteMedia}
          timelineWidth={timelineWidth}
          setTimelineWidth={setTimelineWidth}
          trackNum={2}
          elements={elements}
          setElements={setElements}
          positions={positions}
          setPositions={setPositions}
          undo={undo}
          redo={redo}
          setUndo={setUndo}
          setRedo={setRedo}
        />
        <Track
          isDeleteMedia={isDeleteMedia}
          setIsDeleteMedia={setIsDeleteMedia}
          timelineWidth={timelineWidth}
          setTimelineWidth={setTimelineWidth}
          trackNum={1}
          elements={elements}
          setElements={setElements}
          positions={positions}
          setPositions={setPositions}
          undo={undo}
          redo={redo}
          setUndo={setUndo}
          setRedo={setRedo}
        />
      </div>
    </div>
  );
};

export default Timeline;
