/**
 * The UI locale list, shared by every language switcher and every place that
 * needs text direction.
 *
 * This used to be copy-pasted: the switcher array lived in three components and
 * the RTL set in four more, so adding a locale meant seven edits and any missed
 * one silently shipped a half-registered language. One list now, imported
 * everywhere.
 *
 * Kurdish is deliberately two entries. `ckb` is Central Kurdish (Sorani),
 * right-to-left in Arabic script; `kmr` is Northern Kurdish (Kurmanji),
 * left-to-right in Latin script. A single `ku` locale could not express the
 * direction or script difference and its catalog held a mix of both.
 *
 * The mobile app keeps its own `apps/mobile/constants/locales.ts` — it needs
 * extra machinery (Capacitor preference key, change event, lazy-import map) and
 * the `@/*` alias resolves the app-local file first by design.
 */

export interface UiLocale {
  /** BCP-47 code; also the messages/<code>.json filename and cookie value. */
  code: string
  /** Short uppercase tag for compact switchers. */
  label: string
  /** Endonym — always shown in the language's own script. */
  name: string
  dir: 'ltr' | 'rtl'
}

/**
 * Right-to-left language codes. Broader than UI_LOCALES on purpose: direction is
 * a property of the language, not of whether a catalog ships yet. `fa` and `ur`
 * are listed so the layout already renders them correctly the moment their
 * catalogs land — the previous hardcoded RTL sets anticipated them the same way.
 */
const RTL_LANGUAGE_CODES: ReadonlySet<string> = new Set(['ar', 'ckb', 'fa', 'ur'])

function entry(code: string, label: string, name: string): UiLocale {
  return { code, label, name, dir: RTL_LANGUAGE_CODES.has(code) ? 'rtl' : 'ltr' }
}

export const UI_LOCALES: readonly UiLocale[] = [
  entry('en', 'EN', 'English'),
  entry('ar', 'AR', 'العربية'),
  entry('ckb', 'CKB', 'کوردیی ناوەندی'),
  entry('de', 'DE', 'Deutsch'),
  entry('fr', 'FR', 'Français'),
  entry('kmr', 'KMR', 'Kurmancî'),
  entry('tr', 'TR', 'Türkçe'),
]

export const DEFAULT_UI_LOCALE = 'en'

/**
 * Retired codes mapped to their replacement, so a cookie written by an older
 * build still resolves. `ku` becomes `ckb`: the old catalog was predominantly
 * Sorani and rendered right-to-left, so Sorani is what those readers had.
 *
 * Locales that are RTL-ready in the layout but have no catalog yet (`fa`, `ur`)
 * are intentionally absent — see the i18n follow-up notes.
 */
export const LEGACY_UI_LOCALE_ALIASES: Readonly<Record<string, string>> = {
  ku: 'ckb',
}

const BY_CODE = new Map(UI_LOCALES.map((l) => [l.code, l]))

export function isUiLocale(value: string | null | undefined): boolean {
  return !!value && BY_CODE.has(value)
}

/** Resolve a cookie/query value, following legacy aliases; null when unknown. */
export function resolveUiLocale(value: string | null | undefined): string | null {
  if (!value) return null
  if (BY_CODE.has(value)) return value
  return LEGACY_UI_LOCALE_ALIASES[value] ?? null
}

/**
 * Text direction for a language code, whether or not it is a shipped UI locale.
 * Unknown codes get `ltr` rather than throwing.
 */
export function directionForUiLocale(value: string | null | undefined): 'ltr' | 'rtl' {
  return value && RTL_LANGUAGE_CODES.has(value) ? 'rtl' : 'ltr'
}

/**
 * The language content is requested in when no locale resolves to one.
 *
 * Separate from DEFAULT_UI_LOCALE despite sharing a value: one names the catalog
 * the interface falls back to, the other the catalog the backend reads scripture
 * from. They are free to diverge.
 */
export const DEFAULT_CONTENT_LANG = 'en'

/**
 * The content language each UI locale reads scripture and metadata in.
 *
 * UI locales and the backend's content languages are two registries that merely
 * happen to share codes for five of the seven entries. The backend validates
 * `lang` / `langs` against its own languages table and answers 400 for anything
 * absent, so a UI locale has to be translated before it reaches the API —
 * passing `ckb` through unmapped is what made /quran render "Something went
 * wrong" for Kurdish readers instead of a reader.
 *
 * Both Kurdish locales map to English, not to the backend's `ku`. That row
 * exists in the registry (ws-backend migration 026) but no Kurdish chapters,
 * appendices, or verses were ever seeded behind it, so `lang=ku` answers 200
 * with an empty array — which reads as an empty chapter picker rather than a
 * failure. English titles are a fallback a reader can see past. When Kurdish
 * content is seeded, point `ckb`/`kmr` at `ku` here and every call site follows.
 *
 * Codes are listed explicitly rather than defaulted through, so adding a UI
 * locale forces a decision about what it reads instead of silently 400ing.
 */
const CONTENT_LANG_BY_UI_LOCALE: Readonly<Record<string, string>> = {
  en: 'en',
  ar: 'ar',
  ckb: DEFAULT_CONTENT_LANG,
  de: 'de',
  fr: 'fr',
  kmr: DEFAULT_CONTENT_LANG,
  tr: 'tr',
}

/**
 * The content language code to send to the backend for a UI locale.
 *
 * Use this for every `lang` / `langs` query param on content endpoints
 * (`/chapters`, `/appendices`, `/quran`). It is deliberately NOT for
 * `/site/search`, whose `lang` indexes the UI locale itself and does accept
 * `ckb` and `kmr`.
 *
 * Follows legacy aliases, and answers English for unknown codes rather than
 * throwing — a bad cookie should cost a reader their translation, not the page.
 */
export function contentLangForUiLocale(value: string | null | undefined): string {
  if (!value) return DEFAULT_CONTENT_LANG
  const resolved = resolveUiLocale(value) ?? value
  return CONTENT_LANG_BY_UI_LOCALE[resolved] ?? DEFAULT_CONTENT_LANG
}
