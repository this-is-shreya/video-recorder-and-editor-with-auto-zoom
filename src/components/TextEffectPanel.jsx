import React from "react";
import { mediaType } from "../utils/MediaEnum";

const TextEffectPanel = () => {

  const handleDragStart = (e) => {
    const element =
      e.target.tagName.toLowerCase() === "img"
        ? e.target
        : e.target.querySelector("img");
    console.log("alt is ", element.getAttribute("data-alt"));

    e.dataTransfer.setData("text/plain", element.getAttribute("data-alt"));
    e.dataTransfer.setData("media-type", mediaType.effects);
    e.dataTransfer.setData("duration", 4);
  };

  return (
    <div className="panel">
      <h3>Basic Text</h3>
      <div className="media-container">
          <div
            key={1}
            className="media-item"
            draggable
            onDragStart={(e) => handleDragStart(e)}
          >
            <img
              src={`/assets/basicText.png`}
              data-alt={`text-basic`}
              style={{ width: "100%", height: "60%" }}
            />
          </div>
      </div>
      <h3>Title Cards</h3>

      <div className="media-container">
        {[...Array(7)].map((_, index) => (
          <div
            key={index + 1}
            className="media-item"
            draggable
            onDragStart={(e) => handleDragStart(e)}
          >
            <img
              src={`/assets/titlecard${index + 1}.png`}
              data-alt={`text-title-${index + 1}`}
              style={{ width: "100%", height: "70%" }}
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
            <img
              src={`/assets/lowerthird${index + 1}.png`}
              data-alt={`text-lower-third-${index + 1}`}
              style={{ width: "100%", height: "60%" }}
            />
            <p>Lower Third {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextEffectPanel;
