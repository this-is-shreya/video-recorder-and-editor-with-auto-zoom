"use client"
import { useEffect, useState } from "react"
import styles from "./styles/TitleCard4.module.css"

/**
 * @typedef {Object} GlitchEffectProps
 * @property {string} channelName
 * @property {string} tagline
 */

export default function TitleCard4({ text, trackNum }) {
  const [isVisible, setIsVisible] = useState(false)
  const [channelName, tagline] = text.split(" ")
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
      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <div className={styles.scanlines}></div>

        <div className={styles.textContainer}>
          <h1 className={styles.title} data-text={channelName}>
            {channelName}
          </h1>
          <div className={styles.glitchWrapper}>
            <p className={styles.tagline} data-text={tagline}>
              {tagline}
            </p>
          </div>
        </div>

        <div className={styles.noise}></div>
      </div>
    </div>
  )
}
