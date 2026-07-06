'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuranModeSelector } from '@/components/quran-reader/mode-selector'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { fetchManifest, OFFLINE_MANIFEST_URL } from '@/lib/offline/manifest'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'

/**
 * Slim sticky toolbar above the mobile chapter reader carrying the display-mode
 * toggle. Word mode is gated: when the word-by-word bundle for the user's
 * language is published but not installed, the tap routes to the downloads
 * screen instead of enabling a mode whose data would need the network.
 */
export function ChapterToolbar() {
  const router = useRouter()
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)

  const onWordModeIntercept = useCallback(async (): Promise<boolean> => {
    const store = getRegisteredOfflineContentStore()
    if (!store) return true // web preview: stay on the network path

    // The reader's offline word path currently reads the English words bundle,
    // so accept either the user's language or English as satisfying word mode.
    const candidateIds = [...new Set([`quran-words-${primaryLanguage}`, 'quran-words-en'])]
    try {
      const installed = await store.installedBundles()
      if (installed.some((b) => candidateIds.includes(b.id))) return true
      const manifest = await fetchManifest(OFFLINE_MANIFEST_URL)
      if (manifest.bundles.some((b) => candidateIds.includes(b.id))) {
        router.push('/me/settings?tab=downloads')
        return false
      }
    } catch {
      // Offline with nothing installed: fall through — the reader keeps its
      // existing network-fallback behavior for word data.
    }
    return true
  }, [primaryLanguage, router])

  return (
    <div
      className="border-border/40 bg-background/80 sticky z-30 flex justify-center border-b px-4 py-2 backdrop-blur-md"
      style={{ top: 'calc(env(safe-area-inset-top) + 3.5rem)' }}
    >
      <QuranModeSelector onWordModeIntercept={onWordModeIntercept} />
    </div>
  )
}
