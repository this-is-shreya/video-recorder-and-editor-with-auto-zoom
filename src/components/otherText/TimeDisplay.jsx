import React, { useState, useEffect } from "react";
import styles from "./styles/TimeDisplay.module.css";

const TimeDisplay = ({trackNum}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles["time-display"]} style={{ zIndex: trackNum }}>
      <span className={styles["time-text"]}>{formatTime(time)}</span>
    </div>
  );
};

export default TimeDisplay;
