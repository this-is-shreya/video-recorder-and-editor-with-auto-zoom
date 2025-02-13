import {  useEffect, useRef, useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import Navbar from "./components/Navbar";
import Timeline from "./components/timeline/Timeline";
import VideoPlayer from "./components/VideoPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import VideoExporter from "./components/VideoExporter";
import VE from "./components/VE";

function App() {
  const [seekerPosition, setSeekerPosition] = useState(0);
  const [sourceAndTiming, setSourceAndTiming] = useState([]);
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSpeedChange, setIsSpeedChange] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [maxTime, setMaxTime] = useState("00:00:00");
  const videoPlayerRef = useRef(null);

  const convertToFormattedTime = (position) => {
    const time = Math.ceil(position);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  useEffect(()=>{
    setCurrentTime(convertToFormattedTime(seekerPosition * 0.1));
  },[seekerPosition])

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
        }}
      >
        <Navbar />
        <div className="video-preview">
          <div className="video-player">
            <VideoPlayer/>
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
          <VE />
        </div>
        <Timeline />
      </AppContext.Provider>
    </>
  );
}

export default App;
