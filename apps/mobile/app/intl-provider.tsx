'use client'

import { useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Preferences } from '@capacitor/preferences'
import {
  DEFAULT_LOCALE,
  directionFor,
  isLocale,
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

const LOCALE_PREF_KEY = 'locale'

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

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = directionFor(locale)
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
