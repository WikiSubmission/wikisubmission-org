'use client'

import { useEffect, useRef } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { fetchManifest, OFFLINE_MANIFEST_URL } from '@/lib/offline/manifest'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { useStartupZikr } from '@/lib/startup-zikr-context'

/** Background installs wait out the startup window so catalog/manifest I/O
 *  never competes with hydration and the splash animation. */
export const AUTOLOAD_IDLE_DELAY_MS = 2_500

/**
 * Keeps the offline text bundle for the user's primary Quran language on
 * device. Arabic and English ship inside the app binary (see
 * lib/offline/preinstall.ts); Google Play cannot conditionally package assets
 * by an in-app language choice, so any other language is fetched here in the
 * background the first time it becomes the primary language while online.
 * Renders nothing; a no-op off-device (no store registered) and for languages
 * without a published bundle.
 */
export function MobileBundleAutoload() {
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const { phase } = useStartupZikr()
  const startupSettled = phase === 'done' || phase === 'skipped'
  const attempted = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!startupSettled) return
    const store = getRegisteredOfflineContentStore()
    if (!store) return
    if (primaryLanguage === 'none' || primaryLanguage === 'xl') return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    if (attempted.current.has(primaryLanguage)) return

    const bundleId = `quran-${primaryLanguage}`
    const run = async () => {
      if (attempted.current.has(primaryLanguage)) return
      attempted.current.add(primaryLanguage)
      try {
        const installed = await store.installedBundles()
        if (installed.some((b) => b.id === bundleId)) return
        const manifest = await fetchManifest(OFFLINE_MANIFEST_URL)
        const bundle = manifest.bundles.find(
          (b) => b.id === bundleId && (b.kind ?? 'text') === 'text',
        )
        if (!bundle) return // no published bundle for this language
        await store.install(bundle)
      } catch {
        // Offline or install failure: the reader falls back to the network;
        // retried next session (or when the language changes again).
        attempted.current.delete(primaryLanguage)
      }
    }
    const timer = window.setTimeout(() => void run(), AUTOLOAD_IDLE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [primaryLanguage, startupSettled])

  return null
}
