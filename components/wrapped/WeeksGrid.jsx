import React, { useState } from "react"

import { WEEKS_PER_YEAR, TOTAL_LIFE_WEEKS } from "../../lib/age"

// Decade ticks for the age axis (0, 10, ... 80).
const DECADES = [0, 10, 20, 30, 40, 50, 60, 70, 80]

// ~4,160 squares, one per week of an 80-year life, with a decade age axis down
// the left. Pointer-driven tooltip via event delegation (one listener, not
// 4,160). Lived weeks glow; the current week is marked white; the rest wait.
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
            const lived = i < livedWeeks
            const isNow = i === livedWeeks
            return (
              <span
                key={i}
                data-week={i}
                className={`aspect-square rounded-[1px] transition-colors ${
                  isNow
                    ? "bg-white ring-1 ring-white"
                    : lived
                    ? "bg-accent-soft"
                    : "bg-white/[0.13]"
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
