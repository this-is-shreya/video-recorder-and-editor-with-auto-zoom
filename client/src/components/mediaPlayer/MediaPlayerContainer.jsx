import React, { useContext, useEffect, useRef, useState } from "react";
import MediaPlayer from "./MediaPlayer";
import Transition1 from "../transitions/Transition1";
import Transition2 from "../transitions/Transition2";
import Transition3 from "../transitions/Transition3";
import Transition4 from "../transitions/Transition4";
import {
  backgroundType,
  mediaType,
  transitionType,
} from "../../utils/MediaEnum";
import Transition5 from "../transitions/Transition5";
import AppContext from "../../AppContext";
import Background from "../background/Background";
import Transition6 from "../transitions/Transition6";

const MediaPlayerContainer = ({ trackNum }) => {
  const {
    currentSourceAndTiming,
    setIsPlaying,
    isExportPreview,
    sourceAndTiming,
  } = useContext(AppContext);
  
  const currentSourceAndTimingFiltered = currentSourceAndTiming.filter(
    (item) => item.trackNum === trackNum
  );

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
          className="media-player-container"
          style={{
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            position: "absolute",
            cursor: isExportPreview ? "none" : "",
          }}
        >
          {/* set background */}
          {currentSourceAndTimingFiltered[0]?.source.includes("background") && (
            <Background
              trackNum={trackNum}
              variant={currentSourceAndTimingFiltered[0]?.source}
            />
          )}
          {isTransitioning && _transitionType === transitionType.waves && (
            <Transition1 />
          )}
          {isTransitioning && _transitionType === transitionType.reveal && (
            <Transition2 />
          )}
          {isTransitioning && _transitionType === transitionType.lineWipe && (
            <Transition3 />
          )}
          {isTransitioning && _transitionType === transitionType.electronic && (
            <Transition4 />
          )}
          {isTransitioning &&
            _transitionType === transitionType.blurredFadeIn && <Transition5 />}
          {isTransitioning && _transitionType === transitionType.mask1 && (
            <Transition6 svgFile={"liquidMask1.svg"} />
          )}
          {isTransitioning && _transitionType === transitionType.mask2 && (
            <Transition6 svgFile={"liquidMask2.svg"} />
          )}
          {isTransitioning && _transitionType === transitionType.mask3 && (
            <Transition6 svgFile={"liquidMask3.svg"} />
          )}

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
