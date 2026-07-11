'use client'

import { useCallback, useState } from 'react'
import { QuranModeSelector } from '@/components/quran-reader/mode-selector'
import type { QuranModeId } from '@/components/quran-reader/mode-selector'
import {
  ModeChangeToast,
  type ModeAnnouncement,
} from '@/components/quran/mode-change-toast'
import { WordBundleSheet } from '@/components/quran/word-bundle-sheet'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useWordBundleDownload } from '@/hooks/use-word-bundle-download'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'

/**
 * Slim sticky toolbar above the mobile chapter reader carrying the display-mode
 * toggle. When word mode is enabled before the word-by-word bundle is on
 * device, a sheet explains the background download (Wi-Fi–deferred, see
 * MobileWordBundleAutoload) — the mode still switches while online since the
 * reader falls back to the network for word data; offline the switch is
 * cancelled because there is no data source at all.
 */
export function ChapterToolbar() {
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const [announcement, setAnnouncement] = useState<ModeAnnouncement | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const onModeChanged = useCallback((mode: QuranModeId) => {
    setAnnouncement({ mode })
  }, [])

  const onWordModeIntercept = useCallback(async (): Promise<boolean> => {
    const store = getRegisteredOfflineContentStore()
    if (!store) return true // web preview: stay on the network path

    // The reader's offline word path currently reads the English words bundle,
    // so accept either the user's language or English as satisfying word mode.
    const candidateIds = [...new Set([`quran-words-${primaryLanguage}`, 'quran-words-en'])]
    try {
      const installed = await store.installedBundles()
      if (installed.some((b) => candidateIds.includes(b.id))) return true
    } catch {
      return true // unreadable catalog: keep the network-fallback behavior
    }

    const { status } = useWordBundleDownload.getState()
    if (status === 'installed' || status === 'unavailable') return true

    setSheetOpen(true)
    // Online, word data streams from the network while the bundle downloads;
    // offline there is nothing to show, so keep the current mode.
    return typeof navigator === 'undefined' || navigator.onLine !== false
  }, [primaryLanguage])

  return (
    <div className="border-border/40 bg-background/80 mobile-chapter-toolbar sticky z-30 flex justify-center border-b px-4 py-2 backdrop-blur-md">
      <QuranModeSelector
        onWordModeIntercept={onWordModeIntercept}
        onModeChanged={onModeChanged}
      />
      <ModeChangeToast announcement={announcement} />
      <WordBundleSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
