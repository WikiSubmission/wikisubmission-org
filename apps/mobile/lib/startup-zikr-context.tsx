'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ZIKR_FALLBACK } from '@/constants/zikr-fallback'
import { dailyZikrIndex, type ZikrItem } from '@/lib/zikr'

/**
 * Startup zikr animation state. On every cold start the day's zikr shows
 * centered on a full-screen overlay, then flies up into the Today screen's
 * zikr strip (framer-motion layoutId) while the prayer card animates open.
 *
 * phases: overlay (text centered) → flying (shared-element flight; strip
 * mounted, prayer card entering) → done. `skipped` covers tap-to-skip,
 * reduced motion, non-Today launch routes, and warm navigations.
 */
export type StartupPhase = 'overlay' | 'flying' | 'done' | 'skipped'

export const ZIKR_HERO_LAYOUT_ID = 'zikr-hero'

interface StartupZikrState {
  phase: StartupPhase
  /** Bundled fallback list — the deterministic source for the overlay/flight so
   *  the prerender and hydration render the same zikr. */
  items: ZikrItem[]
  /** The day's zikr the overlay shows and the strip starts on. Deterministic
   *  (server-seeded) so it never hydration-mismatches. */
  initialIndex: number
  beginFlight: () => void
  finish: () => void
  skip: () => void
}

// Module-level flag: the JS bundle re-evaluates only on a cold start, so this
// is true exactly once per app process — client-side navigation never replays
// the animation.
let startupConsumed = false

const StartupZikrContext = createContext<StartupZikrState | null>(null)

export function StartupZikrProvider({
  dailySeed,
  children,
}: {
  /** Whole-days-since-epoch seed computed on the server (see currentDaySeed).
   *  Serialized into the payload so client hydration reuses the exact value. */
  dailySeed: number
  children: React.ReactNode
}) {
  const [phase, setPhase] = useState<StartupPhase>(() => {
    if (startupConsumed) return 'skipped'
    startupConsumed = true
    return 'overlay'
  })

  // The overlay's zikr must render identically on the prerender and on
  // hydration, so it is fully deterministic: the bundled fallback list indexed
  // by a server-seeded day number. No localStorage, no Math.random() at render.
  // The strip takes over post-mount and rotates per-user (see ZikrStrip).
  const initialIndex = dailyZikrIndex(dailySeed, ZIKR_FALLBACK.length)

  const beginFlight = useCallback(() => {
    setPhase((prev) => (prev === 'overlay' ? 'flying' : prev))
  }, [])
  const finish = useCallback(() => {
    setPhase((prev) => (prev === 'flying' ? 'done' : prev))
  }, [])
  const skip = useCallback(() => {
    setPhase((prev) => (prev === 'done' ? prev : 'skipped'))
  }, [])

  const value = useMemo(
    () => ({ phase, items: ZIKR_FALLBACK, initialIndex, beginFlight, finish, skip }),
    [phase, initialIndex, beginFlight, finish, skip],
  )

  return <StartupZikrContext.Provider value={value}>{children}</StartupZikrContext.Provider>
}

export function useStartupZikr(): StartupZikrState {
  const ctx = useContext(StartupZikrContext)
  if (!ctx) throw new Error('useStartupZikr must be used within StartupZikrProvider')
  return ctx
}
