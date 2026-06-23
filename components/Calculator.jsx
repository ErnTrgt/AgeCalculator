import React, { useRef, useState } from "react"
import { ArrowRight } from "@phosphor-icons/react"

import Input from "./Input"
import { useLang } from "../lib/i18n"
import { makeDate, isFuture } from "../lib/age"

const empty = { name: "", day: "", month: "", year: "" }

// Fire-and-forget: log the visitor's name + birth date so the owner can keep
// track. Posted straight to Web3Forms from the browser — that's Web3Forms'
// intended (and free-plan-only) usage; their access key is safe to expose and
// is spam/domain-protected from the dashboard. Never blocks or breaks the
// experience if it fails (offline, no key, etc.).
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

function track(name, birth) {
  if (!WEB3FORMS_KEY) return
  try {
    const p = (n) => String(n).padStart(2, "0")
    const date = `${birth.getFullYear()}-${p(birth.getMonth() + 1)}-${p(
      birth.getDate()
    )}`
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Yeni kayıt: ${name} (${date})`,
        from_name: "memento mori",
        name,
        birth_date: date,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}

// The cover form. On a valid submit it hands the parsed birth date + name up to
// the page, which launches the wrapped story.
const Calculator = ({ onResult }) => {
  const { t } = useLang()
  const c = t.cover
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})

  const dayRef = useRef()
  const monthRef = useRef()
  const yearRef = useRef()
  const buttonRef = useRef()

  const setField = (name) => (v) =>
    setValues((prev) => ({ ...prev, [name]: v }))

  const validate = () => {
    const next = {}
    const day = Number(values.day)
    const month = Number(values.month)
    const year = Number(values.year)

    if (values.name.trim() === "") next.name = t.nameRequired

    if (values.day === "") next.day = t.required
    else if (day < 1 || day > 31) next.day = t.dayRange

    if (values.month === "") next.month = t.required
    else if (month < 1 || month > 12) next.month = t.monthRange

    if (values.year === "") next.year = t.required

    if (Object.keys(next).length > 0) return next

    const date = makeDate(year, month, day)
    if (!date) {
      next.day = t.invalidDate
      next.month = ""
      next.year = ""
      return next
    }
    if (isFuture(date)) {
      next.day = ""
      next.month = ""
      next.year = t.futureDate
      return next
    }
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.values(next).some((m) => m && m.length > 0)) return

    const name = values.name.trim()
    const date = makeDate(Number(values.year), Number(values.month), Number(values.day))
    track(name, date)
    onResult(date, name)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="mb-3 sm:mb-4">
        <Input
          label={c.name}
          name="name"
          type="text"
          inputMode="text"
          autoComplete="given-name"
          autoCapitalize="words"
          placeholder={c.namePlaceholder}
          value={values.name}
          error={errors.name}
          onChange={setField("name")}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Input
          label={c.day}
          name="day"
          placeholder="DD"
          value={values.day}
          error={errors.day}
          onChange={setField("day")}
          onKeyAdvance={() => monthRef.current?.focus()}
          maxLength={2}
          inputRef={dayRef}
        />
        <Input
          label={c.month}
          name="month"
          placeholder="MM"
          value={values.month}
          error={errors.month}
          onChange={setField("month")}
          onKeyAdvance={() => yearRef.current?.focus()}
          maxLength={2}
          inputRef={monthRef}
        />
        <Input
          label={c.year}
          name="year"
          placeholder="YYYY"
          value={values.year}
          error={errors.year}
          onChange={setField("year")}
          onKeyAdvance={() => buttonRef.current?.focus()}
          maxLength={4}
          inputRef={yearRef}
        />
      </div>

      <button
        ref={buttonRef}
        type="submit"
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-bold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-soft hover:shadow-accent/40 active:scale-[0.99]">
        {c.calculate}
        <ArrowRight
          size={20}
          weight="bold"
          className="transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="mt-4 text-center text-sm text-bone-muted">{c.hint}</p>
    </form>
  )
}

export default Calculator
