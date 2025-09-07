"use client";
import { useContext, useEffect, useState } from "react";
import styles from "./styles/transition4.module.css";
import AppContext from "../../AppContext";

export default function Transition4() {
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
      <div className={styles.arrowsContainer}>
        {Array.from({ length: 10 }).map((_, rowIndex) => (
          <div key={rowIndex} className={styles.arrowRow}>
            {Array.from({ length: 15 }).map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={styles.arrow}
                style={{
                  animationDelay: `${(rowIndex + colIndex) * 0.05}s`,
                  backgroundColor: `hsl(${
                    (rowIndex + colIndex) * 10
                  }, 70%, 50%)`,
                }}
              >
                <div className={styles.arrowHead}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
