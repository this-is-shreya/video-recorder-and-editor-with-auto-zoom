import React, { useEffect, useState } from "react";
import styles from "./styles/TitleCard1.module.css";

const TitleCard1 = ({
  text = "Add\nText\nHere",
  fontStyle = "Arial",
  fontSize = "14",
  color = "black",
  bgColor = "white",
}) => {
  const [textArray, setTextArray] = useState(text.split("\n"));

  useEffect(() => {
    setTextArray(text.split("\n"));
  }, [text]);

  return (
    <div
      className={styles.titleCard}
      style={{
        fontFamily: fontStyle,
        fontSize: fontSize+"px",
        color: color,
        backgroundColor: bgColor,
      }}
    >
      <div className={styles.titleWord}>{textArray[0]}</div>
      <div className={styles.titleWord}>{textArray[1]}</div>
      <div className={styles.titleWord}>{textArray[2]}</div>
    </div>
  );
};

export default TitleCard1;
