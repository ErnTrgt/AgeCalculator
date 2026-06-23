# memento mori — Life, Wrapped

> _Time is the only currency you spend that you can never earn back._

**Live:** https://memento-mori-erntrgt.vercel.app

What started as a Frontend Mentor "Age Calculator" challenge, reimagined as a small
meditation on time. You enter your **name and birth date**, and instead of returning a
number the app plays a full-screen, auto-advancing **"Spotify Wrapped"-style story** of
your life in numbers — and addresses you by name along the way.

Bilingual (🇹🇷 / 🇬🇧), responsive, with light & dark themes.

## The story

An auto-advancing sequence of slides (tap to skip, press-and-hold or pause to linger):

- **Age** — years / months / days, with a personalised greeting.
- **Live counters** — seconds lived and heartbeats / breaths, ticking in real time.
- **Days lived**, **cosmic** (full moons seen, trips around the Sun).
- **People your age** on the planet right now, and babies born your day.
- **Born on a …** — the weekday you arrived, and the countdown to your next birthday.
- **Your life in weeks** — a ~4,160-square grid (an 80-year life) that glows from a
  dim past into a bright present, with the current week pulsing.
- **Life %**, **milestones** (10,000th day, next billion seconds, decade birthdays).
- **Estimated lifespan** — a gentle, humorous "summers left".
- **Summary** — a shareable poster + 9:16 story image, both stamped with your name.

## Features

- **Personalised** — captures a name and weaves it into the story, summary, and posters.
- **Shareable** — download a square card or a 9:16 story image, copy a deep-link
  (`?d=YYYY-MM-DD`) that re-opens someone's wrapped.
- **Live** — real-time ticking counters, segmented autoplay with pause/play.
- **Sound + haptics** — soft synthesised blips, on by default (the saved choice wins).
- **Bilingual** Turkish / English, one-tap toggle (remembered across visits).
- **Light / dark** themes (remembered, no flash on load).
- **Submission tracking** — name + birth date emailed to the owner via Web3Forms.
- **Signature** — an animated, hand-written cover signature linking to the author.
- Accessible: keyboard nav, ARIA labels, and `prefers-reduced-motion` support.

## Tech

- [Next.js](https://nextjs.org/) (pages router) + React 18, deployed on **Vercel**
  (auto-deploy on push to `main`).
- [Tailwind CSS](https://tailwindcss.com/) with a custom memento-mori palette.
- [motion](https://motion.dev/) for slide / number / signature animation.
- [html-to-image](https://github.com/bubkoo/html-to-image) for the shareable posters.
- No date/i18n libraries — the logic in [`lib/age.js`](lib/age.js) and
  [`lib/i18n.js`](lib/i18n.js) is plain, dependency-free, and easy to read.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable submission emails, copy [`.env.example`](.env.example) to `.env.local` and add a
free [Web3Forms](https://web3forms.com) access key as `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
(it's posted client-side, so it's public — restrict it by domain in the Web3Forms
dashboard). Without a key, the form still works; it just doesn't send.

## Project structure

```
lib/
  age.js        — pure date + life-stat math (calculateAge, lifeStats, forecasts)
  i18n.js       — TR/EN dictionary, memento lines, language context
  milestones.js — upcoming "big day" milestones
  world.js      — embedded, offline data (people-your-age, births-that-day)
  sfx.js        — synthesised sound + haptics context
  theme.js      — light/dark theme context
components/
  Calculator.jsx, Input.jsx, Header.jsx, Signature.jsx
  AnimatedNumber.jsx, LiveNumber.jsx
  wrapped/  Story.jsx, WeeksGrid.jsx, Summary.jsx, StoryPoster.jsx
pages/
  index.jsx, _app.jsx, _document.jsx
```

## A note on the numbers

The lifespan figures (80-year grid, ~72 bpm heart rate, ~16 breaths/min) are gentle
averages, set as constants in [`lib/age.js`](lib/age.js). They're a reminder, not a
prophecy — tune them as you like.
