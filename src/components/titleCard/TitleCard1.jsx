import React from "react";
import styles from "./styles/TitleCard1.module.css";

const TitleCard1 = ({ text="Leading\nCode\nCafe" }) => {
  const textArray = text.split("\n");

  return (
    <div className={styles.titleCard}>
      <div className={styles.titleWord}>{textArray[0]}</div>
      <div className={styles.titleWord}>{textArray[1]}</div>
      <div className={styles.titleWord}>{textArray[2]}</div>
    </div>
  );
};

export default TitleCard1;


