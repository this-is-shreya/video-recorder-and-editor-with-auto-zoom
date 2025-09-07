"use client"
import { useEffect, useState } from "react"
import styles from "./styles/TitleCard5.module.css"


export default function TitleCard5({ text, trackNum }) {
  const [channelName, tagline] = text.split(" ")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // Reset animation after it completes
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => setIsVisible(true), 100)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.container} style={{zIndex:trackNum}}>
      <div className={styles.background}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.floatingShape}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <div className={styles.line} />
        <h1 className={styles.title}>{channelName}</h1>
        <p className={styles.tagline}>{tagline}</p>
        <div className={styles.line} />
      </div>
    </div>
  )
}
