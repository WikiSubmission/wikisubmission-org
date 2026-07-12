'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

// Module-level flag: the JS bundle re-evaluates only on a cold start, so the
// startup slot is claimed exactly once per app process — client-side
// navigation never replays the animation. Claimed in an effect, never in the
// useState initializer: React can replay initializers (hydration retries,
// StrictMode), and a replay that saw the flag already set would render
// 'skipped' against server HTML built with 'overlay' — the minified #418
// hydration mismatch that used to fire on every page.
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
  // 'overlay' first, unconditionally, so the client's hydration render always
  // matches the prerendered HTML (which is also built with 'overlay').
  const [phase, setPhase] = useState<StartupPhase>('overlay')

  // Post-hydration: claim the once-per-process startup slot, or stand down if
  // another mount already owns it. The ref guards StrictMode's double effect.
  const claimedRef = useRef(false)
  useEffect(() => {
    if (claimedRef.current) return
    claimedRef.current = true
    if (startupConsumed) {
      setPhase((prev) => (prev === 'overlay' ? 'skipped' : prev))
    } else {
      startupConsumed = true
    }
  }, [])

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
