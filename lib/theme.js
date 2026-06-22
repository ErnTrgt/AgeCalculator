import React, { createContext, useContext, useEffect, useState } from "react"

// Tiny theme controller: toggles the `dark` class on <html>, remembers the
// choice, and falls back to the OS preference on first visit.

const ThemeContext = createContext(null)
const STORAGE_KEY = "memento-theme"

export function ThemeProvider({ children }) {
  // Default to dark — it suits the memento-mori mood and avoids a light flash
  // for the common case. The real value is resolved on mount.
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const initial = saved || (prefersDark ? "dark" : "light")
    setTheme(initial)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
