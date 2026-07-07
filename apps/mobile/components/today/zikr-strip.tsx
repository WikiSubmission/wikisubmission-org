'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ZikrItem } from '@/lib/zikr'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export interface ZikrStripProps {
  items: ZikrItem[]
  /** Seed index (the splash flight hands over the zikr it displayed). */
  initialIndex?: number
  intervalMs?: number
  /** framer-motion shared-element id for the splash-to-strip flight. */
  layoutId?: string
  /** Rotation holds until the startup animation finishes. */
  paused?: boolean
}

const EASE = [0.4, 0, 0.2, 1] as const

/**
 * Rotating zikr display above the prayer card: one short remembrance of God
 * at a time, breathing in and out (fade + blur + letter-spacing). Purely
 * presentational — data comes from useZikr in the parent.
 */
export function ZikrStrip({
  items,
  initialIndex = 0,
  intervalMs = 8000,
  layoutId,
  paused = false,
}: ZikrStripProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(() =>
    items.length > 0 ? Math.min(initialIndex, items.length - 1) : 0,
  )

  useEffect(() => {
    if (paused || items.length <= 1) return
    const advance = () => {
      // Skip rotation while backgrounded; the tab regains a fresh interval on
      // the next tick anyway.
      if (document.visibilityState === 'hidden') return
      setIndex((prev) => (prev + 1) % items.length)
    }
    const timer = window.setInterval(advance, intervalMs)
    return () => window.clearInterval(timer)
  }, [paused, items.length, intervalMs])

  const item = items[index]
  if (!item) return null

  const enterExit = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
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
              {item.text}
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
