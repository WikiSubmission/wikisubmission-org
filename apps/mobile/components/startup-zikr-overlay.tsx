'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { normalizePath } from '@/constants/navigation'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { hideNativeSplash } from '@/lib/splash-handoff'
import { useStartupZikr, ZIKR_HERO_LAYOUT_ID } from '@/lib/startup-zikr-context'

const EASE_SETTLE = [0.22, 1, 0.36, 1] as const

// Timeline (ms): text settles 0-700, holds to 900, flight begins at 900 and
// the whole startup is over by ~1500. Tap anywhere skips.
const FLIGHT_AT_MS = 900
const FINISH_AT_MS = 1500
const NON_TODAY_FADE_AT_MS = 900

/**
 * Full-screen startup overlay: the chosen zikr settles in centered, then (on
 * the Today screen) flies up into the zikr strip via the shared layoutId while
 * the backdrop fades and the prayer card opens underneath. On any other launch
 * route it simply fades out. Sibling of MobileShell inside the LayoutGroup in
 * MobileProviders.
 */
export function StartupZikrOverlay() {
  const { phase, items, initialIndex, beginFlight, finish, skip } = useStartupZikr()
  const pathname = usePathname()
  const reducedMotion = usePrefersReducedMotion()

  const active = phase === 'overlay' || phase === 'flying'
  const onToday = normalizePath(pathname) === '/'
  // Capture launch conditions once; route changes mid-animation must not
  // re-trigger effects.
  const modeRef = useRef<'flight' | 'fade' | null>(null)
  if (active && modeRef.current === null) {
    modeRef.current = onToday && !reducedMotion ? 'flight' : 'fade'
  }

  // Lift the native splash only after the overlay has painted (double rAF =
  // the frame containing it is committed) so there is no blank flash between.
  useEffect(() => {
    if (phase !== 'overlay') return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => hideNativeSplash())
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [phase])

  // Drive the timeline.
  useEffect(() => {
    if (phase !== 'overlay') return
    if (modeRef.current === 'flight') {
      const flightTimer = window.setTimeout(beginFlight, FLIGHT_AT_MS)
      return () => window.clearTimeout(flightTimer)
    }
    const fadeTimer = window.setTimeout(skip, NON_TODAY_FADE_AT_MS)
    return () => window.clearTimeout(fadeTimer)
  }, [phase, beginFlight, skip])

  useEffect(() => {
    if (phase !== 'flying') return
    const finishTimer = window.setTimeout(finish, FINISH_AT_MS - FLIGHT_AT_MS)
    return () => window.clearTimeout(finishTimer)
  }, [phase, finish])

  const item = items[initialIndex]

  return (
    <AnimatePresence>
      {active && item && (
        <motion.div
          key="startup-zikr"
          className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
          style={{ pointerEvents: phase === 'overlay' ? 'auto' : 'none' }}
          onPointerDown={skip}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'flying' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === 'flying' ? 0.55 : 0.25, ease: 'easeOut' }}
        >
          {/* The hero unmounts when the flight starts; the Today strip mounts
              its layoutId twin in the same commit, and framer-motion animates
              the text between the two positions. */}
          {phase === 'overlay' && (
            <motion.div
              className="flex flex-col items-center text-center"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, filter: 'blur(8px)', letterSpacing: '0.12em' }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.05em' }
              }
              transition={{ duration: 0.7, ease: EASE_SETTLE }}
            >
              <motion.p
                layoutId={modeRef.current === 'flight' ? ZIKR_HERO_LAYOUT_ID : undefined}
                className="font-display text-foreground/90 max-w-md text-2xl leading-snug text-balance"
              >
                {item.text}
              </motion.p>
              {item.source && (
                <p className="text-muted-foreground/70 mt-2 font-mono text-[9px] tracking-[0.25em] uppercase">
                  {item.source}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
