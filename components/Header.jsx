import React from "react"
import { Sun, Moon, Translate } from "@phosphor-icons/react"

import { useLang } from "../lib/i18n"
import { useTheme } from "../lib/theme"

const Header = () => {
  const { t, toggle: toggleLang } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <header className="flex items-center justify-between">
      <span className="font-display text-sm font-semibold lowercase tracking-tight text-bone-muted">
        memento mori
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLang}
          aria-label="Change language"
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold transition-colors hover:border-accent hover:text-accent dark:border-white/15">
          <Translate size={14} weight="bold" />
          {t.langLabel}
        </button>
        <button
          onClick={toggleTheme}
          aria-label={isDark ? t.themeToLight : t.themeToDark}
          title={isDark ? t.themeToLight : t.themeToDark}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-accent hover:text-accent dark:border-white/15">
          {isDark ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
        </button>
      </div>
    </header>
  )
}

export default Header
