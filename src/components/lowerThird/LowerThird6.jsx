import React from "react";
import { FaQuoteLeft } from "react-icons/fa";
import styles from "./styles/LowerThird6.module.css"; 

const LowerThird6 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={`${styles["lower-third"]}`}>
        <FaQuoteLeft className={styles.icon} />
        <span className={styles.text}>{text}</span>
      </div>
    </div>
  );
};

export default LowerThird6;
