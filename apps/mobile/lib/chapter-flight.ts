// Flip.FlipState is an ambient global from gsap's type declarations.

/**
 * Handoff slot for the chapter index-card → reader title continuity. The
 * tapped card captures a Flip state of its title; the reader consumes it on
 * mount and animates the chapter heading in from the card's position. Same
 * pattern as lib/zikr-flight.ts.
 */
export const CHAPTER_FLIP_ID = 'chapter-title'

let pending: Flip.FlipState | null = null
let pendingAt = 0

/** The capture is only meaningful for the navigation it belongs to. */
const FLIGHT_TTL_MS = 1_500

export function setChapterFlightState(state: Flip.FlipState): void {
  pending = state
  pendingAt = Date.now()
}

export function takeChapterFlightState(): Flip.FlipState | null {
  const state = pending
  pending = null
  if (!state || Date.now() - pendingAt > FLIGHT_TTL_MS) return null
  return state
}
