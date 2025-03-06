import React from 'react'
import styles from  "./styles/TitleCard6.module.css"

const TitleCard6 = ({
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
      <h1 className={styles.text}>{text}</h1>
    </div>
  );
};

export default TitleCard6