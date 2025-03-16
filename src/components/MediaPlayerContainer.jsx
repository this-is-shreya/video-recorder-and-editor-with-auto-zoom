import React, { useContext, useEffect, useRef, useState } from "react";
import MediaPlayer from "./MediaPlayer";
import Transition1 from "./transitions/Transition1";
import Transition2 from "./transitions/Transition2";
import Transition3 from "./transitions/Transition3";
import Transition4 from "./transitions/Transition4";
import { mediaType, transitionType } from "../utils/MediaEnum";
import Transition5 from "./transitions/Transition5";
import AppContext from "../AppContext";
import Background1 from "./background/Background1";
import Background2 from "./background/Background2";

const MediaPlayerContainer = ({ trackNum }) => {
  const { currentSourceAndTiming } = useContext(AppContext);
  const currentSourceAndTimingFiltered = 
      currentSourceAndTiming.filter((item) => item.trackNum === trackNum)
  
  console.log(">> ", currentSourceAndTimingFiltered);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [_transitionType, setTransitionType] = useState(null);

  useEffect(() => {
    if (isTransitioning) {
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionType(null);
      }, 3000);
    }
  }, [isTransitioning, _transitionType]);

  return (
    <>
      {currentSourceAndTimingFiltered.length > 0 && (
        <div
          style={{
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: trackNum,
            position: "absolute",
          }}
        >
          {/* set background */}
          {currentSourceAndTimingFiltered[0]?.source === "background-1" && (
            <Background1 />
          )}
          {currentSourceAndTimingFiltered[0]?.source === "background-2" && (
            <Background2 />
          )}

          {isTransitioning &&
            _transitionType === transitionType.colouredWaves && <Transition1 />}
          {isTransitioning &&
            _transitionType === transitionType.blurredZoom && <Transition2 />}
          {isTransitioning && _transitionType === transitionType.lineWipe && (
            <Transition3 />
          )}
          {isTransitioning && _transitionType === transitionType.circleWipe && (
            <Transition4 />
          )}
          {isTransitioning &&
            _transitionType === transitionType.blurredFadeIn && <Transition5 />}
          {!currentSourceAndTimingFiltered[0]?.source?.includes(
            mediaType.background
          ) && (
            <MediaPlayer
              trackNum={trackNum}
              setIsTransitioning={setIsTransitioning}
              setTransitionType={setTransitionType}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MediaPlayerContainer;
