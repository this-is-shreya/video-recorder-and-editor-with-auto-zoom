import React, { useContext } from "react";
import styles from "./styles/transition1.module.css";
import AppContext from "../../AppContext";

const Transition1 = ({children}) => {
  const {isPlaying} = useContext(AppContext)

  return (
    <div
      className={`${styles["wave-transition-container"]} ${
        isPlaying ? styles.playing : styles.paused
      }`}
    >
      {["#e7008a", "#0099ff", "#000b76" ].map((color, index) => (
        <svg
          key={index}
          className={`${styles.wave} ${styles[`wave-${index + 1}`]}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={color}
            fillOpacity="1"
            d="M0,32L30,37.3C60,43,120,53,180,85.3C240,117,300,171,360,176C420,181,480,139,540,117.3C600,96,660,96,720,117.3C780,139,840,181,900,176C960,171,1020,117,1080,122.7C1140,128,1200,192,1260,186.7C1320,181,1380,107,1410,69.3L1440,32L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"
          ></path>
        </svg>
      ))}
      {children}
    </div>
  );
};

export default Transition1;
