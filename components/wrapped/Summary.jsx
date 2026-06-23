import React, { useRef, useState } from "react"
import { toPng } from "html-to-image"
import {
  DownloadSimple,
  ShareNetwork,
  ArrowCounterClockwise,
  LinkSimple,
  Check,
} from "@phosphor-icons/react"

import { useLang, pickMementoLine } from "../../lib/i18n"
import {
  calculateAge,
  lifeStats,
  lifeForecast,
  birthdayInsights,
  liveCounts,
  LIFE_EXPECTANCY_YEARS,
} from "../../lib/age"
import LiveNumber from "../LiveNumber"
import StoryPoster from "./StoryPoster"

// Build a shareable deep-link that re-opens this exact wrapped.
function shareUrl(birth) {
  const p = (n) => String(n).padStart(2, "0")
  const d = `${birth.getFullYear()}-${p(birth.getMonth() + 1)}-${p(birth.getDate())}`
  if (typeof window === "undefined") return ""
  return `${window.location.origin}${window.location.pathname}?d=${d}`
}

// The redesigned closing page: a live "still ticking" banner, a richly designed
// exportable poster, and share / download / restart actions.
const Summary = ({ birth, name = "", onRestart }) => {
  const { t, lang } = useLang()
  const posterRef = useRef(null)
  const storyRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const locale = lang === "tr" ? "tr-TR" : "en-US"
  const nf = (n) => n.toLocaleString(locale)
  const pctStr = (p) => (lang === "tr" ? `%${p}` : `${p}%`)

  const age = calculateAge(birth)
  const stats = lifeStats(birth)
  const forecast = lifeForecast(birth)
  const bday = birthdayInsights(birth)
  const line = pickMementoLine(lang, age.years)

  const toImage = (node) =>
    toPng(node, { pixelRatio: 2, cacheBust: true })

  const download = (dataUrl, name) => {
    const a = document.createElement("a")
    a.download = name
    a.href = dataUrl
    a.click()
  }

  const handleDownload = async () => {
    try {
      setBusy(true)
      download(await toImage(posterRef.current), "life-wrapped.png")
    } catch (e) {
      console.error("Export failed:", e)
    } finally {
      setBusy(false)
    }
  }

  // Share the tall 9:16 story image (falls back to download where unsupported).
  const handleShareStory = async () => {
    try {
      setBusy(true)
      const dataUrl = await toImage(storyRef.current)
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], "life-story.png", { type: "image/png" })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: t.shareTitle })
      } else {
        download(dataUrl, "life-story.png")
      }
    } catch (e) {
      console.error("Share failed:", e)
    } finally {
      setBusy(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(birth))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error("Copy failed:", e)
    }
  }

  const stat = [
    { v: nf(stats.days), l: t.r_days },
    { v: nf(stats.heartbeats), l: t.s_heart_unit },
    { v: nf(stats.fullMoons), l: t.r_moons },
    { v: nf(stats.tripsAroundSun), l: t.r_trips },
    { v: pctStr(Math.round(stats.lifePercent)), l: t.r_life },
    {
      v: forecast.outlived ? "∞" : nf(forecast.summersLeft),
      l: t.s_life_unit,
    },
  ]

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
        {name ? t.sum_title_named(name) : t.sum_title}
      </h2>

      {/* Live banner (on-screen only, not exported) */}
      <p className="text-sm font-medium text-white/75">
        <span className="font-display text-base font-bold text-white">
          <LiveNumber
            compute={() => liveCounts(birth).seconds}
            locale={locale}
            intervalMs={120}
          />
        </span>{" "}
        {lang === "tr" ? "saniyedir buradasın. Ve sayaç işliyor." : "seconds here, and counting."}
      </p>

      {/* Exportable poster */}
      <div
        ref={posterRef}
        className="relative w-full overflow-hidden rounded-3xl p-7 text-white"
        style={{
          background:
            "radial-gradient(130% 130% at 0% 0%, #b39bff 0%, #7c4dff 34%, #2a1860 78%, #150d2e 100%)",
        }}>
        <div className="flex items-center justify-between">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
            memento mori
          </p>
          <p className="text-[11px] font-medium text-white/60">
            {t.weekdays[bday.weekdayIndex]}
          </p>
        </div>

        {/* Hero age */}
        <div className="mt-7">
          {name ? (
            <p className="mb-1 font-display text-lg font-semibold text-white/90">
              {name}
            </p>
          ) : null}
          <p className="font-display text-[5rem] font-bold leading-none nums">
            {nf(age.years)}
          </p>
          <p className="mt-1 text-base font-medium text-white/80">
            {t.years} · {nf(age.months)} {t.months} · {nf(age.days)} {t.days}
          </p>
        </div>

        {/* Mini life-in-years grid (one cell per year of an 80-year life) */}
        <div className="mt-6">
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
            {Array.from({ length: LIFE_EXPECTANCY_YEARS }, (_, i) => (
              <span
                key={i}
                className={`aspect-square rounded-[1px] ${
                  i < age.years
                    ? "bg-white"
                    : i === age.years
                    ? "bg-white/90 ring-1 ring-white"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
            <span>{pctStr(Math.round(stats.lifePercent))}</span>
            <span>{LIFE_EXPECTANCY_YEARS} {t.years}</span>
          </div>
        </div>

        {/* Stat bento */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
          {stat.map((s, i) => (
            <div key={i}>
              <p className="font-display text-xl font-bold leading-none nums">
                {s.v}
              </p>
              <p className="mt-1 text-[11px] leading-tight text-white/65">
                {s.l}
              </p>
            </div>
          ))}
        </div>

        {/* Memento line */}
        <p className="mt-7 font-display text-base font-medium italic leading-snug text-white">
          {line}
        </p>

        {/* Humorous lifespan note */}
        <p className="mt-3 text-[11px] leading-snug text-white/60">
          {forecast.outlived
            ? t.s_life_outlived
            : t.s_life_sub(forecast.remainingDays, forecast.remainingWeeks)}
        </p>

        <p className="mt-5 border-t border-white/15 pt-4 text-[10px] tracking-wide text-white/50">
          {t.footer}
        </p>
      </div>

      <p className="text-xs text-white/55">{t.sum_save_hint}</p>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleShareStory}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-60">
            <ShareNetwork size={18} weight="bold" />
            {t.nav.shareStory}
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-60">
            <DownloadSimple size={18} weight="bold" />
            {t.nav.download}
          </button>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]">
          {copied ? <Check size={18} weight="bold" /> : <LinkSimple size={18} weight="bold" />}
          {copied ? t.nav.copied : t.nav.copyLink}
        </button>
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white">
        <ArrowCounterClockwise size={16} weight="bold" />
        {t.nav.restart}
      </button>

      {/* Hidden 9:16 poster, rendered off-screen for story sharing */}
      <div
        aria-hidden
        style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <StoryPoster ref={storyRef} birth={birth} name={name} />
      </div>
    </div>
  )
}

export default Summary
