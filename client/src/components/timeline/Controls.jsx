import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";
import { Tooltip } from "react-tooltip";

const Controls = () => {
  const {
    setSeekerPosition,
    setSeekerPositionManuallyChanged,
    zoomTimeline,
    maxTime,
    convertToPixels,
    sourceAndTiming,
    effectsAndTiming,
  } = useContext(AppContext);
 
  const [width, setWidth] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = (e) => {
    const header = document.querySelector(".timeline-header");
    if (!header) return;

    const rect = header.getBoundingClientRect();

    const x = Math.round(e.clientX - rect.left); // Relative x-coordinate
    setSeekerPosition(x);
    setSeekerPositionManuallyChanged(true);
  };

  
  const ticks = [];
  const duration = convertToPixels(maxTime);
  for (
    let i = 0;
    i <= duration / pixels[zoomTimeline];
    i = i + pixels[zoomTimeline]
  ) {
    ticks.push(
      <div
        key={i}
        className="tick tooltip-control"
        style={{
          left: `${i * pixels[zoomTimeline]}px`,
        }}
        data-tooltip-class-name="tooltip-control"
        data-tooltip-id="tooltip-control"
        data-tooltip-content={`${formatTime(i)}`}
      ></div>
    );
  }
  
  useEffect(() => {
    const trackWidth = document
      .querySelector(".track")
      .getBoundingClientRect().width;
    setWidth(trackWidth);
  }, [sourceAndTiming, effectsAndTiming]);

  return (
    <div className="controls" style={{ minWidth: width }}>
      <div className="timeline-header" onClick={(e) => handleClick(e)}>
        {ticks}
      </div>
      <Tooltip
        id="tooltip-control"
        anchorSelect=".tooltip-control"
        place="top"
        strategy="absolute"
        style={{
          zIndex: 9999,
          backgroundColor: "#892fff",
          color: "white",
          fontSize: "12px",
          padding: "5px",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

export default Controls;
