import React, { useContext, useEffect, useState } from "react";
import TextEffect from "./components/text/TextEffect";
import MediaPlayerContainer from "./components/mediaPlayer/MediaPlayerContainer";
import AppContext from "./AppContext";
import SubtitlesPreview from "./components/subtitles/SubtitlesPreview";

const VideoPlayer = ({ _aspectRatio, isExportRecording }) => {
  const {
    videoPlayerRef,
    aspectRatio,
    seekerPosition,
    setSeekerPosition,
    maxTime,
    convertToPixels,
    isPlaying,
  } = useContext(AppContext);
  const [hasExportStarted, setHasExportStarted] = useState(false);

  const getWidthByAspectRatio = (aspectRatio = "16/9") => {
    const [w, h] = aspectRatio.split("/").map(Number);
    const VIDEO_HEIGHT = aspectRatio === "9/16" ? 360 : 300;
    const VIDEO_WIDTH = Math.round((VIDEO_HEIGHT * w) / h);
    const vw = (VIDEO_WIDTH / window.innerWidth) * 100;

    const clampedVw = Math.min(Math.max(vw, 40), 50); // Clamp between 40vw and 50vw
    return `${clampedVw}vw`;
  };
  const width = getWidthByAspectRatio(_aspectRatio);
  const updateSeekerPositionDuringExport = () => {
    const maxPositionInPixels = convertToPixels(maxTime);
    setInterval(() => {
      setSeekerPosition((prevSeekerPosition) => {
        return prevSeekerPosition + 10; //10 pixels per second
      });
      if (seekerPosition >= maxPositionInPixels) {
        clearInterval(this);
      }
    }, 1000);
  };
  useEffect(() => {
    if (isExportRecording && !hasExportStarted) {
      setHasExportStarted(true);
      updateSeekerPositionDuringExport();
    }
  }, [isPlaying]);

  return (
    <div
      className="video-player"
      ref={videoPlayerRef}
      style={{
        aspectRatio: _aspectRatio ? _aspectRatio : aspectRatio,
        width: getWidthByAspectRatio(aspectRatio),
      }}
    >
      <SubtitlesPreview />
      <TextEffect />
      <MediaPlayerContainer trackNum={5} />
      <MediaPlayerContainer trackNum={4} />
      <MediaPlayerContainer trackNum={3} />
      <MediaPlayerContainer trackNum={2} />
      <MediaPlayerContainer trackNum={1} />
    </div>
  );
};

export default VideoPlayer;
