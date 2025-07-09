import React, { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../AppContext";
import { extractAudioFromBlobURL } from "../utils/extractAndDownloadAudio";
import { mediaType } from "../utils/MediaEnum";
import { FaStar } from "react-icons/fa6";
import { RxValueNone } from "react-icons/rx";
import { pixels } from "../utils/PixelsPerSecondEnum";
import { notify } from "../utils/toast";

const Video = () => {
  const {
    selectedElement,
    sourceAndTiming,
    setSourceAndTiming,
    setIsSpeedChange,
    seekerPosition,
    seekerPositionManuallyChanged,
    isSplit,
    isPlaying,
    zoomTimeline,
  } = useContext(AppContext);
  const [currentElement, setCurrentElement] = useState(
    sourceAndTiming.find((item) => item.id === selectedElement.id)
  );
  const [borderRadius, setBorderRadius] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [clickPosition, setClickPosition] = useState(null); // Stores red dot position
  const [isEffectsOpen, setIsEffectsOpen] = useState(false);
  const videoRef = useRef(null);

  const changeRoundness = (e) => {
    if (!selectedElement) return;

    const newBorderRadius = e.target.value;

    // Update the state immutably
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        return { ...item, borderRadius: newBorderRadius };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };
  // const changeSpeed = (e) => {
  //   if (!selectedElement) return;

  //   setIsSpeedChange(true);
  //   const newSpeed = Number(e.target.value);

  //   // Update the state immutably
  //   const updatedSourceAndTiming = sourceAndTiming.map((item) => {
  //     if (item.id === selectedElement.id) {
  //       return { ...item, speed: newSpeed };
  //     }
  //     return item;
  //   });

  //   setSourceAndTiming(updatedSourceAndTiming);
  // };
  const changeVolume = (e) => {
    if (!selectedElement) return;
    // Update the state immutably
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        return { ...item, volume: Number(e.target.value) / 100 };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };

  const handleVideoEffect = (e) => {
    const effect = e.target.getAttribute("data-alt");
    if (!selectedElement) return;
    // Update the state immutably
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        return { ...item, effectType: effect };
      }
      return item;
    });

    setSourceAndTiming(updatedSourceAndTiming);
  };

  useEffect(() => {
    if (selectedElement) {
      const selectedItem = sourceAndTiming.find(
        (item) => item.id === selectedElement.id
      );
      if (selectedItem) {
        setBorderRadius(selectedItem.borderRadius || 0);
      }
    }
  }, [selectedElement, sourceAndTiming]);

  useEffect(() => {
    const selectedItem = sourceAndTiming.find(
      (item) => item.id === selectedElement.id
    );
    setCurrentElement(selectedItem);
  }, [selectedElement, sourceAndTiming]);

  useEffect(() => {
    if (!videoRef || !videoRef.current) {
      return;
    }
    if (
      Math.floor(seekerPosition / pixels[zoomTimeline]) <
        currentElement.newStart ||
      Math.floor(seekerPosition / pixels[zoomTimeline]) > currentElement.newEnd
    ) {
      return;
    }
    videoRef.current.currentTime =
      Math.floor(seekerPosition / pixels[zoomTimeline]) -
      currentElement.newStart +
      currentElement.startsFrom;

    setZoomStartValue(Math.floor(seekerPosition / pixels[zoomTimeline]));
  }, [seekerPositionManuallyChanged, isSplit, isPlaying, seekerPosition]);

  return (
    <div className="slidecontainer">
      {selectedElement && currentElement?.mediaType === mediaType.video ? (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Roundness */}
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}
            >
              <label style={{ width: "80px" }}>Roundness</label>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={borderRadius}
                  onChange={(e) => {
                    setBorderRadius(e.target.value);
                    changeRoundness(e);
                  }}
                />
                <label style={{ marginLeft: "5px" }}>{borderRadius}px</label>
              </div>
            </div>

            {/* Speed */}
            {/* <div
              style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}
            >
              <label style={{ width: "80px" }}>Speed</label>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  defaultValue={speed}
                  onChange={(e) => {
                    setSpeed(e.target.value);
                    changeSpeed(e);
                  }}
                />
                <label style={{ marginLeft: "5px" }}>{speed}x</label>
              </div>
            </div> */}
          </div>

          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}
          >
            <label style={{ width: "80px" }}>Volume</label>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                defaultValue={volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  changeVolume(e);
                }}
              />
              <label style={{ marginLeft: "5px" }}>{volume}</label>
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}
          >
            <label style={{ width: "80px" }}>Split audio</label>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <button
                onClick={() => {
                  extractAudioFromBlobURL(
                    sourceAndTiming.find(
                      (item) => item.id === selectedElement.id
                    ).source
                  );
                }}
                style={{
                  width: "80px",
                  cursor: "pointer",
                  height: "30px",
                  borderColor: "transparent",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer",
                  backgroundColor: "#892fff",
                }}
              >
                Extract
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsEffectsOpen(!isEffectsOpen)}
            style={{
              backgroundColor: "#EB1AB4",
              height: "30px",
              borderColor: "transparent",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Effects
          </button>

          {isEffectsOpen && (
            <div className="media-container">
              <div
                className="media-item"
                data-alt="none"
                onClick={(e) => handleVideoEffect(e)}
                style={{
                  border:
                    currentElement?.effectType === "none"
                      ? "2px solid blue"
                      : "",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <RxValueNone size={50} />
                <span data-alt="none">None</span>
              </div>
              <div
                className="media-item"
                data-alt="cartoon"
                onClick={(e) => handleVideoEffect(e)}
                style={{
                  border:
                    currentElement?.effectType === "cartoon"
                      ? "2px solid blue"
                      : "",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <FaStar size={50} />
                <span data-alt="cartoon">Cartoon</span>
              </div>
              <div
                className="media-item"
                data-alt="glitch"
                onClick={(e) => handleVideoEffect(e)}
                style={{
                  border:
                    currentElement?.effectType === "glitch"
                      ? "2px solid blue"
                      : "",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <FaStar size={50} />
                <span data-alt="glitch">Glitch</span>
              </div>
              <div
                className="media-item"
                data-alt="vhs"
                onClick={(e) => handleVideoEffect(e)}
                style={{
                  border:
                    currentElement?.effectType === "vhs"
                      ? "2px solid blue"
                      : "",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <FaStar size={50} />
                <span data-alt="vhs">VHS</span>
              </div>
              <div
                className="media-item"
                data-alt="blur"
                onClick={(e) => handleVideoEffect(e)}
                style={{
                  border:
                    currentElement?.effectType === "blur"
                      ? "2px solid blue"
                      : "",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <FaStar size={50} />
                <span data-alt="blur">Blur</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <label>No video element selected</label>
        </>
      )}
    </div>
  );
};

export default Video;
