import { useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import Navbar from "./components/Navbar";
import Timeline from "./components/timeline/Timeline";
import VideoPlayer from "./components/VideoPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [seekerPosition, setSeekerPosition] = useState(0);
  const [sourceAndTiming, setSourceAndTiming] = useState([]);
  const [currentSourceAndTiming, setCurrentSourceAndTiming] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") {
      if (seekerPosition - 50 <= 0) {
        setSeekerPosition(0);
      } else {
        setSeekerPosition(seekerPosition - 50);
      }
    } else if (e.code === "ArrowRight") {
      setSeekerPosition(seekerPosition + 50);
    }
  });
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
        }}
      >
        <Navbar />
        <div className="video-preview">
          <div className="video-player">
            <VideoPlayer />
          </div>
          <div className="video-player-controls">
            <span>time</span>

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
            <span>time</span>
          </div>
        </div>

        <Timeline />
      </AppContext.Provider>
    </>
  );
}

export default App;
