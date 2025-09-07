"use client"
import { useEffect, useState } from "react"
import styles from "./styles/typing-text.module.css"

export default function TypingText({ text, typingSpeed = 100, loop = false, delayAfterTyping = 2000, trackNum }) {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let timeout;
    typingSpeed = 3000 / text.length
    if (isTyping) {
      if (currentIndex < text.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + text[currentIndex])
          setCurrentIndex((prev) => prev + 1)
        }, typingSpeed)
      } else {
        setIsTyping(false)
        if (loop) {
          timeout = setTimeout(() => {
            setDisplayText("")
            setCurrentIndex(0)
            setIsTyping(true)
          }, delayAfterTyping)
        }
      }
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, isTyping, text, typingSpeed, loop, delayAfterTyping])

  return (
    <div className={styles.container} style={{zIndex:trackNum}}>
      <span className={styles.text}>{displayText}</span>
      <span className={styles.cursor}></span>
    </div>
  )
}
