"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import styles from "./styles/TitleCard1.module.css"

export default function TitleCard1({
  text = "Sample text",
  duration = 3,
  delay = 0.2,
  fontSize = "5rem",
  color = "#ffffff",
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ""

    // Create wrapper for 3D perspective
    const wrapper = document.createElement("div")
    wrapper.className = styles.wrapper
    containerRef.current.appendChild(wrapper)

    // Split text into individual characters
    const chars = text.split("")

    // Create elements for each character
    chars.forEach((char, index) => {
      const charEl = document.createElement("div")
      charEl.className = styles.char
      charEl.innerHTML = char === " " ? "&nbsp;" : char
      charEl.style.color = color
      charEl.style.fontSize = fontSize
      wrapper.appendChild(charEl)

      // Set initial state
      gsap.set(charEl, {
        opacity: 0,
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 1000,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
      })

      // Animate each character
      gsap.to(charEl, {
        opacity: 1,
        x: 0,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: duration,
        delay: delay + index * 0.05,
        ease: "elastic.out(1, 0.3)",
      })
    })

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [text, duration, delay, fontSize, color])

  return <div ref={containerRef} className={styles.container}></div>
}
