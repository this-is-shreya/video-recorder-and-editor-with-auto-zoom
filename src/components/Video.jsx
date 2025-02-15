import React, { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";
import { extractAudioFromBlobURL } from "../utils/extractAndDownloadAudio";

const Video = () => {
  const {
    selectedElement,
    sourceAndTiming,
    setSourceAndTiming,
    setIsSpeedChange,
    seekerPosition,
  } = useContext(AppContext);
  const [currentElement, setCurrentElement] = useState(
    sourceAndTiming.find((item) => item.id === selectedElement)
  );
  const [borderRadius, setBorderRadius] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  const [zoomStart, setZoomStart] = useState(currentElement?.zoomStart);
  const [zoomDuration, setzoomDuration] = useState(
    currentElement?.zoomDuration
  );
  const [zoomLevel, setZoomLevel] = useState(
    currentElement ? currentElement?.zoomLevel : 1
  );
  const [clickPosition, setClickPosition] = useState(null); // Stores red dot position
  const [isOpen, setIsOpen] = useState(false);

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
    console.log(
      "adding zoom for ",
      zoomStart,
      zoomDuration,
      zoomDuration <= zoomStart
    );
    if (zoomDuration == null) {
      return;
    }
    console.log(
      "adding zoom for ",
      zoomStart,
      zoomDuration,
      currentElement.newStart,
      currentElement.newEnd
    );

    if (
      zoomStart < currentElement.newStart ||
      zoomDuration + zoomStart > currentElement.newEnd
    ) {
      return;
    }
    console.log(
      "adding zoom for ",
      zoomStart,
      zoomDuration,
      currentElement.newStart,
      currentElement.newEnd
    );

    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
        return {
          ...item,
          zoomCenter: zoomCenter,
          zoomStart: Math.ceil(Number(zoomStart - item.newStart)),
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
      zoomStart: Number(zoomStart),
      zoomDuration: Number(zoomDuration),
      zoomLevel: zoomLevel,
    });
  };
  const resetZoom = () => {
    setZoomCenter({ x: 0, y: 0 });
    setZoomStart(currentElement.newStart);
    setzoomDuration(0);
    setZoomLevel(1);
    const updatedSourceAndTiming = sourceAndTiming.map((item) => {
      if (item.id === selectedElement) {
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
  };

  useEffect(() => {
    if (selectedElement) {
      const selectedItem = sourceAndTiming.find(
        (item) => item.id === selectedElement
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
          const previewWidth = 200; // Match your preview width
          const previewHeight = 112; // Match your preview height (16:9)

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
    setCurrentElement(
      sourceAndTiming.find((item) => item.id === selectedElement)
    );
  }, [selectedElement, sourceAndTiming]);

  return (
    <div className="slidecontainer">
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
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
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
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
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <label>Split audio:</label>
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
      <button onClick={()=>{setIsOpen(!isOpen)}}>Zoom settings</button>
      {isOpen && (
        <>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <label>Add Zoom:</label>
        <input
          name="zoom-start"
          type="number"
          value={
            isNaN(zoomStart) ? Math.floor(currentElement?.newStart) : zoomStart
          }
          min={currentElement ? Math.floor(currentElement?.newStart) : 0}
          max={currentElement ? Math.floor(currentElement?.newEnd - 1) : 0}
          step={1}
          onChange={(e) => setZoomStart(Number(e.target.value))}
        ></input>
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <label>Zoom duration</label>
        <input
          name="zoom-end"
          type="range"
          value={zoomDuration}
          min={0}
          max={
            currentElement ? Math.floor(currentElement?.newEnd - zoomStart) : 0
          }
          step={1}
          onChange={(e) => setzoomDuration(Number(e.target.value))}
        ></input>
        <label>{isNaN(zoomDuration) ? 0 : zoomDuration}</label>
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <label>Zoom level:</label>
        <input
          name="zoom-level"
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={isNaN(zoomLevel) ? 1 : zoomLevel}
          onChange={(e) => setZoomLevel(e.target.value)}
        />
        <label>{isNaN(zoomLevel) ? 1 : zoomLevel}</label>
      </div>
      <label>Preview:</label>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <div
          onClick={handlePreviewClick}
          style={{
            width: "200px", // Preview size
            height: "112px", // Aspect ratio of 16:9
            marginRight: "10px",
            border: "2px solid #ccc",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <video
            src={currentElement?.source}
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
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={addZoom}>Apply</button>
        <button onClick={resetZoom}>Reset</button>
      </div>
      </>
    )}
    </div>
  );
};

export default Video;
