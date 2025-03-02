import React from "react";
import styles from "./styles/LowerThird7.module.css";
import { FaYoutube } from "react-icons/fa";

const LowerThird7 = () => {
  return (
    <div className={styles["title-card"]}>
      <div className={styles["lower-third"]}>
        <div className={styles["linkedin-logo-container"]}>
          <FaYoutube className={styles["linkedin-logo"]} />
        </div>
        <div className={styles["text-content"]}>
          <div className={styles.title}>@your-username-here</div>
        </div>
      </div>
    </div>
  );
};

export default LowerThird7;
