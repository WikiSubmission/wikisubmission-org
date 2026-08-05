import { IntlErrorCode, type IntlError } from 'next-intl'

/**
 * Shared next-intl error handler.
 *
 * The translated catalogs trail en.json — new copy lands in English first — and
 * mergeMessages() already substitutes the English string for anything missing.
 * So MISSING_MESSAGE is an expected, already-handled condition: warn while
 * developing, stay quiet in production. Every other IntlError (malformed ICU,
 * wrong value type) is a genuine bug and stays loud.
 */
export function onIntlError(error: IntlError): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV !== 'production') console.warn(error.message)
    return
  }
  console.error(error)
}
