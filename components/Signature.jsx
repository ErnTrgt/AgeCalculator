import React from "react"
import { motion, useReducedMotion } from "motion/react"

// A personal signature mark for the cover. The name "writes itself" in left to
// right (a clip-path wipe that mimics a pen stroke); on hover a flourish line
// draws underneath. The whole word links to the author's Instagram. Horizontal
// padding keeps the script font's decorative tails from being clipped.
const Signature = () => {
  const reduce = useReducedMotion()

  return (
    <motion.a
      href="https://www.instagram.com/erntrgt.10/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Eren Turgut · Instagram"
      title="Eren Turgut"
      className="group inline-block select-none text-ink/75 transition-colors duration-300 hover:text-accent dark:text-bone/80 dark:hover:text-accent-soft"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={reduce ? undefined : { rotate: -2, scale: 1.04 }}>
      <span className="relative inline-block leading-none">
        {/* The signature itself, revealed as if being written. Extra side
            padding so the font's swashes aren't cut by the clip wipe. */}
        <motion.span
          className="inline-block px-4 font-signature text-4xl leading-none sm:text-5xl"
          initial={
            reduce
              ? { opacity: 0 }
              : { clipPath: "inset(-10% 100% -25% 0)", opacity: 1 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { clipPath: "inset(-10% 0% -25% 0)", opacity: 1 }
          }
          transition={{ duration: 1.5, delay: 0.5, ease: [0.6, 0, 0.2, 1] }}>
          Eren Turgut
        </motion.span>

        {/* Underline flourish that draws in on hover. */}
        <span className="absolute -bottom-1 left-4 right-4 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
    </motion.a>
  )
}

export default Signature
