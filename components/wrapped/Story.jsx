import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  X,
  CaretLeft,
  CaretRight,
  Translate,
  Play,
  Pause,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
} from "@phosphor-icons/react"

import { useLang } from "../../lib/i18n"
import {
  calculateAge,
  lifeStats,
  birthdayInsights,
  liveCounts,
  lifeForecast,
  TOTAL_LIFE_WEEKS,
} from "../../lib/age"
import { peopleAroundAge, birthsOnDay } from "../../lib/world"
import { lifeMilestones } from "../../lib/milestones"
import { useSound } from "../../lib/sfx"
import AnimatedNumber from "../AnimatedNumber"
import LiveNumber from "../LiveNumber"
import WeeksGrid from "./WeeksGrid"
import Summary from "./Summary"

// Autoplay + segment progress driven by one rAF loop. Pause is read from a ref
// so toggling it never restarts the loop (which would reset the progress bar).
function useAutoplay(index, count, durations, paused, onAdvance) {
  const [progress, setProgress] = useState(0)
  const reduce = useReducedMotion()
  const pausedRef = useRef(paused)
  const advanceRef = useRef(onAdvance)
  pausedRef.current = paused
  advanceRef.current = onAdvance

  useEffect(() => {
    setProgress(0)
    if (reduce || index >= count - 1) return // last slide never auto-advances
    let raf
    let last = null
    let elapsed = 0
    const dur = durations[index] || 6500
    const tick = (now) => {
      if (last === null) last = now
      const dt = now - last
      last = now
      if (!pausedRef.current) {
        elapsed += dt
        const p = Math.min(elapsed / dur, 1)
        setProgress(p)
        if (p >= 1) {
          advanceRef.current()
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [index, count, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  return progress
}

const Story = ({ birth, onRestart }) => {
  const { t, lang, toggle: toggleLang } = useLang()
  const { enabled: soundOn, toggle: toggleSound, blip } = useSound()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [holdPaused, setHoldPaused] = useState(false) // press-and-hold
  const [manualPaused, setManualPaused] = useState(false) // pause button
  const paused = holdPaused || manualPaused

  const locale = lang === "tr" ? "tr-TR" : "en-US"
  const age = useMemo(() => calculateAge(birth), [birth])
  const stats = useMemo(() => lifeStats(birth), [birth])
  const bday = useMemo(() => birthdayInsights(birth), [birth])
  const forecast = useMemo(() => lifeForecast(birth), [birth])

  const slides = useMemo(
    () =>
      buildSlides({ t, lang, locale, age, stats, bday, forecast, birth, onRestart }),
    [t, lang, locale, age, stats, bday, forecast, birth, onRestart]
  )
  const count = slides.length

  // Play a soft blip on each slide change (skip the first mount).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    blip(index === count - 1 ? 660 : 480)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const advance = () => setIndex((i) => Math.min(i + 1, count - 1))
  const back = () => setIndex((i) => Math.max(i - 1, 0))

  const progress = useAutoplay(
    index,
    count,
    slides.map((s) => s.duration),
    paused,
    advance
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") advance()
      else if (e.key === "ArrowLeft") back()
      else if (e.key === " ") {
        e.preventDefault()
        setManualPaused((p) => !p)
      } else if (e.key === "Escape") onRestart()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  const current = slides[index]
  const isLast = index === count - 1

  const variants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 1.04 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
      }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden text-white"
      onPointerDown={() => setHoldPaused(true)}
      onPointerUp={() => setHoldPaused(false)}
      onPointerCancel={() => setHoldPaused(false)}>
      {/* Background mood, crossfading per slide */}
      <AnimatePresence>
        <motion.div
          key={index}
          className="absolute inset-0"
          style={{ background: current.bg }}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/10" />

      {/* Full-screen tap-to-advance (sits under content) */}
      {!isLast && (
        <button
          aria-label={t.nav.next}
          onClick={advance}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}
      {/* Left edge tap-to-go-back */}
      {index > 0 && (
        <button
          aria-label={t.nav.prev}
          onClick={back}
          className="absolute inset-y-0 left-0 z-20 w-1/4"
        />
      )}

      {/* Segmented progress */}
      <div className="absolute inset-x-0 top-0 z-40 flex gap-1.5 p-3 sm:p-4">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width:
                  i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Top controls */}
      <div className="absolute right-3 top-6 z-40 flex items-center gap-2 sm:right-4 sm:top-8">
        {!isLast && (
          <button
            onClick={() => setManualPaused((p) => !p)}
            aria-label={manualPaused ? t.nav.play : t.nav.pause}
            title={manualPaused ? t.nav.play : t.nav.pause}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20">
            {manualPaused ? (
              <Play size={15} weight="fill" />
            ) : (
              <Pause size={15} weight="fill" />
            )}
          </button>
        )}
        <button
          onClick={toggleSound}
          aria-label={soundOn ? t.nav.soundOff : t.nav.soundOn}
          title={soundOn ? t.nav.soundOff : t.nav.soundOn}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20">
          {soundOn ? (
            <SpeakerSimpleHigh size={15} weight="fill" />
          ) : (
            <SpeakerSimpleSlash size={15} weight="fill" />
          )}
        </button>
        <button
          onClick={toggleLang}
          aria-label="Change language"
          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur transition-colors hover:bg-white/20">
          <Translate size={14} weight="bold" />
          {t.langLabel}
        </button>
        <button
          onClick={onRestart}
          aria-label={t.nav.close}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20">
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: reduce ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}>
          {current.content}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between p-5 sm:p-7">
        <button
          onClick={back}
          disabled={index === 0}
          aria-label={t.nav.prev}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-all hover:bg-white/20 disabled:opacity-0">
          <CaretLeft size={20} weight="bold" />
        </button>
        <span className="text-xs font-medium tracking-widest text-white/50">
          {index + 1} / {count}
        </span>
        <button
          onClick={advance}
          disabled={isLast}
          aria-label={t.nav.next}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-all hover:bg-white/20 disabled:opacity-0">
          <CaretRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}

// --- Slide layout helpers --------------------------------------------------

const Lead = ({ children }) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.15 }}
    className="mb-5 max-w-md text-sm font-medium uppercase tracking-[0.2em] text-white/70 sm:text-base">
    {children}
  </motion.p>
)

const Caption = ({ children }) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="mt-7 max-w-sm text-base font-medium leading-relaxed text-white/85 sm:text-lg">
    {children}
  </motion.p>
)

const Shell = ({ children }) => (
  <div className="h-full w-full overflow-y-auto">
    <div className="flex min-h-full w-full flex-col items-center justify-center px-6 py-20 text-center sm:px-8">
      {children}
    </div>
  </div>
)

const Legend = ({ className, label }) => (
  <li className="flex items-center gap-2">
    <span className={`h-3 w-3 rounded-[2px] ${className}`} />
    {label}
  </li>
)

const MilestoneRow = ({ label, date, tag }) => (
  <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left backdrop-blur">
    <div>
      <p className="font-display text-base font-bold text-white">{label}</p>
      <p className="text-xs text-white/60">{date}</p>
    </div>
    <span className="ml-3 shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
      {tag}
    </span>
  </div>
)

// Big figure sized to fit very large live numbers on one line.
const liveBig =
  "font-display font-bold text-white whitespace-nowrap leading-none text-[clamp(1.75rem,8.5vw,4.5rem)]"

// --- Slide definitions -----------------------------------------------------

function buildSlides({ t, lang, locale, age, stats, bday, forecast, birth, onRestart }) {
  const num = (v, duration) => (
    <AnimatedNumber value={v} locale={locale} duration={duration} />
  )
  const pct = Math.round(stats.lifePercent)
  const people = peopleAroundAge(age.years)
  const births = birthsOnDay(birth.getFullYear())
  const miles = lifeMilestones(birth)
  const fmtDate = (d) =>
    d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })

  return [
    {
      key: "age",
      duration: 7000,
      bg: "radial-gradient(125% 125% at 50% 0%, #a987ff 0%, #6b3df0 42%, #261452 100%)",
      content: (
        <Shell>
          <Lead>{t.s_age_lead}</Lead>
          <div className="font-display font-bold leading-[0.95]">
            <p className="text-big">
              <span className="text-white">{num(age.years, 1100)}</span>{" "}
              <span className="text-2xl font-medium text-white/70 sm:text-4xl">
                {t.years}
              </span>
            </p>
            <p className="text-big">
              <span className="text-white">{num(age.months, 700)}</span>{" "}
              <span className="text-2xl font-medium text-white/70 sm:text-4xl">
                {t.months}
              </span>
            </p>
            <p className="text-big">
              <span className="text-white">{num(age.days, 800)}</span>{" "}
              <span className="text-2xl font-medium text-white/70 sm:text-4xl">
                {t.days}
              </span>
            </p>
          </div>
          <Caption>{t.s_age_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "seconds",
      duration: 6500,
      bg: "radial-gradient(125% 125% at 50% 0%, #38bdf8 0%, #0369a1 42%, #082035 100%)",
      content: (
        <Shell>
          <Lead>{t.s_seconds_lead}</Lead>
          <p className={liveBig}>
            <LiveNumber
              compute={() => liveCounts(birth).seconds}
              locale={locale}
              intervalMs={120}
            />
          </p>
          <p className="mt-3 font-display text-xl font-medium text-white/70 sm:text-2xl">
            {t.s_seconds_unit}
          </p>
          <Caption>{t.s_seconds_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "days",
      duration: 6500,
      bg: "radial-gradient(125% 125% at 50% 0%, #2dd4bf 0%, #0d7d72 42%, #06302c 100%)",
      content: (
        <Shell>
          <Lead>{t.s_days_lead}</Lead>
          <p className="font-display text-mega font-bold text-white">
            {num(stats.days, 1500)}
          </p>
          <p className="mt-2 font-display text-xl font-medium text-white/70 sm:text-2xl">
            {t.s_days_unit}
          </p>
          <Caption>{t.s_days_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "heart",
      duration: 7000,
      bg: "radial-gradient(125% 125% at 50% 0%, #fb7185 0%, #be123c 42%, #4c0519 100%)",
      content: (
        <Shell>
          <Lead>{t.s_heart_lead}</Lead>
          <p className={liveBig}>
            <LiveNumber
              compute={() => liveCounts(birth).heartbeats}
              locale={locale}
              intervalMs={150}
            />
          </p>
          <p className="mt-2 font-display text-lg font-medium text-white/70 sm:text-xl">
            {t.s_heart_unit}
          </p>
          <div className="mt-6 text-white/80">
            <span className="font-display text-2xl font-bold sm:text-3xl">
              <LiveNumber
                compute={() => liveCounts(birth).breaths}
                locale={locale}
                intervalMs={300}
              />
            </span>{" "}
            <span className="text-sm font-medium text-white/60">
              {t.s_breath_unit}
            </span>
          </div>
          <Caption>{t.s_heart_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "cosmic",
      duration: 7000,
      bg: "radial-gradient(125% 125% at 50% 8%, #818cf8 0%, #3730a3 42%, #0b1026 100%)",
      content: (
        <Shell>
          <Lead>{t.s_cosmic_lead}</Lead>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="font-display text-huge font-bold text-white">
                {num(stats.fullMoons, 1300)}
              </p>
              <p className="mt-1 text-base font-medium text-white/70">
                {t.s_moons}
              </p>
            </div>
            <div>
              <p className="font-display text-huge font-bold text-white">
                {num(stats.tripsAroundSun, 1300)}
              </p>
              <p className="mt-1 text-base font-medium text-white/70">
                {t.s_trips}
              </p>
            </div>
          </div>
          <Caption>{t.s_cosmic_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "people",
      duration: 7000,
      bg: "radial-gradient(125% 125% at 50% 0%, #34d399 0%, #047857 42%, #052e22 100%)",
      content: (
        <Shell>
          <Lead>{t.s_people_lead}</Lead>
          <p className="font-display text-mega font-bold text-white">
            {num(people, 1600)}
          </p>
          <p className="mt-2 font-display text-xl font-medium text-white/70 sm:text-2xl">
            {t.s_people_unit}
          </p>
          <Caption>{t.s_people_caption}</Caption>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            {t.s_people_births(births)}
          </p>
        </Shell>
      ),
    },
    {
      key: "born",
      duration: 7000,
      bg: "radial-gradient(125% 125% at 50% 0%, #fbbf24 0%, #d97706 42%, #4a2503 100%)",
      content: (
        <Shell>
          <Lead>{t.s_born_lead}</Lead>
          <p className="font-display text-huge font-bold text-white">
            {t.weekdays[bday.weekdayIndex]}
          </p>
          {t.s_born_day_suffix ? (
            <p className="mt-2 font-display text-xl font-medium text-white/70 sm:text-2xl">
              {t.s_born_day_suffix}
            </p>
          ) : null}
          <Caption>
            {bday.isBirthdayToday
              ? t.s_born_today
              : t.s_born_next(bday.daysToNextBirthday)}
          </Caption>
        </Shell>
      ),
    },
    {
      key: "weeks",
      duration: 11000,
      bg: "radial-gradient(140% 120% at 50% -10%, #211c30 0%, #15121d 45%, #0b0a0f 100%)",
      content: (
        <Shell>
          <div className="flex w-full max-w-4xl flex-col items-center gap-9 text-center md:flex-row md:items-center md:gap-12 md:text-left">
            {/* Left: narrative, progress, legend */}
            <div className="w-full md:flex-1">
              <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {t.s_weeks_title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base md:mx-0">
                {t.s_weeks_caption(stats.weeksLived)}
              </p>

              <div className="mt-7 flex items-baseline justify-center gap-3 md:justify-start">
                <span className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {t.w_of(stats.weeksLived, TOTAL_LIFE_WEEKS)}
                </span>
                <span className="font-display text-sm font-bold text-accent-soft">
                  {lang === "tr" ? `%${pct}` : `${pct}%`}
                </span>
              </div>
              <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10 md:mx-0">
                <motion.div
                  className="h-full rounded-full bg-accent-soft"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.lifePercent}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/65 md:justify-start">
                <Legend className="bg-accent-soft" label={t.w_lived} />
                <Legend className="bg-white ring-1 ring-white" label={t.w_now} />
                <Legend className="bg-white/[0.13]" label={t.w_left} />
              </ul>

              <p className="mt-7 hidden text-xs uppercase tracking-[0.2em] text-white/40 md:block">
                {t.s_weeks_hint}
              </p>
            </div>

            {/* Right: framed grid */}
            <div
              className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl sm:p-5"
              style={{ width: "min(82vw, 19rem)" }}>
              <WeeksGrid livedWeeks={stats.weeksLived} t={t} />
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-white/40 md:hidden">
              {t.s_weeks_hint}
            </p>
          </div>
        </Shell>
      ),
    },
    {
      key: "percent",
      duration: 6500,
      bg: "radial-gradient(125% 125% at 50% 0%, #c084fc 0%, #7c3aed 42%, #2a1452 100%)",
      content: (
        <Shell>
          <Lead>{t.s_percent_lead}</Lead>
          <p className="font-display text-mega font-bold text-white">
            {lang === "tr" ? <>%{num(pct, 1400)}</> : <>{num(pct, 1400)}%</>}
          </p>
          <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${stats.lifePercent}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <Caption>{t.s_percent_caption}</Caption>
        </Shell>
      ),
    },
    {
      key: "milestones",
      duration: 9000,
      bg: "radial-gradient(125% 125% at 50% 0%, #f472b6 0%, #be185d 42%, #45082c 100%)",
      content: (
        <Shell>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {t.s_miles_title}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/70 sm:text-base">
            {t.s_miles_caption}
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <MilestoneRow
              label={t.m_ten_thousand}
              date={fmtDate(miles.tenThousandDays.date)}
              tag={miles.tenThousandDays.passed ? t.m_done : t.m_soon}
            />
            <MilestoneRow
              label={t.m_billion(miles.nextBillionSeconds.billions)}
              date={fmtDate(miles.nextBillionSeconds.date)}
              tag={t.m_soon}
            />
            <MilestoneRow
              label={t.m_next_round(miles.nextRoundDay.count)}
              date={fmtDate(miles.nextRoundDay.date)}
              tag={t.m_soon}
            />
            <MilestoneRow
              label={t.m_decade(miles.nextDecadeBirthday.age)}
              date={fmtDate(miles.nextDecadeBirthday.date)}
              tag={t.m_soon}
            />
          </div>
        </Shell>
      ),
    },
    {
      key: "lifespan",
      duration: 7500,
      bg: "radial-gradient(125% 125% at 50% 0%, #fb923c 0%, #c2410c 42%, #3b1206 100%)",
      content: (
        <Shell>
          {forecast.outlived ? (
            <>
              <p className="font-display text-huge font-bold text-white">∞</p>
              <Caption>{t.s_life_outlived}</Caption>
            </>
          ) : (
            <>
              <Lead>{t.s_life_lead}</Lead>
              <p className="font-display text-mega font-bold text-white">
                {num(forecast.summersLeft, 1300)}
              </p>
              <p className="mt-2 font-display text-xl font-medium text-white/70 sm:text-2xl">
                {t.s_life_unit}
              </p>
              <Caption>{t.s_life_caption}</Caption>
              <p className="mt-3 max-w-sm text-sm text-white/60">
                {t.s_life_sub(forecast.remainingDays, forecast.remainingWeeks)}
              </p>
            </>
          )}
        </Shell>
      ),
    },
    {
      key: "final",
      duration: 99999,
      bg: "radial-gradient(125% 125% at 0% 0%, #a987ff 0%, #5b2bd6 38%, #150d2e 100%)",
      content: (
        <div className="pointer-events-auto h-full w-full overflow-y-auto">
          <div className="flex min-h-full w-full flex-col items-center justify-center px-5 py-20 text-center">
            <Summary birth={birth} onRestart={onRestart} />
          </div>
        </div>
      ),
    },
  ]
}

export default Story
