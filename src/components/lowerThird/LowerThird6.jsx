import React from "react";
import { FaQuoteLeft } from "react-icons/fa";
import styles from "./styles/LowerThird6.module.css"; 

const LowerThird6 = () => {
  return (
    <div className={styles["title-card"]}>
      <div className={`${styles["lower-third"]}`}>
        <FaQuoteLeft className={styles.icon} />
        <span className={styles.text}>Some QUOTE</span>
      </div>
    </div>
  );
};

export default LowerThird6;
