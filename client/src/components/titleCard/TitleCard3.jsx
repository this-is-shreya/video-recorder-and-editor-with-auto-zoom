import React, { useEffect, useRef } from "react";
import baffle from "baffle"
import styles from "./styles/TitleCard3.module.css"; // Import the CSS file

const TitleCard3 = ({
  text,
  fontStyle = "Arial",
  fontSize = "14",
  color = "black",
  bgColor = "white",
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const text = baffle(textRef.current);
    text.set({
      characters: "░▒░ ░██░> ████▓ >█> ░/█>█ ██░░ █<▒ ▓██░ ░/░▒",
      speed: 120,
    });

    text.start();
    text.reveal(4000); // Reveal after 4 seconds
  }, [text]);

  return (
    <div
      className={styles.container}
      style={{
        fontFamily: fontStyle,
        fontSize: fontSize + "px",
        backgroundColor: bgColor,
      }}
    >
      <div ref={textRef} className={`${styles.data}`} style={{ color: color }}>
        {text}
      </div>
    </div>
  );
};

export default TitleCard3;
