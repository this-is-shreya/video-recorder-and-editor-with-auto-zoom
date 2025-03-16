import React, { useState, useEffect, useContext } from "react";
import styles from "./styles/Timer.module.css";
import AppContext from "../../AppContext";

const Timer = ({ text = 600, countdown = true, trackNum }) => {
  const {isPlaying} = useContext(AppContext)

  if (isNaN(Number(text))) {
    text = 600;
  }
  const [timeLeft, setTimeLeft] = useState(countdown ? text : 0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (!isRunning && isPlaying) {
      setIsRunning(true);
    }
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) =>
          countdown ? Math.max(0, prevTime - 1) : prevTime + 1
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, countdown]);

  useEffect(()=>{
    if(!isPlaying){
      setIsRunning(false)
    }
  },[isPlaying])
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={styles["timer"]} style={{ zIndex: trackNum }}>
      <div className={styles["timer-display"]}>{formatTime(timeLeft)}</div>
    </div>
  );
};

export default Timer;
