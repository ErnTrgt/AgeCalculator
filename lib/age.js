// Pure, dependency-free date + "memento mori" math.
// Everything here takes plain values and returns plain values so it stays
// easy to reason about and to test.

// A single place to tune the lifespan assumptions used by the reflective parts
// of the UI. Kept deliberately conservative (a long, lucky life).
export const LIFE_EXPECTANCY_YEARS = 80
export const WEEKS_PER_YEAR = 52
export const TOTAL_LIFE_WEEKS = LIFE_EXPECTANCY_YEARS * WEEKS_PER_YEAR // 4160

const MS_PER_DAY = 1000 * 60 * 60 * 24
const LUNAR_CYCLE_DAYS = 29.530588 // synodic month
const AVG_HEARTBEATS_PER_MIN = 72
const AVG_BREATHS_PER_MIN = 16

/**
 * Build a local Date from y/m/d where month is 1-based (1 = January).
 * Returns null when the components do not form a real calendar date
 * (e.g. 31 February, or 29 Feb on a non-leap year).
 */
export function makeDate(year, month, day) {
  // month here is 1-based; Date wants 0-based.
  const d = new Date(year, month - 1, day)
  if (
    d.getFullYear() !== Number(year) ||
    d.getMonth() !== Number(month) - 1 ||
    d.getDate() !== Number(day)
  ) {
    return null
  }
  return d
}

/**
 * True when `date` is strictly after `now` (down to the day).
 * This is the real "is it in the future" check the old version was missing:
 * the previous code only rejected years greater than the current year, so a
 * later month/day within the current year slipped through.
 */
export function isFuture(date, now = new Date()) {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return a.getTime() > b.getTime()
}

/**
 * Calendar-correct years / months / days between two dates (start <= end).
 *
 * When the day component goes negative we measure from the most recent monthly
 * "anniversary" before `end`, clamped to that month's real length. This avoids
 * the classic bug where a 31st-of-the-month start borrowed from a short month
 * (e.g. February) and produced a negative day count: born Jan 31, on Mar 1,
 * reads as 1 month 1 day (Jan 31 → Feb 29 → Mar 1), never -1 days.
 */
export function calculateAge(start, end = new Date()) {
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months--
    // The month immediately before `end` (handles January wrapping to December).
    const y = end.getFullYear()
    const m = end.getMonth() - 1
    const lastDayOfThatMonth = new Date(y, m + 1, 0).getDate()
    const anchorDay = Math.min(start.getDate(), lastDayOfThatMonth)
    const anchor = new Date(y, m, anchorDay)
    days = Math.round((end.getTime() - anchor.getTime()) / MS_PER_DAY)
  }

  if (months < 0) {
    years--
    months += 12
  }

  return { years, months, days }
}

/**
 * Reflective statistics derived from a birth date. All values are floored to
 * whole numbers where a fraction would read oddly ("3.7 full moons").
 */
export function lifeStats(birth, now = new Date()) {
  const totalMs = now.getTime() - birth.getTime()
  const totalDays = Math.floor(totalMs / MS_PER_DAY)
  const totalMinutes = totalMs / (1000 * 60)
  const totalWeeks = Math.floor(totalDays / 7)
  const exactYears = totalMs / (MS_PER_DAY * 365.2425)

  return {
    days: totalDays,
    weeks: totalWeeks,
    sleeps: totalDays, // roughly one night's sleep per day lived
    heartbeats: Math.floor(totalMinutes * AVG_HEARTBEATS_PER_MIN),
    breaths: Math.floor(totalMinutes * AVG_BREATHS_PER_MIN),
    fullMoons: Math.floor(totalDays / LUNAR_CYCLE_DAYS),
    tripsAroundSun: Math.floor(exactYears),
    // Share of an assumed long life already spent, clamped to [0, 100].
    lifePercent: Math.min(
      100,
      Math.max(0, (exactYears / LIFE_EXPECTANCY_YEARS) * 100)
    ),
    weeksLived: Math.min(TOTAL_LIFE_WEEKS, totalWeeks),
    weeksRemaining: Math.max(0, TOTAL_LIFE_WEEKS - totalWeeks),
  }
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/**
 * Birthday-flavoured facts: the weekday you were born on, and how far the next
 * birthday is. `weekdayIndex` lets the UI localise the day name itself.
 */
export function birthdayInsights(birth, now = new Date()) {
  const weekdayIndex = birth.getDay()

  // Next birthday: this year's, or next year's if it already passed.
  let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let isToday = next.getTime() === today.getTime()
  if (next.getTime() < today.getTime()) {
    next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
  }

  const daysToNext = Math.round((next.getTime() - today.getTime()) / MS_PER_DAY)

  return {
    weekdayIndex,
    weekdayName: WEEKDAYS[weekdayIndex],
    daysToNextBirthday: daysToNext,
    isBirthdayToday: isToday,
  }
}

const MS_PER_YEAR = MS_PER_DAY * 365.2425

/**
 * Live counters for the "still ticking" slides. Cheap enough to call on an
 * interval. Takes a millisecond timestamp so callers can use Date.now().
 */
export function liveCounts(birth, nowMs = Date.now()) {
  const ms = nowMs - birth.getTime()
  const minutes = ms / 60000
  return {
    seconds: Math.max(0, Math.floor(ms / 1000)),
    minutes: Math.max(0, Math.floor(minutes)),
    heartbeats: Math.max(0, Math.floor(minutes * AVG_HEARTBEATS_PER_MIN)),
    breaths: Math.max(0, Math.floor(minutes * AVG_BREATHS_PER_MIN)),
  }
}

/**
 * Tongue-in-cheek forecast against the assumed long life. Used by the
 * humorous "estimated lifespan" slide and the summary.
 */
export function lifeForecast(birth, now = new Date()) {
  const exactYears = (now.getTime() - birth.getTime()) / MS_PER_YEAR
  const remainingYears = Math.max(0, LIFE_EXPECTANCY_YEARS - exactYears)
  const remainingDays = Math.max(0, Math.round(remainingYears * 365.2425))
  return {
    summersLeft: Math.max(0, Math.round(remainingYears)),
    remainingDays,
    remainingWeeks: Math.floor(remainingDays / 7),
    outlived: exactYears >= LIFE_EXPECTANCY_YEARS,
  }
}
