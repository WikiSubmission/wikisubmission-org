'use client'

import { useEffect, useState } from 'react'

/**
 * True when the app is running as an installed PWA / Trusted Web Activity
 * (Android, Google Play) rather than in a normal browser tab.
 *
 * Use to hide web-only chrome (install prompts, "open in app" banners) and to
 * opt into app-like affordances when launched standalone. Returns false during
 * SSR and the first client render to avoid hydration mismatches, then resolves
 * on mount.
 */
export function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)')

    const compute = () =>
      mql.matches ||
      // iOS Safari exposes navigator.standalone instead of display-mode.
      ('standalone' in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true) ||
      document.referrer.startsWith('android-app://')

    setStandalone(compute())

    const onChange = () => setStandalone(compute())
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return standalone
}
