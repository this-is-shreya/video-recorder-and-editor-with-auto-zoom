import React, { useContext } from "react";
import AppContext from "../../AppContext";

const Controls = () => {
  const {setSeekerPosition, setSeekerPositionManuallyChanged } = useContext(AppContext)
  const handleClick = (e) => {
    const trackRect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - trackRect.left); // Relative x-coordinate
    setSeekerPosition(x);
    setSeekerPositionManuallyChanged(true)
  };
  
  return (
    <div className="controls" onClick={handleClick}>
      controls
    </div>
  );
};

export default Controls;
