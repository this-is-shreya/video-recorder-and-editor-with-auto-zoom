import React from "react";
import styles from "./styles/LowerThird2.module.css";
import { FaInstagram } from "react-icons/fa";

const LowerThird2 = ({text="sample text", trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex: trackNum}}>
      <div className={styles["lower-third"]}>
        <div className={styles["linkedin-logo-container"]}>
          <FaInstagram className={styles["linkedin-logo"]} />
        </div>
        <div className={styles["text-content"]}>
          <div className={styles.title}>@{text}</div>
        </div>
      </div>
    </div>
  );
};

export default LowerThird2;
