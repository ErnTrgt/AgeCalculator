// "Big days" of a life: deterministic, offline, personal. Round day counts,
// the billion-second mark, the next decade birthday. All returned as real Dates
// so the UI can localise them.

const MS_DAY = 86_400_000

export function lifeMilestones(birth, now = new Date()) {
  const addDays = (n) => new Date(birth.getTime() + n * MS_DAY)
  const addSeconds = (n) => new Date(birth.getTime() + n * 1000)

  const daysLived = Math.floor((now.getTime() - birth.getTime()) / MS_DAY)
  const secondsLived = Math.floor((now.getTime() - birth.getTime()) / 1000)

  // The 10,000-day landmark (~27.4 years): a classic.
  const tenThousandDays = {
    count: 10_000,
    date: addDays(10_000),
    passed: daysLived >= 10_000,
  }

  // Next not-yet-reached round 1,000-day mark. Skip 10,000 since it gets its
  // own row, so the two never show the same date.
  let nextRound = (Math.floor(daysLived / 1000) + 1) * 1000
  if (nextRound === 10_000) nextRound = 11_000
  const nextRoundDay = {
    count: nextRound,
    date: addDays(nextRound),
    daysAway: nextRound - daysLived,
  }

  // Next billion-second mark (1e9s ~ 31.7 years).
  const nextBillion = (Math.floor(secondsLived / 1e9) + 1) * 1e9
  const nextBillionSeconds = {
    billions: nextBillion / 1e9,
    date: addSeconds(nextBillion),
  }

  // Next birthday that lands on a round decade of age.
  const ageYears = (now.getTime() - birth.getTime()) / (MS_DAY * 365.2425)
  const nextDecade = (Math.floor(ageYears / 10) + 1) * 10
  const nextDecadeBirthday = {
    age: nextDecade,
    date: new Date(
      birth.getFullYear() + nextDecade,
      birth.getMonth(),
      birth.getDate()
    ),
  }

  return {
    daysLived,
    tenThousandDays,
    nextRoundDay,
    nextBillionSeconds,
    nextDecadeBirthday,
  }
}
