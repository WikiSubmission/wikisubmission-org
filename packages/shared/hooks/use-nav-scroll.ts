import { useEffect } from 'react'

// ── Tunable constants ──────────────────────────────────────────────────────
/** Hide the nav after scrolling DOWN past this many px from the top. */
const HIDE_AFTER_PX = 120

/** How many px of continuous upward scroll are needed before the nav reappears.
 *  Higher = user must scroll up more before the nav comes back. */
const SHOW_AFTER_UPWARD_PX = 2000
// ──────────────────────────────────────────────────────────────────────────

/**
 * Listens to window scroll and toggles `data-nav-hidden` on <html>:
 *   - scroll down > HIDE_AFTER_PX       → set attribute  (SiteNav slides up via CSS)
 *   - scroll up SHOW_AFTER_UPWARD_PX px → remove attribute
 *   - back at top (y=0)                 → remove attribute immediately
 */
export function useNavScroll() {
  useEffect(() => {
    let lastY = 0
    let upwardAccum = 0

    const onScroll = () => {
      const y = window.scrollY

      if (y === 0) {
        // Back at very top — always show nav
        document.documentElement.removeAttribute('data-nav-hidden')
        upwardAccum = 0
      } else if (y > lastY) {
        // Scrolling down — reset upward accumulator, hide nav once past threshold
        upwardAccum = 0
        if (y > HIDE_AFTER_PX) {
          document.documentElement.setAttribute('data-nav-hidden', '')
        }
      } else if (y < lastY) {
        // Scrolling up — accumulate distance; only reveal nav after enough upward scroll
        upwardAccum += lastY - y
        if (upwardAccum >= SHOW_AFTER_UPWARD_PX) {
          document.documentElement.removeAttribute('data-nav-hidden')
          upwardAccum = 0
        }
      }

      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeAttribute('data-nav-hidden')
    }
  }, [])
}
