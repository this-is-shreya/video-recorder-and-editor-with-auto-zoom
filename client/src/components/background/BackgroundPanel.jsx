import React from "react";
import { mediaType } from "../../utils/MediaEnum";

const BackgroundPanel = () => {
  const handleDragStart = (e) => {
    
    const id = Date.now();
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-alt"));
    e.dataTransfer.setData("media-type", mediaType.background);
    e.dataTransfer.setData("duration", 10);
  };
  return (
    <div className="panel">
      <div className="media-container">
        {[...Array(5)].map((_, index) => (
          <div
            className="media-item"
            data-alt={`background-${index + 1}`}
            onDragStart={(e) => {
              handleDragStart(e);
            }}
            draggable
          >
            <img
              src={`/assets/background-${index + 1}.png`}
              style={{ height: "100%", width: "100%" }}
              data-alt={`background-${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundPanel;
