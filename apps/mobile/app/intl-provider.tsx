'use client'

import { useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Preferences } from '@capacitor/preferences'
import {
  DEFAULT_LOCALE,
  directionFor,
  isLocale,
  LOCALE_CHANGED_EVENT,
  LOCALE_PREF_KEY,
  type Locale,
} from '@/constants/locales'

import en from '@/messages/en.json'
import ar from '@/messages/ar.json'
import de from '@/messages/de.json'
import fr from '@/messages/fr.json'
import ku from '@/messages/ku.json'
import tr from '@/messages/tr.json'

// All message catalogs are statically bundled (they are small) so locale
// switching is instant and works fully offline inside the webview.
const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en,
  ar,
  de,
  fr,
  ku,
  tr,
}

/**
 * Client-side i18n provider for the static-export mobile app. There is no
 * server locale negotiation, so the first paint renders the default locale,
 * then the stored preference (if any) is applied on mount.
 */
export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    let cancelled = false
    Preferences.get({ key: LOCALE_PREF_KEY })
      .then(({ value }) => {
        if (cancelled || !value || !isLocale(value)) return
        setLocale(value)
      })
      .catch(() => {
        // No stored preference / bridge unavailable: keep the default locale.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Live locale switching from the settings screen (which persists the
  // preference and fires this event).
  useEffect(() => {
    const onLocaleChanged = (event: Event) => {
      const next = (event as CustomEvent<string>).detail
      if (isLocale(next)) setLocale(next)
    }
    window.addEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = directionFor(locale)
  }, [locale])

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={MESSAGES[locale]}
      // Pinned so the static-export prerender (build machine tz) and the client
      // render agree, avoiding next-intl markup-mismatch warnings. All in-app
      // date/time formatting is locale-driven, not tz-sensitive.
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  )
}
