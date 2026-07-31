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
