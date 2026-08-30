import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { contentLangForUiLocale } from '@/constants/ui-locales'
import { ZOOM_LEVELS, type ZoomLevel } from '@/lib/quran-zoom'

/**
 * ISO 639-1 lang codes used by the ws-backend API.
 * `xl` is a non-standard code for transliterated Arabic (Latin script) — has no API equivalent yet.
 *
 * A runtime list rather than a bare union because persisted preferences and the
 * locale cookie are both untrusted input that has to be checked against it — see
 * `isLangCode`. The type is derived so the two cannot drift.
 */
const LANG_CODES = [
  'none', // No translation language selected
  'en', // English
  'ar', // Arabic
  'fr', // French
  'de', // German
  'tr', // Turkish
  'id', // Bahasa Indonesia
  'fa', // Persian
  'ta', // Tamil
  'sv', // Swedish
  'ru', // Russian
  'bn', // Bengali
  'es', // Spanish
  'ur', // Urdu
  'xl', // Transliterated (custom, not sent to API)
] as const

export type LangCode = (typeof LANG_CODES)[number]

const LANG_CODE_SET: ReadonlySet<string> = new Set(LANG_CODES)

function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && LANG_CODE_SET.has(value)
}

/**
 * Coerce an untrusted stored/cookie value into a usable translation language.
 *
 * Anything already valid passes through. A UI locale is mapped to the language it
 * reads (`ckb` → `en`), and anything unrecognisable lands on English, so no code
 * the backend would 400 on can reach a request.
 */
function repairLangCode(value: unknown): LangCode {
  if (isLangCode(value)) return value
  const mapped = contentLangForUiLocale(typeof value === 'string' ? value : null)
  return isLangCode(mapped) ? mapped : 'en'
}

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
  /**
   * Merges a partial update, keeping `text` pinned to true.
   *
   * `text` has no UI toggle and every write path has forced it true since the v8
   * migration; enforcing that here means a caller cannot half-remember the rule.
   * Prefer this over `setPreferences` for anything that changes one or two keys —
   * the command menu, the settings panel, and the mode selector all do.
   */
  patchPreferences: (patch: Partial<QuranPreferences>) => void
}

/**
 * Whitelist + repair an untrusted preferences blob from `GET /me/preferences`.
 *
 * The backend stores the payload opaquely (`Record<string, unknown>`), so a
 * record written by an older client survives every migration below and would
 * otherwise be spread straight into the store — reintroducing exactly the
 * `ckb`/`kmr` primaryLanguage bug the v9 migration exists to fix. Anything not
 * recognised here is dropped rather than trusted.
 *
 * Two keys are deliberately never accepted from the server:
 * - `displayMode`, which is local-only view state (see `use-prefs-sync`)
 * - `text`, whose `true` invariant belongs to `patchPreferences`
 */
export function sanitiseRemotePreferences(remote: unknown): Partial<QuranPreferences> {
  if (!remote || typeof remote !== 'object') return {}
  const src = remote as Record<string, unknown>
  const out: Record<string, unknown> = {}

  const BOOLEAN_KEYS = [
    'arabic',
    'subtitles',
    'footnotes',
    'transliteration',
    'wordByWord',
    'showVerseNumbers',
  ] as const
  for (const key of BOOLEAN_KEYS) {
    if (typeof src[key] === 'boolean') out[key] = src[key]
  }

  if (src.primaryLanguage !== undefined) out.primaryLanguage = repairLangCode(src.primaryLanguage)
  // An unusable secondary is dropped, not repaired — it is optional, and
  // collapsing it onto English would collide with the primary.
  if ('secondaryLanguage' in src) {
    out.secondaryLanguage = isLangCode(src.secondaryLanguage) ? src.secondaryLanguage : undefined
  }

  if (src.readingModeLang === 'translation' || src.readingModeLang === 'arabic') {
    out.readingModeLang = src.readingModeLang
  }
  if (src.wordTapAction === 'play' || src.wordTapAction === 'details') {
    out.wordTapAction = src.wordTapAction
  }
  if (ZOOM_LEVELS.includes(src.zoomLevel as ZoomLevel)) out.zoomLevel = src.zoomLevel

  if (src.wordLabSections && typeof src.wordLabSections === 'object') {
    const s = src.wordLabSections as Record<string, unknown>
    out.wordLabSections = {
      derivs: typeof s.derivs === 'boolean' ? s.derivs : true,
      occurrences: typeof s.occurrences === 'boolean' ? s.occurrences : true,
      morphology: typeof s.morphology === 'boolean' ? s.morphology : false,
    }
  }

  return out as Partial<QuranPreferences>
}

/**
 * Read the UI locale cookie — used only to seed the initial primaryLanguage default.
 *
 * The cookie holds a UI locale, which is not interchangeable with a translation
 * language: `ckb` and `kmr` are shipped interface locales that the backend has no
 * content for, and it rejects the whole verse request with a 400 if one appears
 * in `langs`. Seeding the raw cookie value therefore left Kurdish readers with a
 * reader that could not load a single verse. repairLangCode maps the locale to a
 * code the backend serves.
 */
function getLocaleCookie(): LangCode {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
  return repairLangCode(match?.[1])
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
      patchPreferences: (patch: Partial<QuranPreferences>) =>
        set((state) => ({ ...state, ...patch, text: true })),
    }),
    {
      name: 'quran-preferences-v4',
      storage: createJSONStorage(() => localStorage),
      version: 9,
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
        if (version < 9) {
          // primaryLanguage was seeded straight from the UI locale cookie, so a
          // reader who ever browsed in Kurdish has `ckb`/`kmr` stored — codes the
          // backend 400s on, which failed every verse fetch the reader made.
          // An unusable secondary is dropped rather than repaired: it is optional,
          // and English is already covered by the primary it would collide with.
          next = {
            ...next,
            primaryLanguage: repairLangCode(next.primaryLanguage),
            secondaryLanguage: isLangCode(next.secondaryLanguage)
              ? next.secondaryLanguage
              : undefined,
          }
        }
        return next as QuranPreferences
      },
    }
  )
)
