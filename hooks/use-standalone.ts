'use client'

import { useSyncExternalStore } from 'react'

function computeStandalone(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes navigator.standalone instead of display-mode.
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true) ||
    document.referrer.startsWith('android-app://')
  )
}

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}

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
  return useSyncExternalStore(subscribe, computeStandalone, () => false)
}
