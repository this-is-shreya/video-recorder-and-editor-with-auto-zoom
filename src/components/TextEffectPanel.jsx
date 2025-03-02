import React, { useRef } from "react";
import { mediaType } from "../utils/MediaEnum";

const TextEffectPanel = () => {
  const videoRefs = useRef([]);

  const handleMouseEnter = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].play();
    }
  };

  const handleMouseLeave = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].pause();
      videoRefs.current[index].currentTime = 0; // Reset video to start
    }
  };

  const handleDragStart = (e) => {
    const element = e.target.querySelector("video");
    console.log("alt is ", element.getAttribute("data-alt"));

    e.dataTransfer.setData("text/plain", element.getAttribute("data-alt"));
    e.dataTransfer.setData("media-type", mediaType.effects);
    e.dataTransfer.setData("duration", 4);
  };

  return (
    <div className="panel">
      <h3>Title Cards</h3>

      <div className="media-container">
        {[...Array(7)].map((_, index) => (
          <div
            key={index + 1}
            className="media-item"
            draggable
            onDragStart={(e) => handleDragStart(e)}
          >
            <video
              src={`/assets/${index + 1}.mp4`}
              data-alt={`text-title-${index + 1}`}
              muted
              loop
              ref={(el) => (videoRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              style={{ width: "100%" }}
            />
            <p>Title Card {index + 1}</p>
          </div>
        ))}
      </div>
      <h3>Lower thirds</h3>
      <div className="media-container">
        {[...Array(8)].map((_, index) => (
          <div
            key={index + 1}
            className="media-item"
            draggable
            onDragStart={(e) => handleDragStart(e)}
          >
            <video
              src={`/assets/${index + 1}.mp4`}
              data-alt={`text-lower-third-${index + 1}`}
              muted
              loop
              ref={(el) => (videoRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              style={{ width: "100%" }}
            />
            <p>Lower Third {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextEffectPanel;
