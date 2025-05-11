import React from "react";
import styles from "./styles/LowerThird8.module.css";
import { FaGithub } from "react-icons/fa";

const LowerThird8 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={styles["lower-third"]}>
        <div className={styles["linkedin-logo-container"]}>
          <FaGithub className={styles["linkedin-logo"]} />
        </div>
        <div className={styles["text-content"]}>
          <div className={styles.title}>@{text}</div>
        </div>
      </div>
    </div>
  );
};

export default LowerThird8;
