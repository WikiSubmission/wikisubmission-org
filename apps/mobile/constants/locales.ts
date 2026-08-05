// Locales the mobile app ships messages for. Mirrors the JSON files in
// packages/shared/messages. Keep in sync when a new translation lands.
//
// Kurdish is two separate languages, not one: `ckb` is Central Kurdish
// (Sorani), written right-to-left in Arabic script, and `kmr` is Northern
// Kurdish (Kurmanji), written left-to-right in Latin script. They were
// previously collapsed into a single `ku` catalog that in practice held both —
// Sorani for most namespaces, Kurmanji for games/chat/userMenu — so a Kurdish
// reader saw a mix of two scripts. See LEGACY_LOCALE_ALIASES below.
export const SUPPORTED_LOCALES = ['en', 'ar', 'ckb', 'de', 'fr', 'kmr', 'tr'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Capacitor Preferences key holding the chosen UI locale. */
export const LOCALE_PREF_KEY = 'locale'

/** Window event dispatched when the in-app language switcher writes a new
 * locale, so IntlProvider re-renders without an app restart. */
export const LOCALE_CHANGED_EVENT = 'ws-locale-changed'

/**
 * Retired locale codes mapped to their replacement, so a preference stored by
 * an older build still resolves instead of silently dropping to English.
 *
 * `ku` resolves to `ckb`: the old catalog was predominantly Sorani and was
 * rendered right-to-left, so Sorani is what those users were actually reading.
 */
export const LEGACY_LOCALE_ALIASES: Readonly<Record<string, Locale>> = {
  ku: 'ckb',
}

/** Native display names shown in the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ckb: 'کوردیی ناوەندی',
  de: 'Deutsch',
  fr: 'Français',
  kmr: 'Kurmancî',
  tr: 'Türkçe',
}

// Right-to-left scripts among the supported locales. Sorani is RTL (Arabic
// script); Kurmanji is LTR (Latin script) — the distinction the single `ku`
// locale could not express.
const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'ckb'])

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Resolve a stored or incoming locale string, following legacy aliases.
 * Returns null when the value is not a locale this build knows.
 */
export function resolveLocale(value: string | null | undefined): Locale | null {
  if (!value) return null
  if (isLocale(value)) return value
  return LEGACY_LOCALE_ALIASES[value] ?? null
}

export function directionFor(locale: string): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}
