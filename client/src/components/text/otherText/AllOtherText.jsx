import React from "react";
import styles from "./styles/AllOtherText.module.css";
import TypingText from "./TypingText";
import GlowingText from "./GlowingText";
import BubbleText from "./BubbleText";

const AllOtherText = ({ type, text, trackNum }) => {
  return (
    <div style={{ zIndex: trackNum }}>
      {type === "cartoon" && (
        <div className={styles["cartoon-text"]}>{text}</div>
      )}
      {type === "professional" && (
        <TypingText text={text} trackNum={trackNum}/>
      )}
      {type === "aesthetic" && (
        <GlowingText text={text} trackNum={trackNum}/>
      )}
      {type === "glitch" && <BubbleText text={text} trackNum={trackNum}/>}
    </div>
  );
};

export default AllOtherText;
