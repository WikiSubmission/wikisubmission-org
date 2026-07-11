'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'

/**
 * "Being written" text reveal for the zikr strip: words surface one after
 * another out of an ink blur, like script settling onto parchment.
 *
 * The stagger is strictly PER-WORD, never per-letter: splitting Arabic (or any
 * cursive script) into per-letter spans breaks glyph shaping and ligatures,
 * while word boundaries are always safe. Direction comes from dir="auto" on
 * the container.
 */

/** Cap the total reveal so long zikr texts don't take forever to finish. */
const MAX_TOTAL_STAGGER_S = 1.6
const WORD_STAGGER_S = 0.14
const WORD_DURATION_S = 0.7

const container = (stagger: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
})

const word = {
  hidden: { opacity: 0, y: 5, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: WORD_DURATION_S, ease: [0.4, 0, 0.2, 1] as const },
  },
}

export function ZikrRevealText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const words = text.split(/\s+/).filter(Boolean)
  const stagger = Math.min(
    WORD_STAGGER_S,
    words.length > 1 ? MAX_TOTAL_STAGGER_S / (words.length - 1) : WORD_STAGGER_S,
  )

  return (
    <motion.span
      dir="auto"
      className={className}
      variants={container(stagger)}
      initial="hidden"
      animate="visible"
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {/* The space lives outside the inline-block span; inside it would
              collapse and the words would run together. */}
          <motion.span className="inline-block" variants={word}>
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </motion.span>
  )
}
