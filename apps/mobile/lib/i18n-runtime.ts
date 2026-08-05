import { createTranslator, type Messages } from 'next-intl'

import en from '@/messages/en.json'
import { DEFAULT_LOCALE, type Locale } from '@/constants/locales'

/**
 * Translation for code that runs outside React.
 *
 * Notification titles and bodies, Android channel names, and auth error
 * messages are all produced by plain modules under lib/ — they cannot call
 * useTranslations(). IntlProvider pushes the active locale here on every
 * switch (setActiveMessages) and this module hands back a translator built on
 * the same catalog the component tree is rendering.
 *
 * Seeded with English at module load, so a call that lands before hydration
 * returns real copy rather than throwing or leaking a key path.
 */

let activeLocale: Locale = DEFAULT_LOCALE
let activeMessages = en as unknown as Messages
let translator = createTranslator({ locale: activeLocale, messages: activeMessages })

type LocaleListener = (locale: Locale) => void
const listeners = new Set<LocaleListener>()

/**
 * Notified after the translator has been swapped, never before.
 *
 * Subscribe here rather than listening for LOCALE_CHANGED_EVENT directly: that
 * event fires from the settings switcher, ahead of IntlProvider applying the
 * catalog, so a subscriber that re-renders translated output off it would read
 * the *previous* language. Anything that must produce text in the new locale —
 * rescheduling notifications, relabelling Android channels — belongs here.
 *
 * Returns an unsubscribe function.
 */
export function onActiveLocaleChange(listener: LocaleListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Called by IntlProvider whenever the resolved locale/catalog changes. */
export function setActiveMessages(locale: Locale, messages: Messages): void {
  const changed = locale !== activeLocale
  activeLocale = locale
  activeMessages = messages
  translator = createTranslator({ locale, messages })
  if (!changed) return
  for (const listener of listeners) {
    try {
      listener(locale)
    } catch {
      // One bad subscriber must not stop the others.
    }
  }
}

/** The locale currently driving translate() — matches what the UI renders. */
export function activeTranslationLocale(): Locale {
  return activeLocale
}

/**
 * Translate a full dotted key path ("notifications.prayerTitle").
 *
 * Never throws: a missing key falls back to the key path so imperative
 * callers (notification scheduling, channel creation) cannot be broken by a
 * catalog gap. The Phase-0 en fallback in IntlProvider means this should only
 * ever trigger for a key that is missing from en.json too.
 */
export function translate(key: string, values?: Record<string, string | number>): string {
  try {
    // next-intl's namespace-less translator accepts the full path.
    return translator(key as never, values as never)
  } catch {
    return key
  }
}

/** Escape hatch for callers that need the raw catalog (e.g. building a map). */
export function activeTranslationMessages(): Messages {
  return activeMessages
}
