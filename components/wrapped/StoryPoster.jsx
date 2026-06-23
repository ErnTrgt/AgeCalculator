import React, { forwardRef } from "react"

import { useLang, pickMementoLine } from "../../lib/i18n"
import {
  calculateAge,
  lifeStats,
  lifeForecast,
  birthdayInsights,
  LIFE_EXPECTANCY_YEARS,
} from "../../lib/age"

// A fixed-size 9:16 poster for sharing to Instagram / WhatsApp stories.
// Rendered off-screen and rasterised at 2x → 1080x1920. Layout is independent
// of the on-screen summary card so it reads well in a tall format.
const StoryPoster = forwardRef(({ birth, name = "" }, ref) => {
  const { t, lang } = useLang()
  const locale = lang === "tr" ? "tr-TR" : "en-US"
  const nf = (n) => n.toLocaleString(locale)
  const pctStr = (p) => (lang === "tr" ? `%${p}` : `${p}%`)

  const age = calculateAge(birth)
  const stats = lifeStats(birth)
  const forecast = lifeForecast(birth)
  const bday = birthdayInsights(birth)
  const line = pickMementoLine(lang, age.years)

  const row = [
    { v: nf(stats.days), l: t.r_days },
    { v: nf(stats.heartbeats), l: t.s_heart_unit },
    { v: pctStr(Math.round(stats.lifePercent)), l: t.r_life },
  ]

  return (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 960,
        background:
          "radial-gradient(130% 100% at 0% 0%, #b39bff 0%, #7c4dff 30%, #2a1860 72%, #150d2e 100%)",
      }}
      className="flex flex-col justify-between p-12 text-white">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
          memento mori
        </p>
        <p className="text-sm font-medium text-white/60">
          {t.weekdays[bday.weekdayIndex]}
        </p>
      </div>

      <div>
        {name ? (
          <p className="mb-2 font-display text-3xl font-semibold text-white/90">
            {name}
          </p>
        ) : null}
        <p className="font-display text-[9rem] font-bold leading-none nums">
          {nf(age.years)}
        </p>
        <p className="mt-2 text-2xl font-medium text-white/80">
          {t.years} · {nf(age.months)} {t.months} · {nf(age.days)} {t.days}
        </p>
      </div>

      {/* mini life-in-years grid */}
      <div
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
        {Array.from({ length: LIFE_EXPECTANCY_YEARS }, (_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-[2px] ${
              i < age.years
                ? "bg-white"
                : i === age.years
                ? "bg-white/90"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {row.map((s, i) => (
          <div key={i}>
            <p className="font-display text-3xl font-bold leading-none nums">
              {s.v}
            </p>
            <p className="mt-1.5 text-sm leading-tight text-white/65">{s.l}</p>
          </div>
        ))}
      </div>

      <p className="font-display text-2xl font-medium italic leading-snug text-white">
        {line}
      </p>

      <p className="text-sm leading-snug text-white/60">
        {forecast.outlived
          ? t.s_life_outlived
          : t.s_life_sub(forecast.remainingDays, forecast.remainingWeeks)}
      </p>

      <p className="border-t border-white/15 pt-5 text-xs tracking-wide text-white/50">
        {t.footer}
      </p>
    </div>
  )
})

StoryPoster.displayName = "StoryPoster"

export default StoryPoster
