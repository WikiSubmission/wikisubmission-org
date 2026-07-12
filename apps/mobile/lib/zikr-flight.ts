// Flip.FlipState is an ambient global from gsap's type declarations — no
// runtime import needed here (the plugin itself registers via lib/gsap).

/**
 * Handoff slot for the splash-to-strip zikr flight. The startup overlay
 * captures a Flip state of its hero text just before it unmounts; the zikr
 * strip consumes it on mount and animates its own text from that captured
 * position (GSAP Flip replaces the old framer-motion layoutId morph).
 */
export const ZIKR_FLIP_ID = 'zikr-hero'

let pending: Flip.FlipState | null = null

export function setZikrFlightState(state: Flip.FlipState): void {
  pending = state
}

/** Returns the captured state once; later callers (rotations) get null. */
export function takeZikrFlightState(): Flip.FlipState | null {
  const state = pending
  pending = null
  return state
}
