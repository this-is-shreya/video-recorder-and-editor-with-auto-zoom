import React from "react";
import styles from "./styles/LowerThird2.module.css";
import { FaInstagram } from "react-icons/fa";

const LowerThird2 = () => {
  return (
    <div className={styles["title-card"]}>
      <div className={styles["lower-third"]}>
        <div className={styles["linkedin-logo-container"]}>
          <FaInstagram className={styles["linkedin-logo"]} />
        </div>
        <div className={styles["text-content"]}>
          <div className={styles.title}>@your-username-here</div>
        </div>
      </div>
    </div>
  );
};

export default LowerThird2;
