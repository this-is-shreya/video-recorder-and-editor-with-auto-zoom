"use client";
import { useContext, useEffect, useState } from "react";
import styles from "./styles/glowingtext.module.css";
import AppContext from "../../../AppContext";


export default function GlowingText({ text, trackNum }) {
  const {isPlaying} = useContext(AppContext)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 100);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.starsContainer} ${isVisible && isPlaying? styles.active : ""}`}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div
        className={`${styles.textContainer} ${isVisible && isPlaying? styles.visible : ""}`}
      >
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={styles.char}
            style={{
              animationDelay: `${0.1 * index}s`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
