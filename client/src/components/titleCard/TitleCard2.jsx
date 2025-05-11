"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./styles/TitleCard2.module.css";

const terminalLines = [
  "Initializing core modules...",
  "Connecting to API...",
  "Deploying shaders...",
  "Compiling components...",
  "🔥 Launching App...",
];

export default function TitleCard2({ fontSize = "1.5rem", duration = 3, text="Sample text" }) {
  const lineRefs = useRef([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      lineRefs.current,
      {
        opacity: 0,
        x: -20,
      },
      {
        opacity: 1,
        x: 0,
        ease: "power2.out",
        stagger: 0.3,
        onComplete: () => setDone(true),
      }
    );
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        {terminalLines.map((line, i) => (
          <p
            key={i}
            ref={(el) => (lineRefs.current[i] = el)}
            className={styles.line}
            style={{ fontSize }}
          >
            {line}
          </p>
        ))}
        {done && (
          <h1 className={styles.title}>
            <span>{text}</span> ▌
          </h1>
        )}
      </div>
    </div>
  );
}
