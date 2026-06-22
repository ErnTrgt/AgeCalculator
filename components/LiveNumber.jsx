import React, { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

// A number that counts up from 0 on mount, then keeps ticking live off its own
// interval. Isolated so it re-renders only itself, never the parent story.
// `compute` returns the current target value each time it's called.
const LiveNumber = ({ compute, locale = "en-US", countUpMs = 1400, intervalMs = 200 }) => {
  const [val, setVal] = useState(0)
  const reduce = useReducedMotion()
  const raf = useRef()
  const timer = useRef()

  useEffect(() => {
    const startLive = () => {
      timer.current = setInterval(() => setVal(compute()), intervalMs)
    }

    if (reduce) {
      setVal(compute())
      startLive()
    } else {
      let start
      const step = (now) => {
        if (start === undefined) start = now
        const p = Math.min((now - start) / countUpMs, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(eased * compute()))
        if (p < 1) raf.current = requestAnimationFrame(step)
        else startLive()
      }
      raf.current = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(raf.current)
      clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <span className="nums">{val.toLocaleString(locale)}</span>
}

export default LiveNumber
