import React, { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";
import { Rnd } from "react-rnd";
import "animate.css";

const BasicText = () => {
  const {
    effectsAndTiming,
    setEffectsAndTiming,
    selectedElement,
    currentEffectsAndTiming,
  } = useContext(AppContext);
  if (!effectsAndTiming || !effectsAndTiming[0]) {
    console.log("No effects and timing");
    return;
  }

  if (!currentEffectsAndTiming) {
    return null; // Exit early if no matching element is found
  }
  const currentEffectsAndTimingFiltered = currentEffectsAndTiming.find(item=>item.source.includes("text-basic"));
  const trackNum = currentEffectsAndTimingFiltered.trackNum
  const [size, setSize] = useState(
    currentEffectsAndTimingFiltered.size || { width: 200, height: 100 }
  );
  const [clicked, setClicked] = useState(false);
  const [position, setPosition] = useState(
    currentEffectsAndTimingFiltered.position || { x: 0, y: 0 }
  );
  const [text, setText] = useState(currentEffectsAndTimingFiltered.text);
  const [fontStyle, setFontStyle] = useState(
    currentEffectsAndTimingFiltered.fontStyle
  );
  const [fontSize, setFontSize] = useState(currentEffectsAndTimingFiltered.fontSize);
  const [textColor, setTextColor] = useState(
    currentEffectsAndTimingFiltered.textColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    currentEffectsAndTimingFiltered.backgroundColor
  );
  const [animation, setAnimation] = useState(
    currentEffectsAndTimingFiltered.animation
  );
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(
    currentEffectsAndTimingFiltered.isBackgroundTransparent
  );

  const updateContext = (newPosition, newSize) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTimingFiltered.id
          ? { ...item, position: newPosition, size: newSize }
          : item
      )
    );
    console.log("Updated Context with New Size:", newSize);
  };
  useEffect(() => {
    setText(currentEffectsAndTimingFiltered.text);
    setFontStyle(currentEffectsAndTimingFiltered.fontStyle);
    setFontSize(currentEffectsAndTimingFiltered.fontSize);
    setTextColor(currentEffectsAndTimingFiltered.textColor);
    setBackgroundColor(currentEffectsAndTimingFiltered.backgroundColor);
    setAnimation(currentEffectsAndTimingFiltered.animation);
    setIsBackgroundTransparent(
      currentEffectsAndTimingFiltered.isBackgroundTransparent
    );
    console.log("Current Effects and Timing is ", currentEffectsAndTimingFiltered);
  }, [currentEffectsAndTimingFiltered]);
  return (
    <div
      onClick={() => {
        setClicked(true);
      }}
      onDoubleClick={() => {
        setClicked(false);
      }}
    >
      <Rnd
        size={{ width: size.width, height: size.height }}
        position={{ x: position.x, y: position.y }}
        bounds=".video-player"
        onDragStop={(e, data) => {
          const newPosition = { x: data.x, y: data.y };
          setPosition(newPosition);
          updateContext(newPosition, size);
        }}
        onResizeStop={(e, direction, ref, delta, _position) => {
          let newWidth = ref.offsetWidth;
          let newHeight = ref.offsetHeight;

          const newSize = { width: newWidth, height: newHeight };
          const newPosition = { x: _position.x, y: _position.y };

          setSize(newSize);
          setPosition(newPosition);
          updateContext(newPosition, newSize);
        }}
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          backgroundColor: isBackgroundTransparent
            ? "transparent"
            : backgroundColor,
          zIndex: trackNum,
          border: clicked ? "2px solid purple" : "",

        }}
        className={`${selectedElement.id}-preview animate__animated ${animation}`}
      >
        <span
          className={`animate__animated ${animation}`}
          style={{
            color: textColor,
            padding: "10px",
            textAlign: "center",
            fontSize: fontSize + "px",
            fontFamily: fontStyle,
            display: "inline-block",
            position:"absolute",
            overflow:"hidden"
          }}
        >
          {text}
        </span>
      </Rnd>
    </div>
  );
};

export default BasicText;
