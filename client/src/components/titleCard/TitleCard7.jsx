"use client"
import { useEffect, useState } from "react"
import styles from "./styles/TitleCard7.module.css"


export default function TitleCard7({ text }) {
  const [channelName, tagline] = text.split(" ")
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsPlaying(true)

    // Reset animation after it completes
    const timer = setTimeout(() => {
      setIsPlaying(false)
      setTimeout(() => setIsPlaying(true), 100)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.container}>
      <div className={`${styles.zoomContainer} ${isPlaying ? styles.play : ""}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>

        <div className={styles.contentWrapper}>
          <div className={styles.content}>
            <h1 className={styles.title}>{channelName}</h1>
            <p className={styles.tagline}>{tagline}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
