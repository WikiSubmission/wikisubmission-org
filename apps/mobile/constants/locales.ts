// Locales the mobile app ships messages for. Mirrors the JSON files in
// packages/shared/messages. Keep in sync when a new translation lands.
export const SUPPORTED_LOCALES = ['en', 'ar', 'de', 'fr', 'ku', 'tr'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

// Right-to-left scripts among the supported locales.
const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'ku'])

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function directionFor(locale: string): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}
