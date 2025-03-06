import { useEffect, useRef, useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import Navbar from "./components/Navbar";
import Timeline from "./components/timeline/Timeline";
import MediaPlayer from "./components/MediaPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { pixels } from "./utils/PixelsPerSecondEnum";
import TextEffect from "./components/TextEffect";

function App() {
  const [seekerPosition, setSeekerPosition] = useState(0);
  const [sourceAndTiming, setSourceAndTiming] = useState([]);
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState([]);
  const [effectsAndTiming, setEffectsAndTiming] = useState([]);
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
  useEffect(() => {
    setCurrentTime(
      convertToFormattedTime(seekerPosition / pixels[zoomTimeline])
    );
  }, [seekerPosition]);

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
        }}
      >
        <Navbar />

        <div className="video-preview">
          <div className="video-player" ref={videoPlayerRef}>
            <TextEffect />
            <MediaPlayer trackNum={2} />
            <MediaPlayer trackNum={1} />
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
        <Timeline />
      </AppContext.Provider>
    </>
  );
}

export default App;
