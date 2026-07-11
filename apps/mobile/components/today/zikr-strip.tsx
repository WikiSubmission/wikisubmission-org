'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ZikrItem } from '@/lib/zikr'
import { ZikrRevealText } from '@/components/today/zikr-reveal-text'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export interface ZikrStripProps {
  items: ZikrItem[]
  /** Seed index (the splash flight hands over the zikr it displayed). */
  initialIndex?: number
  intervalMs?: number
  /** How long the first (daily) zikr holds before rotation begins. Longer than
   *  intervalMs so the day's zikr lingers before the per-user shuffle starts. */
  firstHoldMs?: number
  /** framer-motion shared-element id for the splash-to-strip flight. */
  layoutId?: string
  /** Rotation holds until the startup animation finishes. */
  paused?: boolean
}

const EASE = [0.4, 0, 0.2, 1] as const

/** A uniformly random index other than `prev`, so rotation never repeats the
 *  same zikr back-to-back. Each client shuffles independently. */
function pickNextRandomIndex(prev: number, length: number): number {
  if (length <= 1) return 0
  let next = Math.floor(Math.random() * (length - 1))
  if (next >= prev) next += 1
  return next
}

/**
 * Rotating zikr display above the prayer card: one short remembrance of God
 * at a time, breathing in and out (fade + blur + letter-spacing). Purely
 * presentational — data comes from useZikr in the parent.
 */
export function ZikrStrip({
  items,
  initialIndex = 0,
  intervalMs = 8000,
  firstHoldMs = 15000,
  layoutId,
  paused = false,
}: ZikrStripProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(() =>
    items.length > 0 ? Math.min(initialIndex, items.length - 1) : 0,
  )

  // The first item is the shared "zikr of the day" handed over by the splash;
  // it holds for firstHoldMs, then each client shuffles its own random order at
  // intervalMs. setTimeout (not setInterval) so the first hold can be longer.
  useEffect(() => {
    if (paused || items.length <= 1) return
    let timer = 0
    let firstHold = true
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          // Don't advance while backgrounded; just re-arm for the next tick.
          if (document.visibilityState !== 'hidden') {
            setIndex((prev) => pickNextRandomIndex(prev, items.length))
          }
          firstHold = false
          schedule()
        },
        firstHold ? firstHoldMs : intervalMs,
      )
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [paused, items.length, intervalMs, firstHoldMs])

  const item = items[index]
  if (!item) return null

  // Once the splash flight is over the per-word reveal (ZikrRevealText) owns
  // the entrance, so the block-level enter collapses to a fast fade — only the
  // breathe-out exit remains at block level.
  const wordReveal = !layoutId && !reducedMotion
  const enterExit = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
      }
    : wordReveal
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.25, ease: EASE } },
          exit: {
            opacity: 0,
            y: -6,
            filter: 'blur(6px)',
            letterSpacing: '0.14em',
            transition: { duration: 0.9, ease: EASE },
          },
        }
      : {
          initial: { opacity: 0, y: 8, filter: 'blur(6px)', letterSpacing: '0.01em' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '0.05em' },
          exit: { opacity: 0, y: -6, filter: 'blur(6px)', letterSpacing: '0.14em' },
          transition: { duration: 0.9, ease: EASE },
        }

  return (
    <div className="mx-auto w-full max-w-md px-4">
      {/* Height reserved so rotation never reflows the widgets below. */}
      <div className="flex min-h-[5.5rem] flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={item.id} className="flex flex-col items-center" {...enterExit}>
            <motion.p
              layoutId={layoutId}
              className="font-display text-foreground/85 text-[1.35rem] leading-snug text-balance"
            >
              {/* During the splash flight the hero must be one stable element
                  for the layoutId morph; afterwards each zikr writes itself in
                  word by word. */}
              {wordReveal ? <ZikrRevealText text={item.text} /> : item.text}
            </motion.p>
            {item.source && (
              <p className="text-muted-foreground/70 mt-1.5 font-mono text-[9px] tracking-[0.25em] uppercase">
                {item.source}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="border-border/60 mt-3 w-8 border-t" aria-hidden="true" />
      </div>
    </div>
  )
}
