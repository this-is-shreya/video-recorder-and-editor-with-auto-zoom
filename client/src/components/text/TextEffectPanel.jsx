import React from "react";
import { mediaType } from "../../utils/MediaEnum";

const TextEffectPanel = () => {
  const handleDragStart = (e) => {
    const element =
      e.target.tagName.toLowerCase() === "img"
        ? e.target
        : e.target.querySelector("img");
    const alt = element.getAttribute("data-alt");
    const id = Date.now();
    e.dataTransfer.setData("text/plain", element.getAttribute("data-alt"));
    e.dataTransfer.setData("media-type", mediaType.effects);
    e.dataTransfer.setData("duration", 4);
    e.dataTransfer.setData("id", id);
  };

  return (
    <div className="panel">
      <h3 style={{ padding: "10px" }}>Basic Text</h3>
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
      <h3 style={{ padding: "10px" }}>Title Cards</h3>

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
      <h3 style={{ padding: "10px" }}>Lower thirds</h3>
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
      <h3 style={{ padding: "10px" }}>Other</h3>
      <div className="media-container">
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/timedisplay.png`}
            data-alt={`text-other-1-time-display`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Time display</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/sun.png`}
            data-alt={`text-other-3`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Sun</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/moon.png`}
            data-alt={`text-other-4`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Moon</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/cloud.png`}
            data-alt={`text-other-5`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Cloud</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/cartoon.png`}
            data-alt={`text-other-6`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Cartoon</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/glow.png`}
            data-alt={`text-other-7`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Glow</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/typewriter.png`}
            data-alt={`text-other-8`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Typewriter</p>
        </div>
        <div
          className="media-item"
          draggable
          onDragStart={(e) => handleDragStart(e)}
        >
          <img
            src={`/assets/bubbleText.png`}
            data-alt={`text-other-9`}
            style={{ width: "100%", height: "60%" }}
          />
          <p>Bubble</p>
        </div>
      </div>
    </div>
  );
};

export default TextEffectPanel;
