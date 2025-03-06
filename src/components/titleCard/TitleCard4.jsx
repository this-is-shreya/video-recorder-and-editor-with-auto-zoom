import React, { useRef } from "react";
import styles from "./styles/TitleCard4.module.css";

const TitleCard4 = ({
  text = "This is the tile text\nAnd this is just the lower info",
  fontStyle = "Arial",
  fontSize = "14",
  color = "black",
  bgColor = "white",
}) => {
  const title = text.split("\n")[0];
  const lowerText = text.split("\n")[1];
  return (
    <div
      className={styles.titleCard}
      style={{
        fontFamily: fontStyle,
        fontSize: fontSize + "px",
        color: color,
        backgroundColor: bgColor,
      }}
    >
      <div className={styles.upperWrap}>
        <div className={styles.text}>{title}</div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.lowerWrap}>
        <div className={styles.text}>{lowerText}</div>
      </div>
    </div>
  );
};

export default TitleCard4;
