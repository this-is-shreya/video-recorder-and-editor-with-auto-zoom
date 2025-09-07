import React from "react";
import styles from "./styles/LowerThird1.module.css";
import { FaLinkedin } from "react-icons/fa";

const LowerThird1 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={styles["lower-third"]}>
        <div className={styles["linkedin-logo-container"]}>
          <FaLinkedin className={styles["linkedin-logo"]} />
        </div>
        <div className={styles["text-content"]}>
          <div className={styles.title}>@{text}</div>
        </div>
      </div>
    </div>
  );
};

export default LowerThird1;
