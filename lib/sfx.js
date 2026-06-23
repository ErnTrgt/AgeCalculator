import React, { createContext, useContext, useEffect, useRef, useState } from "react"

// Optional sound + haptics, ON by default (a returning user's saved choice
// still wins). Web Audio is created lazily on the first user gesture (browsers
// block autoplay audio), and a short synthesised blip avoids shipping any audio
// assets. Haptics via navigator.vibrate where supported (Android/Chrome; iOS
// Safari ignores it).

const SoundContext = createContext(null)
const STORAGE_KEY = "memento-sound"

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true)
  const ctxRef = useRef(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) setEnabled(saved === "on")
  }, [])

  const ensureCtx = () => {
    if (!ctxRef.current && typeof window !== "undefined") {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) ctxRef.current = new AC()
    }
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume()
    return ctxRef.current
  }

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off")
      if (next) ensureCtx()
      return next
    })
  }

  // A soft sine blip. `freq` lets callers vary the tone (e.g. higher on finish).
  const blip = (freq = 480, duration = 0.07) => {
    if (!enabled) return
    const ac = ensureCtx()
    if (ac) {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      const t0 = ac.currentTime
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(t0)
      osc.stop(t0 + duration)
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8)
    }
  }

  return (
    <SoundContext.Provider value={{ enabled, toggle, blip }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error("useSound must be used within SoundProvider")
  return ctx
}
