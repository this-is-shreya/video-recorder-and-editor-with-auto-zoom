import React, { useEffect } from "react";
import baffle from "baffle"
import styles from "./styles/TitleCard3.module.css"; // Import the CSS file

const TitleCard3 = () => {
  useEffect(() => {
    const text = baffle(".data");
    text.set({
      characters: "░▒░ ░██░> ████▓ >█> ░/█>█ ██░░ █<▒ ▓██░ ░/░▒",
      speed: 120,
    });

    text.start();
    text.reveal(4000); // Reveal after 4 seconds
  }, []); // Run only once on mount

  return (
    <div className={styles.container}>
      <div className={styles.data}>IAMHARSH-WEB DEVELOPER</div>
    </div>
  );
};

export default TitleCard3;
