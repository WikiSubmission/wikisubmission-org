'use client'

import { useEffect } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'

export type QuranModeId = 'verse' | 'word' | 'reading'

/**
 * The reader's three display modes, folded out of the two preferences that
 * actually store them (`displayMode` + `wordByWord`).
 *
 * Both the header's segmented control and the settings panel's mode row drive
 * this, so the rules that are easy to get wrong — word mode needing the Arabic
 * it annotates, reading mode being unavailable on search and verse-list routes
 * — live in one place rather than in each control.
 */
export function useQuranDisplayMode({
  readingBlocked = false,
  onWordModeIntercept,
  onModeChanged,
}: {
  /** Search results and verse lists have no single-chapter flow to read. */
  readingBlocked?: boolean
  /** Gate before enabling word mode; return false to keep the current mode. */
  onWordModeIntercept?: () => boolean | Promise<boolean>
  /** Fires only when the mode actually changed. */
  onModeChanged?: (mode: QuranModeId) => void
} = {}) {
  const prefs = useQuranPreferences()

  const activeMode: QuranModeId =
    prefs.displayMode === 'reading' ? 'reading' : prefs.wordByWord ? 'word' : 'verse'

  useEffect(() => {
    if (!readingBlocked) return
    if (prefs.displayMode !== 'reading') return
    prefs.patchPreferences({ displayMode: 'verse' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingBlocked, prefs.displayMode])

  const setMode = async (mode: QuranModeId) => {
    if (mode === activeMode) return
    if (mode === 'reading' && readingBlocked) return
    if (mode === 'reading') {
      prefs.patchPreferences({ displayMode: 'reading' })
    } else if (mode === 'word') {
      if (onWordModeIntercept && (await onWordModeIntercept()) === false) return
      // Word-by-word is meaningless without the Arabic it annotates.
      prefs.patchPreferences({ displayMode: 'verse', wordByWord: true, arabic: true })
    } else {
      prefs.patchPreferences({ displayMode: 'verse', wordByWord: false })
    }
    onModeChanged?.(mode)
  }

  return { activeMode, setMode, readingBlocked }
}
