'use client'

import { useEffect } from 'react'

// ── Tunable constants ──────────────────────────────────────────────────────
/** Don't hide the top bar until the user has scrolled down past this point. */
const HIDE_AFTER_PX = 56

/** A small upward scroll of this many px brings the top bar back. */
const SHOW_AFTER_UPWARD_PX = 12
// ───────────────────────────────────────────────────────────────────────────

const ATTR = 'data-reader-chrome-hidden'

/**
 * Immersive-reading chrome control for the mobile Quran reader.
 *
 * While enabled, listens to window scroll and toggles `data-reader-chrome-hidden`
 * on <html>:
 *   - scrolling down past HIDE_AFTER_PX → set attribute (top bar slides away,
 *     chapter toolbar rides up — see globals.css)
 *   - scrolling up SHOW_AFTER_UPWARD_PX → remove attribute
 *   - back at the very top            → remove attribute immediately
 *
 * The attribute is always removed when disabled/unmounted so other screens
 * never inherit hidden chrome.
 */
export function useReaderChromeScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const html = document.documentElement
    let lastY = window.scrollY
    let upwardAccum = 0

    const onScroll = () => {
      const y = window.scrollY

      if (y <= 0) {
        html.removeAttribute(ATTR)
        upwardAccum = 0
      } else if (y > lastY) {
        upwardAccum = 0
        if (y > HIDE_AFTER_PX) html.setAttribute(ATTR, '')
      } else if (y < lastY) {
        upwardAccum += lastY - y
        if (upwardAccum >= SHOW_AFTER_UPWARD_PX) {
          html.removeAttribute(ATTR)
          upwardAccum = 0
        }
      }

      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      html.removeAttribute(ATTR)
    }
  }, [enabled])
}
