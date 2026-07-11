'use client'

import { useEffect, useRef } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { fetchManifest, OFFLINE_MANIFEST_URL } from '@/lib/offline/manifest'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { getConnectionKind, onConnectionChange } from '@/lib/network-status'
import {
  installWordBundle,
  useWordBundleDownload,
} from '@/hooks/use-word-bundle-download'

/**
 * Background download of the word-by-word bundle (~24 MB per language) so word
 * mode works offline without a trip to the downloads screen. Downloads start
 * automatically on Wi-Fi only; on cellular the bundle is remembered and the
 * install fires as soon as Wi-Fi appears (this session) or next launch. The
 * chapter toolbar's sheet reads the same store and can force an install.
 * Renders nothing; a no-op off-device (no store registered).
 */
export function MobileWordBundleAutoload() {
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const attempted = useRef<Set<string>>(new Set())

  useEffect(() => {
    const store = getRegisteredOfflineContentStore()
    if (!store) return
    const lang =
      primaryLanguage === 'none' || primaryLanguage === 'xl' ? 'en' : primaryLanguage
    if (attempted.current.has(lang)) return
    attempted.current.add(lang)

    // The reader's offline word path reads the English words bundle as a
    // fallback, so either the user's language or English satisfies word mode.
    const candidateIds = [...new Set([`quran-words-${lang}`, 'quran-words-en'])]
    const { setState } = useWordBundleDownload.getState()
    let unsubscribe: (() => void) | null = null

    void (async () => {
      try {
        setState({ status: 'checking' })
        const installed = await store.installedBundles()
        if (installed.some((b) => candidateIds.includes(b.id))) {
          setState({ status: 'installed' })
          return
        }

        const manifest = await fetchManifest(OFFLINE_MANIFEST_URL)
        const bundle =
          candidateIds
            .map((id) => manifest.bundles.find((b) => b.id === id && b.kind === 'words'))
            .find(Boolean) ?? null
        if (!bundle) {
          setState({ status: 'unavailable' })
          return
        }
        setState({ bundle })

        if ((await getConnectionKind()) === 'wifi') {
          await installWordBundle()
          return
        }

        // On cellular (or unknown): wait for Wi-Fi within this session.
        setState({ status: 'waiting-wifi' })
        unsubscribe = onConnectionChange((kind) => {
          if (kind !== 'wifi') return
          if (useWordBundleDownload.getState().status !== 'waiting-wifi') return
          void installWordBundle()
        })
      } catch {
        // Offline (manifest unreachable) or store failure: retry next session
        // or when the language changes again.
        setState({ status: 'failed' })
        attempted.current.delete(lang)
      }
    })()

    return () => {
      unsubscribe?.()
    }
  }, [primaryLanguage])

  return null
}
