import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import Navbar from "./components/Navbar";
import Timeline from "./components/timeline/Timeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { pixels } from "./utils/PixelsPerSecondEnum";
import TextEffect from "./components/TextEffect";
import MediaPlayerContainer from "./components/MediaPlayerContainer";
import { useParams } from "react-router-dom";

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

function App() {
  let { id } = useParams();
  id = id ? id : Date.now();
  const obj = JSON.parse(localStorage.getItem(id));
  const [seekerPosition, setSeekerPosition] = useState(0);
  const [sourceAndTiming, setSourceAndTiming] = useState(
    obj ? obj.sourceAndTiming : []
  );
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState([]);
  const [effectsAndTiming, setEffectsAndTiming] = useState(
    obj ? obj.effectsAndTiming : []
  );
  const [currentEffectsAndTiming, setCurrentEffectsAndTiming] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState({});
  const [isSpeedChange, setIsSpeedChange] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [maxTime, setMaxTime] = useState("00:00:00");
  const videoPlayerRef = useRef(null);
  const [seekerPositionManuallyChanged, setSeekerPositionManuallyChanged] =
    useState(false);
  const [zoomTimeline, setZoomTimeline] = useState(1); //to be worked on
  const [isSplit, setIsSplit] = useState(false);
  const [isTrim, setIsTrim] = useState(false);
  const [isTimerChanged, setIsTimerChanged] = useState(false);
  const [dataArray, setDataArray] = useState([]);
  const [index, setIndex] = useState(0);
  const [undo, setUndo] = useState(false);
  const [redo, setRedo] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16/9");

  const convertToFormattedTime = (position) => {
    const time = Math.floor(position);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };
  const getWidthByAspectRatio = (aspectRatio) => {
    switch (aspectRatio) {
      case "9/16":
      case "3/4":
        return "20vw"; // Reduce width for taller aspect ratios
      case "4/3":
        return "35vw"; // Slightly reduce width for 4:3
      case "16/9":
        return "40vw";
      default:
        return "40vw"; // Default for 16:9 or unknown ratios
    }
  };
  const handleSave = (sources, effects, elements, positions) => {
    localStorage.setItem(
      id,
      JSON.stringify({
        sourceAndTiming: sources,
        effectsAndTiming: effects,
        elements: elements,
        positions: { ...positions },
      })
    );
    let allIds = localStorage.getItem("video-project-id");

    // Parse the stored value or initialize an empty array
    allIds = allIds ? JSON.parse(allIds) : [];

    if (!allIds.includes(id)) {
      allIds.push(id);
      localStorage.setItem("video-project-id", JSON.stringify(allIds));
    }

  };
  useEffect(() => {
    setCurrentTime(
      convertToFormattedTime(seekerPosition / pixels[zoomTimeline])
    );
  }, [seekerPosition]);

  //undo-redo
  // useEffect(() => {
  //   setDataArray((prevDataArray) => {
  //     if (
  //       (sourceAndTiming.length === 0 && effectsAndTiming.length === 0) ||
  //       undo ||
  //       redo
  //     ) {
  //       return prevDataArray;
  //     }
  //     const newDataArray = [...prevDataArray]; // Create a new array (avoid mutation)
  //     const newEntry = JSON.stringify({ sourceAndTiming, effectsAndTiming });
  //     const lastEntry =
  //       newDataArray.length > 0
  //         ? JSON.stringify(newDataArray[newDataArray.length - 1])
  //         : null;

  //     // If the new entry is the same as the last one, don't add it
  //     if (newEntry === lastEntry) {
  //       return prevDataArray;
  //     }

  //     if (newDataArray.length >= 10) {
  //       newDataArray.shift(); // Remove the first element
  //     }

  //     newDataArray.push({ sourceAndTiming, effectsAndTiming }); // Add new element
  //     return newDataArray;
  //   });
  // }, [sourceAndTiming, effectsAndTiming]);

  // useEffect(() => {
  //   setIndex(dataArray.length - 1);
  //   console.log("data array", dataArray);
  // }, [dataArray]);

  // useEffect(() => {
  //   if (dataArray[index] && undo) {
  //     // Ensure valid index
  //     setSourceAndTiming(dataArray[index].sourceAndTiming);
  //     setEffectsAndTiming(dataArray[index].effectsAndTiming);
  //     console.log(">>ent here for index", index);
  //   }
  // }, [index]);

  // const handleUndo = () => {
  //   console.log("Ctrl + Z Pressed! Undo action triggered.");
  //   if (index === 0) {
  //     return;
  //   }
  //   setUndo(true);
  //   setIndex((prevIndex) => prevIndex - 1);
  // };
  // const handleRedo = () => {
  //   console.log("Ctrl + Y Pressed! Redo action triggered.", dataArray, index);
  //   if (index < dataArray.length - 1) {
  //     setRedo(true);
  //     setIndex((prevIndex) => prevIndex + 1);
  //   }
  // };
  // useKeyPress("z",handleUndo, true);
  // useKeyPress("y",handleRedo, true);

  return (
    <>
      <AppContext.Provider
        value={{
          seekerPosition: seekerPosition,
          setSeekerPosition: setSeekerPosition,
          sourceAndTiming: sourceAndTiming,
          setSourceAndTiming: setSourceAndTiming,
          currentSourceAndTiming: currentSourceAndTiming,
          setCurrentSourceAndTiming: setCurrentSourceAndTiming,
          effectsAndTiming: effectsAndTiming,
          setEffectsAndTiming: setEffectsAndTiming,
          currentEffectsAndTiming: currentEffectsAndTiming,
          setCurrentEffectsAndTiming: setCurrentEffectsAndTiming,
          isPlaying: isPlaying,
          setIsPlaying: setIsPlaying,
          selectedElement: selectedElement,
          setSelectedElement: setSelectedElement,
          isSpeedChange: isSpeedChange,
          setIsSpeedChange: setIsSpeedChange,
          maxTime: maxTime,
          setMaxTime: setMaxTime,
          convertToFormattedTime: convertToFormattedTime,
          videoPlayerRef: videoPlayerRef,
          seekerPositionManuallyChanged: seekerPositionManuallyChanged,
          setSeekerPositionManuallyChanged: setSeekerPositionManuallyChanged,
          zoomTimeline: zoomTimeline,
          setZoomTimeline: setZoomTimeline,
          isSplit: isSplit,
          setIsSplit: setIsSplit,
          isTrim: isTrim,
          setIsTrim: setIsTrim,
          isTimerChanged: isTimerChanged,
          setIsTimerChanged: setIsTimerChanged,
          dataArray: dataArray,
          setDataArray: setDataArray,
          aspectRatio: aspectRatio,
          setAspectRatio: setAspectRatio,
          projectId: id,
        }}
      >
        <Navbar />
        <div className="video-preview">
          <div
            className="video-player"
            ref={videoPlayerRef}
            style={{
              aspectRatio: aspectRatio,
              width: getWidthByAspectRatio(aspectRatio),
            }}
          >
            <TextEffect />
            <MediaPlayerContainer trackNum={2} />
            <MediaPlayerContainer trackNum={1} />
          </div>
          <div className="video-player-controls">
            <span>{currentTime}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              {isPlaying ? (
                <FontAwesomeIcon icon={faPause} size="lg" />
              ) : (
                <FontAwesomeIcon icon={faPlay} size="lg" />
              )}
            </button>
            <span>{maxTime}</span>
          </div>
          {/* <VE /> */}
        </div>

        <Timeline
          undo={undo}
          redo={redo}
          setUndo={setUndo}
          setRedo={setRedo}
          getWidthByAspectRatio={getWidthByAspectRatio}
          handleSave={handleSave}
        />
      </AppContext.Provider>
    </>
  );
}

export default App;
