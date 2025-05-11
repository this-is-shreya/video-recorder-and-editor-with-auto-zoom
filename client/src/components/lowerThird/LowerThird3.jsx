import React from "react";
import styles from "./styles/LowerThird3.module.css"

const LowerThird3 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={styles["lower-third-modern"]}>
        <span className={styles["text"]}>{text}</span>
      </div>
    </div>
  );
};

export default LowerThird3;
