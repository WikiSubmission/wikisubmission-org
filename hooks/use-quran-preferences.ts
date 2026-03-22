import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * ISO 639-1 lang codes used by the ws-backend API.
 * `xl` is a non-standard code for transliterated Arabic (Latin script) — has no API equivalent yet.
 */
export type LangCode =
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

export type DisplayMode = 'verse' | 'word' | 'reading'

export type QuranPreferences = {
  arabic: boolean
  subtitles: boolean
  footnotes: boolean
  transliteration: boolean
  text: boolean
  wordByWord: boolean
  displayMode: DisplayMode
  showVerseNumbers: boolean
  primaryLanguage: LangCode
  secondaryLanguage?: LangCode
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
      primaryLanguage: getLocaleCookie(),
      secondaryLanguage: undefined,
      setPreferences: (preferences: QuranPreferences) => set(preferences),
    }),
    {
      name: 'quran-preferences-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
