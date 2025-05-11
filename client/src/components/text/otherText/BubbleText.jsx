"use client";
import { useContext, useEffect, useState } from "react";
import styles from "./styles/bubble-text.module.css";
import AppContext from "../../../AppContext";


export default function BubbleText({ text }) {
  const {isPlaying} = useContext(AppContext)
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 100);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.bubbleContainer} ${
          isPlaying && isAnimating ? styles.animate : ""
        }`}
      >
        {text.split("").map((char, index) => (
          <span
            key={index}
            className={styles.bubbleChar}
            style={{
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      <div className={styles.bubbles}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={styles.bubble}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
