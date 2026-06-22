import React, { useRef, useState } from "react"
import { ArrowRight } from "@phosphor-icons/react"

import Input from "./Input"
import { useLang } from "../lib/i18n"
import { makeDate, isFuture } from "../lib/age"

const empty = { day: "", month: "", year: "" }

// The cover form. On a valid submit it hands the parsed birth date up to the
// page, which launches the wrapped story.
const Calculator = ({ onResult }) => {
  const { t } = useLang()
  const c = t.cover
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})

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
    onResult(makeDate(Number(values.year), Number(values.month), Number(values.day)))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
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
