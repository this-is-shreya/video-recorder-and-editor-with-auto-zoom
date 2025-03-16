import React, { useContext } from "react";
import AppContext from "../AppContext";
import { mediaType } from "../utils/MediaEnum";

const TextEffectSettings = () => {
  const { selectedElement, effectsAndTiming, setEffectsAndTiming, setIsTimerChanged } =
    useContext(AppContext);
  console.log("SELECTED ELEMENT IS ", selectedElement);
  const currentEffectsAndTiming = effectsAndTiming.find(
    (item) => item.id === selectedElement.id
  );
  const updateText = (e) => {
    if(!currentEffectsAndTiming.source.includes("timer")){
      setEffectsAndTiming((prev) =>
        prev.map((item) =>
          item.id === currentEffectsAndTiming.id
            ? { ...item, text: e.target.value }
            : item
        )
      );
    }
    else{
      if(isNaN(Number(e.target.value))){
        return;
      }
      setEffectsAndTiming((prev) =>
        prev.map((item) =>
          item.id === currentEffectsAndTiming.id
            ? { ...item, text: e.target.value }
            : item
        )
      );
      setIsTimerChanged(true);
    }
  };
  const updateFont = (e) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, fontStyle: e.target.value }
          : item
      )
    );
  };
  const updateFontSize = (e) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, fontSize: e.target.value }
          : item
      )
    );
  };
  const updateTextColor = (e) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, textColor: e.target.value }
          : item
      )
    );
  };
  const updateBackgroundColor = (e) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, backgroundColor: e.target.value }
          : item
      )
    );
  };
  const updateAnimation = (e) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, animation: e.target.value }
          : item
      )
    );
  };
  const updateBackgroundTransparency = (e) => {
    console.log("marking checkbox to ", e.target.checked);

    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, isBackgroundTransparent: e.target.checked }
          : item
      )
    );
  };
  return (
    <div className="panel">
      {currentEffectsAndTiming?.source.includes("text") && !currentEffectsAndTiming?.source.includes("time-display") && (
        <div>
          Text:{" "}
          <textarea
            onChange={(e) => {
              updateText(e);
            }}
            value={currentEffectsAndTiming?.text}
            aria-multiline
          ></textarea>
        </div>
      )}
      {selectedElement &&
      (currentEffectsAndTiming?.source.includes("text-basic") ||
        currentEffectsAndTiming?.source.includes("text-title")) ? (
        <div className="media-container">
          <div>
            Font:{" "}
            <select
              onChange={(e) => {
                updateFont(e);
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
            </select>
          </div>
          <div>
            Font Size:{" "}
            <input
              type="number"
              onChange={(e) => {
                updateFontSize(e);
              }}
              value={currentEffectsAndTiming?.fontSize}
            />
          </div>
          <div>
            Text Color:{" "}
            <input
              type="color"
              onChange={(e) => {
                updateTextColor(e);
              }}
              value={currentEffectsAndTiming?.textColor}
            />
          </div>
          <div>
            Background Color:{" "}
            <input
              type="color"
              onChange={(e) => {
                updateBackgroundColor(e);
              }}
              value={currentEffectsAndTiming?.backgroundColor}
            />
          </div>
          <div>
            <span>Animation:</span>
            <select
              onChange={(e) => {
                updateAnimation(e);
              }}
            >
              <option value="animate__fadeIn">Fade In</option>
              <option value="animate__zoomIn">Zoom In</option>
              <option value="animate__zoomInDown">Zoom In Down</option>
            </select>
          </div>
          {currentEffectsAndTiming?.source === "text-basic" && (
            <>
              <label>Background transparent</label>
              <input
                type="checkbox"
                onChange={(e) => {
                  updateBackgroundTransparency(e);
                }}
              />
            </>
          )}
          <span>Some options might not work for all title cards, lower thirds.</span>
        </div>
      ) : (
        <h3>Nothing else to show</h3>
      )}
    </div>
  );
};

export default TextEffectSettings;
