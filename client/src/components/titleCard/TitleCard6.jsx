"use client"
import { useEffect, useState } from "react"
import styles from "./styles/TitleCard6.module.css"


export default function TitleCard6({ text }) {
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
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <div className={styles.grid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={styles.gridLine} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        <div className={styles.textContainer}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>{channelName}</h1>
          </div>
          <div className={styles.taglineWrapper}>
            <p className={styles.tagline}>{tagline}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
