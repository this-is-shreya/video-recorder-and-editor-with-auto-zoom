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
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  const [zoomStart, setZoomStart] = useState(
    !currentElement?.zoomStart
      ? currentElement?.newStart
      : currentElement.zoomStart
  );
  const [zoomStartValue, setZoomStartValue] = useState(
    currentElement?.zoomStart
      ? currentElement.zoomStart + currentElement?.newStart
      : currentElement?.newStart
  );
  const [zoomDuration, setzoomDuration] = useState(
    currentElement?.zoomDuration
  );
  const [zoomLevel, setZoomLevel] = useState(
    currentElement ? currentElement?.zoomLevel : 1
  );
  const [volume, setVolume] = useState(100);
  const [clickPosition, setClickPosition] = useState(null); // Stores red dot position
  const [isOpen, setIsOpen] = useState(false);
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
  const handlePreviewClick = (e) => {
    const previewRect = e.target.getBoundingClientRect();
    const clickX = e.clientX - previewRect.left; // X coordinate of the click
    const clickY = e.clientY - previewRect.top; // Y coordinate of the click

    // Calculate zoom center as a percentage of the preview size
    const centerX = clickX / previewRect.width;
    const centerY = clickY / previewRect.height;

    setZoomCenter({ x: centerX, y: centerY });
    setClickPosition({ x: clickX, y: clickY }); // Store position for red dot
  };
  const addZoom = () => {
    if (zoomDuration == null) {
      return;
    }

    if (
      zoomStartValue < currentElement.newStart ||
      zoomDuration + zoomStartValue > currentElement.newEnd
    ) {
      return;
    }
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        return {
          ...item,
          zoomCenter: zoomCenter,
          zoomStart: Math.floor(Number(zoomStartValue - item.newStart)),
          zoomDuration:
            Number(zoomDuration) > item.newEnd
              ? item.newEnd
              : Number(zoomDuration),
          zoomLevel: zoomLevel,
        };
      }
      return item;
    });

    setSourceAndTiming([...updatedSourceAndTiming]);
    setCurrentElement({
      ...currentElement,
      zoomStart: Number(zoomStartValue),
      zoomDuration: Number(zoomDuration),
      zoomLevel: zoomLevel,
    });
    notify("Zoom applied successfully!", "success");
  };
  const resetZoom = () => {
    setZoomCenter({ x: 0, y: 0 });
    setZoomStart(currentElement.newStart);
    setzoomDuration(0);
    setZoomLevel(1);
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement.id) {
        return {
          ...item,
          zoomCenter: { x: 0, y: 0 },
          zoomStart: null,
          zoomDuration: 0,
          zoomLevel: 1,
        };
      }
      return item;
    });

    setSourceAndTiming([...updatedSourceAndTiming]);
    setCurrentElement({
      ...currentElement,
      zoomStart: null,
      zoomDuration: 0,
      zoomLevel: 1,
    });
    notify("Zoom reset successfully!", "success");
    setClickPosition(null); // Reset the red dot position
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
        setZoomLevel(selectedItem.zoomLevel);
        setZoomCenter(selectedItem.zoomCenter);
        setZoomStart(
          selectedItem.zoomStart
            ? Math.floor(selectedItem.zoomStart + selectedItem.newStart)
            : Math.floor(selectedItem.newStart)
        );
        setzoomDuration(
          selectedItem.zoomDuration ? selectedItem.zoomDuration : 0
        );

        // Convert zoomCenter (relative) to absolute click position (pixels)
        if (selectedItem.zoomCenter) {
          const previewWidth = 290; // Match your preview width
          const previewHeight = 180; // Match your preview height (16:9)

          const absoluteX = selectedItem.zoomCenter.x * previewWidth;
          const absoluteY = selectedItem.zoomCenter.y * previewHeight;

          setClickPosition({ x: absoluteX, y: absoluteY });
        } else {
          setClickPosition(null); // Reset if no zoom data
        }
      }
    }
  }, [selectedElement, sourceAndTiming]);

  useEffect(() => {
    const selectedItem = sourceAndTiming.find(
      (item) => item.id === selectedElement.id
    );
    setCurrentElement(selectedItem);
    setZoomStartValue(
      !selectedItem?.zoomStart ? selectedItem?.newStart : selectedItem.zoomStart
    );
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
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            style={{
              backgroundColor: "#EB1AB4",
              height: "30px",
              borderColor: "transparent",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Zoom settings
          </button>
          {isOpen && (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <label style={{ width: "80px" }}>Start</label>
                <input
                  name="zoom-start"
                  type="number"
                  value={zoomStartValue}
                  min={
                    currentElement ? Math.floor(currentElement?.newStart) : 0
                  }
                  max={
                    currentElement ? Math.floor(currentElement?.newEnd - 1) : 0
                  }
                  step={1}
                  onChange={(e) => setZoomStart(Number(e.target.value))}
                ></input>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <label style={{ width: "80px" }}>Duration</label>
                <input
                  name="zoom-end"
                  type="number"
                  value={zoomDuration}
                  min={0}
                  max={
                    currentElement
                      ? Math.floor(currentElement?.newEnd - zoomStart)
                      : 0
                  }
                  step={1}
                  onChange={(e) => setzoomDuration(Number(e.target.value))}
                ></input>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <label style={{ width: "80px" }}>Level</label>
                <input
                  name="zoom-level"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  defaultValue={isNaN(zoomLevel) ? 1 : zoomLevel}
                  onChange={(e) => setZoomLevel(e.target.value)}
                />
                <label>{isNaN(zoomLevel) ? 1 : zoomLevel}</label>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <div
                  onClick={handlePreviewClick}
                  style={{
                    width: "290px", // Preview size
                    // aspectRatio: "16/9",
                    height: "180px",
                    marginRight: "10px",
                    border: "2px solid #ccc",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <video
                    ref={videoRef}
                    src={currentElement?.source}
                    currentTime="30"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                    muted
                  ></video>
                  {clickPosition && (
                    <div
                      style={{
                        position: "absolute",
                        top: clickPosition.y - 5,
                        left: clickPosition.x - 5,
                        width: "10px",
                        height: "10px",
                        backgroundColor: "red",
                        borderRadius: "50%",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={addZoom}
                  style={{
                    width: "30%",
                    backgroundColor: "#892fff",
                    height: "30px",
                    borderColor: "transparent",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={resetZoom}
                  style={{
                    width: "30%",
                    backgroundColor: "grey",
                    height: "30px",
                    borderColor: "transparent",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          )}
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
