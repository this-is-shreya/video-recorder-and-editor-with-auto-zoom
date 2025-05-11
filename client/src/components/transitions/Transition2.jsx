"use client";
import { useContext, useEffect, useState } from "react";
import styles from "./styles/transition2.module.css";
import AppContext from "../../AppContext";

export default function transition2() {
  const {isPlaying} = useContext(AppContext)
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    // Animation will complete automatically based on CSS timing
    return () => setIsAnimating(false);
  }, []);

  return (
    <div
      className={`${styles.container} ${isAnimating ? styles.animate : ""} ${
        isPlaying ? styles.playing : styles.paused
      }`}
    >
      <div className={styles.page}>
        <div className={styles.pageFront}></div>
        <div className={styles.pageBack}></div>
        <div className={styles.pageShadow}></div>
      </div>
    </div>
  );
}
