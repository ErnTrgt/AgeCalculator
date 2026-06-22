import "../styles/globals.css"

import { Space_Grotesk, Inter } from "next/font/google"

import { LangProvider } from "../lib/i18n"
import { ThemeProvider } from "../lib/theme"
import { SoundProvider } from "../lib/sfx"

// Bold grotesk for the big "wrapped" numbers, Inter for UI/body.
// Loaded via next/font (self-hosted, no render-blocking Google <link>).
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export default function App({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${sans.variable}`}>
      <ThemeProvider>
        <LangProvider>
          <SoundProvider>
            <Component {...pageProps} />
          </SoundProvider>
        </LangProvider>
      </ThemeProvider>
    </div>
  )
}
