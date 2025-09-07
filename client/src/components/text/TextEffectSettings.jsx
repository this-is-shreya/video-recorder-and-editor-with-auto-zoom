import React, { useContext } from "react";
import AppContext from "../../AppContext";
import { mediaType } from "../../utils/MediaEnum";

const TextEffectSettings = () => {
  const {
    selectedElement,
    effectsAndTiming,
    setEffectsAndTiming,
    setIsTimerChanged,
  } = useContext(AppContext);
  const currentEffectsAndTiming = effectsAndTiming.find(
    (item) => item.id === selectedElement.id
  );
  const updateText = (e) => {
    if (!currentEffectsAndTiming.source.includes("timer")) {
      setEffectsAndTiming((prev) =>
        prev.map((item) =>
          item.id === currentEffectsAndTiming.id
            ? { ...item, text: e.target.value.substring(0, 40) }
            : item
        )
      );
    } else {
      if (isNaN(Number(e.target.value))) {
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

    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming.id
          ? { ...item, isBackgroundTransparent: e.target.checked }
          : item
      )
    );
  };
  return (
    <div className="panel" style={{ padding: "10px" }}>
      {currentEffectsAndTiming?.source.includes("text") &&
        !currentEffectsAndTiming?.source.includes("time-display") && (
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Text</label>
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
        <div
          className="media-container"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Font</label>
              <select onChange={(e) => updateFont(e)}>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Fira Code">Fira Code</option>
                <option value="Raleway">Raleway</option>
                <option value="Bebas Neue">Bebas Neue</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Anton">Anton</option>
                <option value="Indie Flower">Indie Flower</option>
            </select>
          </div>
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Font size</label>
            <input
              type="number"
              onChange={(e) => {
                updateFontSize(e);
              }}
              value={currentEffectsAndTiming?.fontSize}
            />
          </div>
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Font color</label>
            <input
              type="color"
              onChange={(e) => {
                updateTextColor(e);
              }}
              value={currentEffectsAndTiming?.textColor}
            />
          </div>
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Background</label>
            <input
              type="color"
              onChange={(e) => {
                updateBackgroundColor(e);
              }}
              value={currentEffectsAndTiming?.backgroundColor}
            />
          </div>
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            <label style={{ width: "80px" }}>Animation</label>
            <select
              onChange={(e) => {
                updateAnimation(e);
              }}
            >
              <option value="animate__scale-up-center">Scale up center</option>
              <option value="animate__scale-up-top-left">
                Scale up top left
              </option>
              <option value="animate__scale-up-vertical-center">
                Scale up vertical center
              </option>
              <option value="animate__scale-up-horizontal-center">
                Scale up horizontal center
              </option>
              <option value="animate__scale-up-horizontal-left">
                Scale up horizontal left
              </option>
            </select>
          </div>
          {currentEffectsAndTiming?.source === "text-basic" && (
            <div
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
            >
              <label style={{ width: "80px" }}>Background transparent</label>
              <input
                type="checkbox"
                onChange={(e) => {
                  updateBackgroundTransparency(e);
                }}
              />
            </div>
          )}
          <span>
            Some options might not work for all title cards, lower thirds.
          </span>
        </div>
      ) : (
        <h3 style={{ padding: "20px" }}>That's all folks</h3>
      )}
    </div>
  );
};

export default TextEffectSettings;
