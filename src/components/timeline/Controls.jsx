import React from "react";

const Controls = ({ setSeekerPosition }) => {
  const handleClick = (e) => {
    const trackRect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - trackRect.left); // Relative x-coordinate
    setSeekerPosition(x);
  };
  
  return (
    <div className="controls" onClick={handleClick}>
      controls
    </div>
  );
};

export default Controls;
