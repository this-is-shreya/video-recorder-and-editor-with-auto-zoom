import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import styles from "./styles/LowerThird5.module.css";

const LowerThird5 = () => {
  return (
    <div className={styles["title-card"]}>
      <div className={`${styles["lower-third"]}`}>
        <FaMapMarkerAlt className={styles.icon} />
        <span className={styles.text}>Location</span>
      </div>
    </div>
  );
};

export default LowerThird5;
