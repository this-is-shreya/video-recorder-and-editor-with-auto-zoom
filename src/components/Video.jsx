import React, { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";
import { extractAudioFromBlobURL } from "../utils/extractAndDownloadAudio";

const Video = () => {
  const { selectedElement, sourceAndTiming, setSourceAndTiming, setIsSpeedChange } =
    useContext(AppContext);
  const [borderRadius, setBorderRadius] = useState(0);
  const [speed, setSpeed] = useState(1);

  const changeRoundness = (e) => {
    if (!selectedElement) return;

    const newBorderRadius = e.target.value;

    // Update the state immutably
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
        return { ...item, borderRadius: newBorderRadius };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };
  const changeSpeed = (e) => {
    if (!selectedElement) return;

    setIsSpeedChange(true);
    const newSpeed = e.target.value;

    // Update the state immutably
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
        return { ...item, speed: newSpeed };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };
  useEffect(() => {
    if (selectedElement) {
      const selectedItem = sourceAndTiming.find(
        (item) => item.id === selectedElement
      );
      if (selectedItem) {
        setBorderRadius(selectedItem.borderRadius || 0);
      }
    }
  }, [selectedElement, sourceAndTiming]);

  return (
    <div className="panel">
      <div className="slidecontainer">
        <label>Roundness:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={borderRadius}
          onChange={(e) => {
            setBorderRadius(e.target.value);
            changeRoundness(e);
          }}
        />
        <label>{borderRadius}px</label>
        <br />
        <label>Speed:</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => {
            setSpeed(e.target.value);
            changeSpeed(e);
          }}
        />
        <label>{speed}x</label>
        <br />
        <button
          onClick={() => {
            extractAudioFromBlobURL(
              sourceAndTiming.find((item) => item.id === selectedElement).source
            );
          }}
        >
          Extract Audio
        </button>
      </div>
    </div>
  );
};

export default Video;
