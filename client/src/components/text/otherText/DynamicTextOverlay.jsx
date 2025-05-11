import React, { useState, useEffect } from "react";
import styles from "./styles/DynamicTextOverlay.module.css"; // Import the separate CSS file

const DynamicTextOverlay = ({
  text,
  duration = 5000,
  backgroundType = "sun",
  trackNum,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Returns SVG based on background type
  const getBackground = () => {
    if (backgroundType === "moon") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M50,10 A40,40 0 1 0 50,90 A40,40 0 1 0 50,10 Z M60,20 A30,30 0 1 1 60,80 A30,30 0 1 1 60,20 Z"
            fill="#E0E0E0"
          />
        </svg>
      );
    } else if (backgroundType === "sun") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#FFD700" />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="0"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="90"
            y1="50"
            x2="100"
            y2="50"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="10"
            y1="50"
            x2="0"
            y2="50"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="90"
            x2="50"
            y2="100"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="78"
            y1="22"
            x2="85"
            y2="15"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="22"
            y1="22"
            x2="15"
            y2="15"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="78"
            y1="78"
            x2="85"
            y2="85"
            stroke="#FFD700"
            strokeWidth="3"
          />
          <line
            x1="22"
            y1="78"
            x2="15"
            y2="85"
            stroke="#FFD700"
            strokeWidth="3"
          />
        </svg>
      );
    } else if (backgroundType === "cloud") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
          <path
            d="M20,40 C10,30 10,20 25,20 C35,10 55,10 65,20 C80,20 80,30 70,40 C90,40 90,10 50,10 C10,10 10,40 20,40 Z"
            fill="#E0E0E0"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    isVisible && (
      <div
        className={styles["text-overlay-container"]}
        style={{ zIndex: trackNum }}
      >
        <div className={styles["background"]}>{getBackground()}</div>
        <span className={styles["overlay-text"]}>{text}</span>
      </div>
    )
  );
};

export default DynamicTextOverlay;
