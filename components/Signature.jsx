import React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InstagramLogo } from "@phosphor-icons/react"

// A personal signature mark for the cover. The name "writes itself" on left to
// right (a clip-path wipe that mimics a pen stroke), then a small Instagram
// glyph fades in. The whole thing is a link to the author's profile.
const Signature = () => {
  const reduce = useReducedMotion()

  return (
    <motion.a
      href="https://www.instagram.com/erntrgt.10/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Eren Turgut · Instagram"
      title="Eren Turgut"
      className="group inline-flex select-none items-end gap-1.5 text-ink/75 transition-colors duration-300 hover:text-accent dark:text-bone/80 dark:hover:text-accent-soft"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={reduce ? undefined : { rotate: -2, scale: 1.04 }}>
      <span className="relative inline-block leading-none">
        {/* The signature itself, revealed as if being written. */}
        <motion.span
          className="font-signature text-4xl leading-none sm:text-5xl"
          initial={
            reduce
              ? { opacity: 0 }
              : { clipPath: "inset(0 100% -20% 0)", opacity: 1 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { clipPath: "inset(0 0% -20% 0)", opacity: 1 }
          }
          transition={{ duration: 1.5, delay: 0.5, ease: [0.6, 0, 0.2, 1] }}>
          Eren Turgut
        </motion.span>

        {/* Underline that draws in on hover, like a flourish under the name. */}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0.2 : 1.9, duration: 0.5 }}
        className="mb-1 transition-transform duration-300 group-hover:-translate-y-0.5">
        <InstagramLogo size={16} weight="bold" />
      </motion.span>
    </motion.a>
  )
}

export default Signature
