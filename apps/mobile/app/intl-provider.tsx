'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Preferences } from '@capacitor/preferences'
import {
  DEFAULT_LOCALE,
  detectSystemLocale,
  directionFor,
  LOCALE_CHANGED_EVENT,
  LOCALE_PREF_KEY,
  resolveLocale,
  type Locale,
} from '@/constants/locales'
import { mergeMessages, type MessageCatalog } from '@/lib/merge-messages'
import { onIntlError } from '@/lib/intl-error'
import { setActiveMessages } from '@/lib/i18n-runtime'

import en from '@/messages/en.json'

type Messages = Record<string, unknown>

// Only the default catalog is bundled into the startup chunk. The other six
// (~380 KB of source combined) load on demand: locale switching already goes
// through an async preference read, so one more dynamic import is invisible —
// and webpack keeps each catalog in its own chunk inside the static export,
// so switching still works fully offline in the webview.
const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Messages }>> = {
  ar: () => import('@/messages/ar.json'),
  ckb: () => import('@/messages/ckb.json'),
  de: () => import('@/messages/de.json'),
  fr: () => import('@/messages/fr.json'),
  kmr: () => import('@/messages/kmr.json'),
  tr: () => import('@/messages/tr.json'),
}

async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'en') return en as Messages
  const mod = await LOADERS[locale]()
  // Layered over English so a key the translated catalog has not caught up on
  // renders real copy instead of its dotted path. en is already in the startup
  // chunk, so this costs nothing extra to download.
  return mergeMessages(en as MessageCatalog, mod.default as MessageCatalog) as Messages
}

/**
 * Client-side i18n provider for the static-export mobile app. There is no
 * server locale negotiation, so the first paint renders the default locale,
 * then the stored preference (if any) is applied on mount.
 */
export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<Messages>(en as Messages)
  // Monotonic ticket so a slow catalog load can never clobber a newer switch.
  const loadTicket = useRef(0)

  const applyLocale = useCallback((next: Locale) => {
    const ticket = ++loadTicket.current
    loadMessages(next)
      .then((msgs) => {
        if (loadTicket.current !== ticket) return
        setMessages(msgs)
        setLocale(next)
      })
      .catch(() => {
        // Chunk load failure (corrupt install?): stay on the current locale.
      })
  }, [])

  useEffect(() => {
    let cancelled = false
    Preferences.get({ key: LOCALE_PREF_KEY })
      .then(({ value }) => {
        if (cancelled) return
        // resolveLocale, not isLocale: a build before the Kurdish split stored
        // `ku`, which must land on Sorani rather than fall back to English.
        const stored = resolveLocale(value)
        if (stored) {
          applyLocale(stored)
          if (stored !== value) {
            // Rewrite the preference so the alias is followed only once.
            void Preferences.set({ key: LOCALE_PREF_KEY, value: stored }).catch(() => {})
          }
          return
        }
        // No preference has ever been set: follow the device's language list.
        // Deliberately not persisted, so a later system-language change keeps
        // being picked up until the user overrides it from the picker.
        const detected = detectSystemLocale(navigator.languages ?? [navigator.language])
        if (detected) applyLocale(detected)
      })
      .catch(() => {
        // No stored preference / bridge unavailable: keep the default locale.
      })
    return () => {
      cancelled = true
    }
  }, [applyLocale])

  // Live locale switching from the settings screen (which persists the
  // preference and fires this event).
  useEffect(() => {
    const onLocaleChanged = (event: Event) => {
      const next = resolveLocale((event as CustomEvent<string>).detail)
      if (next) applyLocale(next)
    }
    window.addEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
  }, [applyLocale])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = directionFor(locale)
  }, [locale])

  // Hand the resolved catalog to the imperative translator so notification
  // copy, Android channel names and auth errors follow the UI language.
  useEffect(() => {
    setActiveMessages(locale, messages as Parameters<typeof setActiveMessages>[1])
  }, [locale, messages])

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={onIntlError}
      // Pinned so the static-export prerender (build machine tz) and the client
      // render agree, avoiding next-intl markup-mismatch warnings. All in-app
      // date/time formatting is locale-driven, not tz-sensitive.
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  )
}
