'use client'

import { useMemo } from 'react'
import { useQuranPreferences, type QuranPreferences } from '@/hooks/use-quran-preferences'
import type { CopyMarkdownOptions } from '@/lib/quran-copy'
import type { CopyImageOptions } from '@/lib/quran-copy-image'

/**
 * Maps reader preferences onto the options the copy builders take.
 *
 * Kept in one place because four surfaces need the identical mapping — the
 * per-verse copy button, the copy-all dropdown, the multi-select bar, and the
 * command menu — and they had drifted into three near-identical private copies.
 * The `xl`/`none` language guards in particular are easy to half-remember: `xl`
 * is transliterated Arabic with no API equivalent, and `none` means the reader
 * has turned translations off entirely.
 */
export interface CopyPrefsSnapshot {
  /** For buildVerseMarkdown / buildWordByWordMarkdown / buildVerseTable. */
  markdown: CopyMarkdownOptions
  /** For copyVerseImage / copyVersesImage. */
  image: CopyImageOptions
}

export function copyPrefsFrom(prefs: QuranPreferences): CopyPrefsSnapshot {
  const primaryCode =
    prefs.primaryLanguage !== 'xl' && prefs.primaryLanguage !== 'none'
      ? prefs.primaryLanguage
      : 'en'
  const secondaryCode =
    prefs.secondaryLanguage &&
    prefs.secondaryLanguage !== 'xl' &&
    prefs.secondaryLanguage !== 'none'
      ? prefs.secondaryLanguage
      : undefined
  const includeText = prefs.text && prefs.primaryLanguage !== 'none'

  const markdown: CopyMarkdownOptions = {
    primaryCode,
    secondaryCode,
    includeText,
    includeArabic: prefs.arabic,
    includeSubtitles: prefs.subtitles,
    includeTransliteration: prefs.transliteration,
    includeFootnotes: prefs.footnotes,
  }

  return {
    markdown,
    image: {
      prefs: {
        primaryCode,
        secondaryCode,
        includeText,
        includeArabic: prefs.arabic,
        includeTransliteration: prefs.transliteration,
        includeFootnotes: prefs.footnotes,
      },
    },
  }
}

export function useCopyPrefs(): CopyPrefsSnapshot {
  const prefs = useQuranPreferences()
  return useMemo(() => copyPrefsFrom(prefs), [prefs])
}
