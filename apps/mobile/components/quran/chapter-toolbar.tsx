'use client'

import { useCallback, useState } from 'react'
import { AArrowDown, AArrowUp } from 'lucide-react'
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
import { ZOOM_LEVELS } from '@/lib/quran-zoom'

/**
 * Slim sticky toolbar above the mobile chapter reader carrying the display-mode
 * toggle and a text-size stepper. When word mode is enabled before the
 * word-by-word bundle is on device, a sheet explains the background download
 * (Wi-Fi–deferred, see MobileWordBundleAutoload) — the mode still switches
 * while online since the reader falls back to the network for word data;
 * offline the switch is cancelled because there is no data source at all.
 */
export function ChapterToolbar() {
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const zoomLevel = useQuranPreferences((s) => s.zoomLevel ?? 'comfortable')
  const [announcement, setAnnouncement] = useState<ModeAnnouncement | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Pinch zoom is disabled app-wide (userScalable: false — it fights the
  // virtualized reader and fixed chrome), so reading text size must be
  // adjustable in one tap here. Steps the shared zoom scale the reader already
  // honors; persisted with the rest of the Quran preferences.
  const zoomIndex = ZOOM_LEVELS.indexOf(zoomLevel)
  const stepZoom = useCallback((delta: -1 | 1) => {
    const { zoomLevel: current } = useQuranPreferences.getState()
    const index = ZOOM_LEVELS.indexOf(current ?? 'comfortable')
    const next = ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + delta))]
    if (next !== current) useQuranPreferences.setState({ zoomLevel: next })
  }, [])

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
    <div className="border-border/40 bg-background/80 mobile-chapter-toolbar sticky z-30 flex items-center border-b px-4 py-2 backdrop-blur-md">
      <div className="w-18" aria-hidden="true" />
      <div className="flex flex-1 justify-center">
        <QuranModeSelector
          onWordModeIntercept={onWordModeIntercept}
          onModeChanged={onModeChanged}
        />
      </div>
      <div className="flex w-18 justify-end gap-1">
        <button
          type="button"
          aria-label="Decrease text size"
          disabled={zoomIndex <= 0}
          onClick={() => stepZoom(-1)}
          className="text-muted-foreground active:bg-accent flex size-8 items-center justify-center rounded-full disabled:opacity-35"
        >
          <AArrowDown className="size-4.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Increase text size"
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          onClick={() => stepZoom(1)}
          className="text-muted-foreground active:bg-accent flex size-8 items-center justify-center rounded-full disabled:opacity-35"
        >
          <AArrowUp className="size-4.5" aria-hidden="true" />
        </button>
      </div>
      <ModeChangeToast announcement={announcement} />
      <WordBundleSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
