import React from 'react'
import styles from "./styles/TitleCard5.module.css"

const TitleCard5 = ({
  text = "Add text here\nAdd text here\nAdd text here",
  fontStyle = "Arial",
  fontSize = "14",
  color = "black",
  bgColor = "white",
}) => {
  const text1 = text.split("\n")[0];
  const text2 = text.split("\n")[1];
  const text3 = text.split("\n")[2];
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
      <div className={styles["text-container"]}>
        <h4 className={styles.text}>{text1}</h4>
        <h1 className={styles.text}>{text2}</h1>
        <h4 className={styles.text}>{text3}</h4>
      </div>
    </div>
  );
};

export default TitleCard5