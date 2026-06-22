# memento mori — Age Calculator

> _Time is the only currency you spend that you can never earn back._

What started as a Frontend Mentor "Age Calculator" challenge, reimagined as a small
meditation on time. Enter a date and the app doesn't just return a number — it shows
you the **life behind it**: your weeks as a grid, your heartbeats and full moons, the
day you were born, and a quiet line chosen for your stage of life.

Bilingual (🇹🇷 / 🇬🇧), responsive, with light & dark themes.

## Features

- **Accurate age** in years / months / days, with correct calendar borrowing.
- **Your Life in Weeks** — ~4,160 squares (an 80-year life); the lived ones are filled.
- **Perspective** — your age re-expressed as trips around the Sun, full moons seen,
  days lived, heartbeats, breaths, and nights of sleep.
- **Birthday insights** — the weekday you were born, and the countdown to the next one.
- **Memento line** — a poetic note that changes with your life stage.
- **Bilingual** Turkish / English with a one-tap toggle (remembered across visits).
- **Light / dark** themes (remembered, with no flash on load).
- Accessible: keyboard focus, ARIA labels, and `prefers-reduced-motion` support.

## Tech

- [Next.js](https://nextjs.org/) (pages router) + React 18
- [Tailwind CSS](https://tailwindcss.com/) with a custom memento-mori palette
- Fraunces (serif) + Inter (sans) via Google Fonts
- No date/i18n libraries — the logic in [`lib/age.js`](lib/age.js) and
  [`lib/i18n.js`](lib/i18n.js) is plain, dependency-free, and easy to read.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
lib/
  age.js     — pure date + life-stat math (calculateAge, lifeStats, birthdayInsights)
  i18n.js    — TR/EN dictionary, memento lines, language context
  theme.js   — light/dark theme context
components/
  Calculator.jsx, Input.jsx, AnimatedNumber.jsx
  LifeInWeeks.jsx, Perspective.jsx, BirthdayInsights.jsx, MementoQuote.jsx, Header.jsx
pages/
  index.jsx, _app.jsx, _document.jsx
```

## A note on the numbers

The lifespan figures (80-year grid, ~72 bpm heart rate, ~16 breaths/min) are gentle
averages, set as constants in [`lib/age.js`](lib/age.js). They're a reminder, not a
prophecy — tune them as you like.
