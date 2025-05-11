import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import styles from "./styles/LowerThird5.module.css";

const LowerThird5 = ({text, trackNum}) => {
  return (
    <div className={styles["title-card"]} style={{zIndex:trackNum}}>
      <div className={`${styles["lower-third"]}`}>
        <FaMapMarkerAlt className={styles.icon} />
        <span className={styles.text}>{text}</span>
      </div>
    </div>
  );
};

export default LowerThird5;
