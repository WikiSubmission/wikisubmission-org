import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ZoomLevel } from '@/lib/quran-zoom'

/**
 * ISO 639-1 lang codes used by the ws-backend API.
 * `xl` is a non-standard code for transliterated Arabic (Latin script) — has no API equivalent yet.
 */
export type LangCode =
  | 'none' // No translation language selected
  | 'en' // English
  | 'ar' // Arabic
  | 'fr' // French
  | 'de' // German
  | 'tr' // Turkish
  | 'id' // Bahasa Indonesia
  | 'fa' // Persian
  | 'ta' // Tamil
  | 'sv' // Swedish
  | 'ru' // Russian
  | 'bn' // Bengali
  | 'es' // Spanish
  | 'ur' // Urdu
  | 'xl' // Transliterated (custom, not sent to API)

export type DisplayMode = 'verse' | 'reading'
export type ReadingModeLang = 'translation' | 'arabic'
/**
 * Primary action when a word in the verse view is tapped/clicked.
 * - `play`    — play the word's audio. Long-press (touch) or right-click (mouse) opens the details dialog.
 * - `details` — open the word details dialog. Long-press (touch) or right-click (mouse) plays the audio.
 */
export type WordTapAction = 'play' | 'details'

export type WordLabSections = {
  derivs: boolean
  occurrences: boolean
  morphology: boolean
}

export type QuranPreferences = {
  arabic: boolean
  subtitles: boolean
  footnotes: boolean
  transliteration: boolean
  text: boolean
  wordByWord: boolean
  displayMode: DisplayMode
  showVerseNumbers: boolean
  readingModeLang: ReadingModeLang
  primaryLanguage: LangCode
  secondaryLanguage?: LangCode
  zoomLevel: ZoomLevel
  wordLabSections: WordLabSections
  wordTapAction: WordTapAction
  setPreferences: (preferences: QuranPreferences) => void
}

/** Read the UI locale cookie — used only to seed the initial primaryLanguage default. */
function getLocaleCookie(): LangCode {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
  return (match?.[1] as LangCode) ?? 'en'
}

export const useQuranPreferences = create(
  persist<QuranPreferences>(
    (set) => ({
      arabic: true,
      subtitles: true,
      footnotes: true,
      transliteration: false,
      text: true,
      wordByWord: false,
      displayMode: 'verse' as DisplayMode,
      showVerseNumbers: true,
      readingModeLang: 'translation' as ReadingModeLang,
      primaryLanguage: getLocaleCookie(),
      secondaryLanguage: undefined,
      zoomLevel: 'comfortable' as ZoomLevel,
      wordLabSections: {
        derivs: true,
        occurrences: true,
        morphology: false,
      },
      wordTapAction: 'play' as WordTapAction,
      setPreferences: (preferences: QuranPreferences) => set(preferences),
    }),
    {
      name: 'quran-preferences-v4',
      storage: createJSONStorage(() => localStorage),
      version: 8,
      migrate: (state, version) => {
        let next = state as Omit<QuranPreferences, 'displayMode' | 'wordLabSections'> & {
          displayMode?: string
          wordLabSections?: WordLabSections
          wordTapAction?: WordTapAction
        }
        if (version < 4) {
          next = { ...next, zoomLevel: 'comfortable' as ZoomLevel }
        }
        if (version < 5) {
          if (next.displayMode === 'word') {
            next = { ...next, displayMode: 'verse', wordByWord: true }
          }
        }
        if (version < 6) {
          next = {
            ...next,
            wordLabSections: { derivs: true, occurrences: true, morphology: false },
          }
        }
        if (version < 7) {
          next = { ...next, wordTapAction: 'play' as WordTapAction }
        }
        if (version < 8) {
          next = { ...next, text: true }
        }
        return next as QuranPreferences
      },
    }
  )
)
