import React, { useContext } from "react";
import styles from "./styles/transition5.module.css";
import AppContext from "../../AppContext";
const Transition5 = ({ children }) => {
  const { isPlaying } = useContext(AppContext);
  return (
    <div
      className={`${styles["transition-container"]} ${
        isPlaying ? styles.playing : styles.paused
      }`}
    >
      <div class={styles["transition-overlay"]}>{children}</div>
    </div>
  );
};

export default Transition5;
