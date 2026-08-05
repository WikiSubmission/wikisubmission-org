import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

// Single registration point: every mobile module imports gsap (and Flip) from
// here so plugins are registered exactly once and tree-shaking stays intact.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

/** Ease used by most mobile enter/exit tweens (mirrors the old cubic-bezier
 *  (0.4, 0, 0.2, 1) "standard" curve closely enough at these durations). */
export const EASE_STANDARD = 'power2.inOut'
/** Settle-in ease for hero moments (old cubic-bezier(0.22, 1, 0.36, 1)). */
export const EASE_SETTLE = 'power3.out'

export { gsap, Flip }
