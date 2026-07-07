'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ZIKR_FALLBACK } from '@/constants/zikr-fallback'
import { pickRandomZikrIndex, readCachedZikrList, type ZikrItem } from '@/lib/zikr'

/**
 * Startup zikr animation state. On every cold start a random zikr shows
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
  /** Zikr list available synchronously at boot (cache or bundled fallback). */
  items: ZikrItem[]
  /** The randomly chosen zikr the overlay shows and the strip starts on. */
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

export function StartupZikrProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<StartupPhase>(() => {
    if (startupConsumed) return 'skipped'
    startupConsumed = true
    return 'overlay'
  })
  const [{ items, initialIndex }] = useState(() => {
    const list = readCachedZikrList() ?? ZIKR_FALLBACK
    return { items: list, initialIndex: pickRandomZikrIndex(list) }
  })

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
    () => ({ phase, items, initialIndex, beginFlight, finish, skip }),
    [phase, items, initialIndex, beginFlight, finish, skip],
  )

  return <StartupZikrContext.Provider value={value}>{children}</StartupZikrContext.Provider>
}

export function useStartupZikr(): StartupZikrState {
  const ctx = useContext(StartupZikrContext)
  if (!ctx) throw new Error('useStartupZikr must be used within StartupZikrProvider')
  return ctx
}
