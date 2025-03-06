import React from "react";
import styles from "./styles/TitleCard2.module.css";

const TitleCard2 = ({
  text = "Add text here",
  fontStyle = "Arial",
  fontSize = "14",
  color = "black",
  bgColor = "white",
}) => {
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
      <h1 className={styles.text}>
        <span>{text}</span>
      </h1>
      <div className={styles.outerScratch}>
        <div className={styles.innerScratch}>
          <div className={`${styles.background} ${styles.grain}`}></div>
        </div>
      </div>
    </div>
  );
};

export default TitleCard2;
