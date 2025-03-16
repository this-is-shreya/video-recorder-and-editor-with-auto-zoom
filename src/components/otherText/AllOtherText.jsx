import React from "react";
import styles from "./styles/AllOtherText.module.css";

const AllOtherText = ({ type, text, trackNum }) => {
  return (
    <div className={styles["title-card"]} style={{ zIndex: trackNum }}>
      {type === "cartoon" && (
        <div className={styles["cartoon-text"]}>{text}</div>
      )}
      {type === "professional" && (
        <div className={styles["professional-text"]}>{text}</div>
      )}
      {type === "aesthetic" && (
        <div className={styles["aesthetic-text"]}>{text}</div>
      )}
      {type === "glitch" && <div className={styles["glitch-text"]}>{text}</div>}
    </div>
  );
};

export default AllOtherText;
