import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import TitleCard1 from "../titleCard/TitleCard1";
import TitleCard2 from "../titleCard/TitleCard2";
import TitleCard3 from "../titleCard/TitleCard3";
import TitleCard4 from "../titleCard/TitleCard4";
import TitleCard5 from "../titleCard/TitleCard5";
import TitleCard6 from "../titleCard/TitleCard6";
import TitleCard7 from "../titleCard/TitleCard7";
import LowerThird1 from "../lowerThird/LowerThird1";
import LowerThird2 from "../lowerThird/LowerThird2";
import LowerThird3 from "../lowerThird/LowerThird3";
import LowerThird4 from "../lowerThird/LowerThird4";
import LowerThird5 from "../lowerThird/LowerThird5";
import LowerThird6 from "../lowerThird/LowerThird6";
import LowerThird7 from "../lowerThird/LowerThird7";
import LowerThird8 from "../lowerThird/LowerThird8";
import BasicText from "./BasicText";
import TimeDisplay from "./otherText/TimeDisplay";
import DynamicTextOverlay from "./otherText/DynamicTextOverlay";
import AllOtherText from "./otherText/AllOtherText";

const TextEffect = () => {
  const { effectsAndTiming, selectedElement, currentEffectsAndTiming } =
    useContext(AppContext);
  if (
    currentEffectsAndTiming.length == 0 ||
    !currentEffectsAndTiming[0]?.source.includes("text")
  ) {
    return;
  }
  console.log(">>currentEFFFFECT", currentEffectsAndTiming);

  const source = currentEffectsAndTiming[0].source;
  const [text, setText] = useState(currentEffectsAndTiming[0].text);
  const [fontStyle, setFontStyle] = useState(
    currentEffectsAndTiming[0].fontStyle
  );
  const [fontSize, setFontSize] = useState(currentEffectsAndTiming[0].fontSize);
  const [textColor, setTextColor] = useState(
    currentEffectsAndTiming[0].textColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    currentEffectsAndTiming[0].backgroundColor
  );
  const trackNum = currentEffectsAndTiming[0].trackNum;

  useEffect(() => {
    setText(currentEffectsAndTiming[0].text);
    setFontStyle(currentEffectsAndTiming[0].fontStyle);
    setFontSize(currentEffectsAndTiming[0].fontSize);
    setTextColor(currentEffectsAndTiming[0].textColor);
    setBackgroundColor(currentEffectsAndTiming[0].backgroundColor);
    console.log(">>text is ", text);
  }, [currentEffectsAndTiming[0]]);

  return (
    <>
      {source === "text-basic" && <BasicText />}
      {source === "text-title-1" && (
        <TitleCard1
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-2" && (
        <TitleCard2
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-3" && (
        <TitleCard3
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-4" && (
        <TitleCard4
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-5" && (
        <TitleCard5
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-6" && (
        <TitleCard6
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {source === "text-title-7" && (
        <TitleCard7
          text={text}
          fontStyle={fontStyle}
          fontSize={fontSize}
          color={textColor}
          bgColor={backgroundColor}
        />
      )}
      {/* Lower thirds */}
      {source === "text-lower-third-1" && (
        <LowerThird1 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-2" && (
        <LowerThird2 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-3" && (
        <LowerThird3 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-4" && (
        <LowerThird4 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-5" && (
        <LowerThird5 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-6" && (
        <LowerThird6 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-7" && (
        <LowerThird7 text={text} trackNum={trackNum} />
      )}
      {source === "text-lower-third-8" && (
        <LowerThird8 text={text} trackNum={trackNum} />
      )}
      {/* other text */}
      {source === "text-other-1-time-display" && (
        <TimeDisplay trackNum={trackNum} />
      )}
      {source === "text-other-3" && (
        <DynamicTextOverlay
          backgroundType={"sun"}
          text={text}
          trackNum={trackNum}
        />
      )}
      {source === "text-other-4" && (
        <DynamicTextOverlay
          backgroundType={"moon"}
          text={text}
          trackNum={trackNum}
        />
      )}
      {source === "text-other-5" && (
        <DynamicTextOverlay
          backgroundType={"cloud"}
          text={text}
          trackNum={trackNum}
        />
      )}
      {source === "text-other-6" && (
        <AllOtherText text={text} trackNum={trackNum} type={"cartoon"} />
      )}
      {source === "text-other-7" && (
        <AllOtherText text={text} trackNum={trackNum} type={"aesthetic"} />
      )}
      {source === "text-other-8" && (
        <AllOtherText text={text} trackNum={trackNum} type={"professional"} />
      )}
      {source === "text-other-9" && (
        <AllOtherText text={text} trackNum={trackNum} type={"glitch"} />
      )}
    </>
  );
};

export default TextEffect