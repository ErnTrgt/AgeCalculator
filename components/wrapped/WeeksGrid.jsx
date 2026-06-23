import React, { useState } from "react"

import { WEEKS_PER_YEAR, TOTAL_LIFE_WEEKS } from "../../lib/age"

// Decade ticks for the age axis (0, 10, ... 80).
const DECADES = [0, 10, 20, 30, 40, 50, 60, 70, 80]

// brand accent-soft (#a987ff) in rgb, reused for the lived-weeks gradient.
const ACCENT = "169,135,255"

// Lived weeks fade from a dim past into a bright present, so the grid reads as
// a glowing trail of time rather than a flat block. Future weeks get a faint
// decade banding so the eye can find "where am I" at a glance.
const cellStyle = (i, livedWeeks) => {
  if (i < livedWeeks) {
    const ratio = livedWeeks > 0 ? i / livedWeeks : 1 // 0 = birth, 1 = now
    const opacity = (0.4 + ratio * 0.6).toFixed(3)
    return { backgroundColor: `rgba(${ACCENT},${opacity})` }
  }
  // future: subtle horizontal bands, one tint per decade
  const year = Math.floor(i / WEEKS_PER_YEAR)
  const banded = Math.floor(year / 10) % 2 === 0
  return { backgroundColor: `rgba(255,255,255,${banded ? 0.07 : 0.12})` }
}

// ~4,160 squares, one per week of an 80-year life, with a decade age axis down
// the left. Pointer-driven tooltip via event delegation (one listener, not
// 4,160). Lived weeks glow from past to present; the current week pulses.
const WeeksGrid = ({ livedWeeks, t }) => {
  const [hover, setHover] = useState(null)

  const readCell = (e) => {
    const el = e.target.closest("[data-week]")
    if (!el) {
      setHover(null)
      return
    }
    const week = Number(el.dataset.week)
    const rect = e.currentTarget.getBoundingClientRect()
    setHover({
      week: week + 1,
      age: Math.floor(week / WEEKS_PER_YEAR),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="flex w-full gap-2">
      {/* Age axis */}
      <div className="flex flex-col justify-between py-px text-[9px] font-medium leading-none tabular-nums text-white/40 sm:text-[10px]">
        {DECADES.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Grid + tooltip */}
      <div
        className="relative flex-1"
        onPointerMove={readCell}
        onPointerDown={readCell}
        onPointerLeave={() => setHover(null)}>
        <div
          role="img"
          aria-label={t.s_weeks_caption(Math.min(livedWeeks, TOTAL_LIFE_WEEKS))}
          className="grid gap-[2px] sm:gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`,
          }}>
          {Array.from({ length: TOTAL_LIFE_WEEKS }, (_, i) => {
            const isNow = i === livedWeeks
            return (
              <span
                key={i}
                data-week={i}
                style={isNow ? undefined : cellStyle(i, livedWeeks)}
                className={`aspect-square rounded-[1px] transition-colors ${
                  isNow
                    ? "z-10 animate-now-pulse bg-white ring-1 ring-white"
                    : ""
                }`}
              />
            )
          })}
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-lg"
            style={{ left: hover.x, top: hover.y }}>
            {t.s_weeks_tooltip(hover.week, hover.age)}
          </div>
        )}
      </div>
    </div>
  )
}

export default WeeksGrid
