import React, { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";
import { Rnd } from "react-rnd";
import "animate.css";

const BasicText = () => {
  const { effectsAndTiming, setEffectsAndTiming, selectedElement, currentEffectsAndTiming } =
    useContext(AppContext);
  if (!effectsAndTiming || !effectsAndTiming[0]) {
    console.log("No effects and timing");
    return;
  }

  if (!currentEffectsAndTiming) {
    return null; // Exit early if no matching element is found
  }
  const { trackNum } = currentEffectsAndTiming[0];
  const [size, setSize] = useState(
    currentEffectsAndTiming[0].size || { width: 200, height: 100 }
  );
  const [clicked, setClicked] = useState(false);
  const [position, setPosition] = useState(
    currentEffectsAndTiming[0].position || { x: 0, y: 0 }
  );
  const [text, setText] = useState(currentEffectsAndTiming[0].text);
  const [fontStyle, setFontStyle] = useState(currentEffectsAndTiming[0].fontStyle);
  const [fontSize, setFontSize] = useState(currentEffectsAndTiming[0].fontSize);
  const [textColor, setTextColor] = useState(currentEffectsAndTiming[0].textColor);
  const [backgroundColor, setBackgroundColor] = useState(
    currentEffectsAndTiming[0].backgroundColor
  );
  const [animation, setAnimation] = useState(currentEffectsAndTiming[0].animation);
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(
    currentEffectsAndTiming[0].isBackgroundTransparent
  );

  const updateContext = (newPosition, newSize) => {
    setEffectsAndTiming((prev) =>
      prev.map((item) =>
        item.id === currentEffectsAndTiming[0].id
          ? { ...item, position: newPosition, size: newSize }
          : item
      )
    );
    console.log("Updated Context with New Size:", newSize);
  };
  useEffect(() => {
    setText(currentEffectsAndTiming[0].text);
    setFontStyle(currentEffectsAndTiming[0].fontStyle);
    setFontSize(currentEffectsAndTiming[0].fontSize);
    setTextColor(currentEffectsAndTiming[0].textColor);
    setBackgroundColor(currentEffectsAndTiming[0].backgroundColor);
    setAnimation(currentEffectsAndTiming[0].animation);
    setIsBackgroundTransparent(currentEffectsAndTiming[0].isBackgroundTransparent);
  console.log("Current Effects and Timing is ", currentEffectsAndTiming[0]);
      
  }, [effectsAndTiming]);
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
        className={`${selectedElement.id}-preview`}
      >
        <div
          style={{
            color: textColor,
            padding: "10px",
            textAlign: "center",
            fontSize: fontSize + "px",
            fontFamily: fontStyle,
          }}
        >
          <h1 className={`animate__animated ${animation}`}>{text}</h1>
        </div>
      </Rnd>
    </div>
  );
};

export default BasicText;
