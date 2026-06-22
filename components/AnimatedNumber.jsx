import React, { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

// Counts from 0 up to `value` with requestAnimationFrame. Handles a target of 0
// correctly (just shows 0, never divides by zero) and honours reduced motion.
const AnimatedNumber = ({ value, duration = 1100, locale = "en-US" }) => {
  const [display, setDisplay] = useState(0)
  const frame = useRef()
  const reduce = useReducedMotion()

  useEffect(() => {
    const target = Number(value) || 0
    if (reduce || target === 0) {
      setDisplay(target)
      return
    }

    let startTime
    const step = (now) => {
      if (startTime === undefined) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(Math.round(eased * target))
      if (progress < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration, reduce])

  return <span className="nums">{display.toLocaleString(locale)}</span>
}

export default AnimatedNumber
