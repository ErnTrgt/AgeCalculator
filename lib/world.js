// Offline, deterministic world-population estimates. Deliberately approximate
// ("~" everywhere in the UI): a fun perspective, not a census. Figures derived
// from UN World Population Prospects 2024 (global, rounded).

export const WORLD_POPULATION = 8_100_000_000

// Share of the global population in each 5-year age band (fractions of 1).
// Source: UN WPP 2024, global, smoothed and rounded; sums to ~1.0.
const AGE_BAND_SHARE = [
  0.084, // 0-4
  0.086, // 5-9
  0.085, // 10-14
  0.082, // 15-19
  0.08, // 20-24
  0.078, // 25-29
  0.076, // 30-34
  0.07, // 35-39
  0.064, // 40-44
  0.057, // 45-49
  0.051, // 50-54
  0.044, // 55-59
  0.037, // 60-64
  0.03, // 65-69
  0.023, // 70-74
  0.015, // 75-79
  0.009, // 80-84
  0.005, // 85-89
  0.002, // 90-94
  0.0006, // 95-99
  0.0002, // 100+
]

/**
 * Rough number of people on Earth who are the same whole-number age as you.
 * Spreads each 5-year band evenly across its years.
 */
export function peopleAroundAge(ageYears) {
  const band = Math.min(Math.floor(ageYears / 5), AGE_BAND_SHARE.length - 1)
  const perYearShare = AGE_BAND_SHARE[band] / 5
  return Math.round(WORLD_POPULATION * perYearShare)
}

// Approximate global births per year, by era (millions/year).
const ANNUAL_BIRTHS_BY_DECADE = {
  1950: 98,
  1960: 108,
  1970: 121,
  1980: 127,
  1990: 134,
  2000: 131,
  2010: 139,
  2020: 134,
}

/**
 * Roughly how many babies were born worldwide on the same day as you.
 */
export function birthsOnDay(year) {
  const decade = Math.min(
    2020,
    Math.max(1950, Math.floor(year / 10) * 10)
  )
  const annualMillions = ANNUAL_BIRTHS_BY_DECADE[decade] ?? 134
  return Math.round((annualMillions * 1_000_000) / 365)
}
