import React, { useContext } from "react";
import AppContext from "../../AppContext";
import { pixels } from "../../utils/PixelsPerSecondEnum";

const Controls = () => {
  const { setSeekerPosition, setSeekerPositionManuallyChanged, zoomTimeline, maxTime, convertToPixels } =
    useContext(AppContext);
  const handleClick = (e) => {
    const header = document.querySelector(".timeline-header");
    if (!header) return;

    const rect = header.getBoundingClientRect();
    
    const x = Math.round(e.clientX - rect.left); // Relative x-coordinate
    setSeekerPosition(x);
    setSeekerPositionManuallyChanged(true);
  };
  const ticks = [];
  const duration = convertToPixels(maxTime)
  for (let i = 0; i <= duration; i = i+pixels[zoomTimeline]) {
    ticks.push(
      <div
        key={i}
        className="tick"
        style={{
          left: `${i * pixels[zoomTimeline]}px`,
        }}
      />
    );
  }

  return (
    <div className="controls">
      <div className="timeline-header" onClick={(e)=>handleClick(e)}>
        {ticks}
      </div>
    </div>
  );

};

export default Controls;
