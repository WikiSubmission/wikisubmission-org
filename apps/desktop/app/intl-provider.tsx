'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
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

import en from '@/messages/en.json'

type Messages = Record<string, unknown>

// Only English is in the startup chunk; the other catalogs load on demand and
// are bundled as their own chunks, so switching works offline.
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
  // Layered over English so a key a translation has not caught up on renders
  // real copy instead of its dotted path.
  return mergeMessages(en as MessageCatalog, mod.default as MessageCatalog) as Messages
}

function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_PREF_KEY)
  } catch {
    return null
  }
}

function writeStoredLocale(value: string): void {
  try {
    window.localStorage.setItem(LOCALE_PREF_KEY, value)
  } catch {
    // Storage unavailable: the choice lasts for this session only.
  }
}

/**
 * Client-side i18n for the static export. The first paint uses English, then
 * the stored choice (or the system language) is applied on mount. The language
 * switcher persists its choice and fires LOCALE_CHANGED_EVENT.
 */
export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<Messages>(en as Messages)
  // Monotonic ticket so a slow catalog load never overrides a newer switch.
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
        // Chunk load failure: stay on the current locale.
      })
  }, [])

  useEffect(() => {
    const raw = readStoredLocale()
    const stored = resolveLocale(raw)
    if (stored) {
      if (stored !== raw) writeStoredLocale(stored)
      applyLocale(stored)
      return
    }
    // No choice yet: follow the system language list, without persisting, so a
    // later system change is still picked up.
    const detected = detectSystemLocale(navigator.languages ?? [navigator.language])
    if (detected) applyLocale(detected)
  }, [applyLocale])

  useEffect(() => {
    const onLocaleChanged = (event: Event) => {
      const next = resolveLocale((event as CustomEvent<string>).detail)
      if (!next) return
      writeStoredLocale(next)
      applyLocale(next)
    }
    window.addEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, onLocaleChanged)
  }, [applyLocale])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = directionFor(locale)
  }, [locale])

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={onIntlError}
      // Pinned so the build-time prerender and the client render agree.
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  )
}
