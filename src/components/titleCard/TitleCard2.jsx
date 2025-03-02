import React from "react";
import styles from "./styles/TitleCard2.module.css";

const TitleCard2 = ({ text = "Cinematic Effect" }) => {
  return (
    <div className={styles.titleCard}>
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
