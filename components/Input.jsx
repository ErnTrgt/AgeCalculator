import React from "react"

// A single date field (day / month / year). Controlled by the parent so the
// whole form lives in React state — no refs, no direct DOM writes.
const Input = ({
  label,
  name,
  value,
  placeholder,
  error,
  onChange,
  onKeyAdvance,
  maxLength,
  inputRef,
}) => {
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
          hasError ? "text-light-red" : "text-bone-muted"
        }`}>
        {label}
      </label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="number"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        onChange={(e) => {
          const v = e.target.value
          onChange(v)
          if (maxLength && v.length >= maxLength) onKeyAdvance?.()
        }}
        className={`w-full rounded-xl border bg-bone-soft/60 px-4 py-3 text-2xl font-bold tabular-nums text-ink caret-accent outline-none transition-all placeholder:text-bone-muted/70 focus:border-accent focus:bg-bone-soft dark:bg-ink-card dark:text-bone dark:placeholder:text-bone-muted/50 sm:text-3xl ${
          hasError
            ? "border-light-red"
            : "border-black/10 dark:border-white/10"
        }`}
      />

      <p
        id={`${name}-error`}
        role="alert"
        className="mt-2 min-h-[1.25rem] text-xs italic text-light-red">
        {error || ""}
      </p>
    </div>
  )
}

export default Input
