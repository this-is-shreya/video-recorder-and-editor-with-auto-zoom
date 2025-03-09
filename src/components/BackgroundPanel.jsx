import React from "react";
import { mediaType } from "../utils/MediaEnum";

const BackgroundPanel = () => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-alt"));
    e.dataTransfer.setData("media-type", mediaType.background);
    e.dataTransfer.setData("duration", 10);
  };
  return (
    <div className="panel">
      <div className="media-container">
        <div
          className="media-item"
          data-alt="background-1"
          onDragStart={(e) => {
            handleDragStart(e);
          }}
          draggable
        >
          Background 1
        </div>
        <div
          className="media-item"
          data-alt="background-2"
          onDragStart={(e) => {
            handleDragStart(e);
          }}
          draggable
        >
          Background 2
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;
