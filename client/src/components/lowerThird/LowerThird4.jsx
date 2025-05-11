import React from "react";
import styles from "./styles/LowerThird4.module.css"

const LowerThird4 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={styles["lower-third-animated"]}>
        <span className={styles["text"]}>{text}</span>
      </div>
    </div>
  );
};

export default LowerThird4;
