import React, { useContext } from "react";
import styles from "./styles/transition3.module.css";
import AppContext from "../../AppContext";

const Transition3 = ({ children }) => {
  const { isPlaying } = useContext(AppContext);
  return (
    <div
      className={`${styles["line-wipe-container"]} ${
        isPlaying ? styles.playing : styles.paused
      }`}
    >
      <div className={styles["line-wipe"]}>{children}</div>
    </div>
  );
};

export default Transition3;
