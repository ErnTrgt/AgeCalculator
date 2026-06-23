import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

import Header from "../components/Header"
import Calculator from "../components/Calculator"
import Story from "../components/wrapped/Story"
import { useLang } from "../lib/i18n"
import { makeDate, isFuture } from "../lib/age"

const Home = () => {
  const { t } = useLang()
  const router = useRouter()
  const [birth, setBirth] = useState(null)
  const [name, setName] = useState("")

  // Called by the cover form on a valid submit (date + optional name).
  const handleResult = (date, who = "") => {
    setName(who)
    setBirth(date)
  }

  // Deep link: ?d=YYYY-MM-DD opens straight into someone's wrapped.
  useEffect(() => {
    if (!router.isReady || birth) return
    const raw = router.query.d
    if (typeof raw !== "string") return
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw)
    if (!m) return
    const date = makeDate(Number(m[1]), Number(m[2]), Number(m[3]))
    if (date && !isFuture(date)) setBirth(date)
  }, [router.isReady, router.query.d, birth])

  const handleRestart = () => {
    setBirth(null)
    setName("")
    router.replace("/", undefined, { shallow: true })
  }

  return (
    <>
      <Head>
        <title>{`${t.cover.title} · memento mori`}</title>
        <meta name="description" content={t.cover.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0c0b10" />
        <meta property="og:title" content={t.shareTitle} />
        <meta property="og:description" content={t.cover.subtitle} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {birth ? (
        <Story birth={birth} name={name} onRestart={handleRestart} />
      ) : (
        <main className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 py-8 sm:px-8 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(133,77,255,0.5), transparent 70%)",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-xl">
            <Header />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
            <p className="font-display text-sm font-medium uppercase tracking-[0.25em] text-accent">
              {t.cover.kicker}
            </p>
            <h1 className="mt-4 font-display text-big font-bold leading-[1.02] tracking-tight">
              {t.cover.title}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-bone-muted">
              {t.cover.subtitle}
            </p>

            <div className="mt-10">
              <Calculator onResult={handleResult} />
            </div>
          </div>

          <footer className="relative z-10 mx-auto w-full max-w-xl pt-6 text-sm italic text-bone-muted">
            {t.footer}
          </footer>
        </main>
      )}
    </>
  )
}

export default Home
