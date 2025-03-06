import React from "react";
import styles from "./styles/TitleCard7.module.css";

const TitleCard7 = ({
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
      <div className={styles.stage}>
        <div className={styles.wrapper}>
          <div className={styles.slash}></div>
          <div className={styles.sides}>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
          </div>
          <div className={styles.text}>
            <div className={styles.textBacking}>{text}</div>
            <div className={styles.textLeft}>
              <div className={styles.inner}>{text}</div>
            </div>
            <div className={styles.textRight}>
              <div className={styles.inner}>{text}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleCard7;
