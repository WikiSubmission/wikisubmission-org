'use client'

import { useLocale } from 'next-intl'
import { Check } from 'lucide-react'
import { Preferences } from '@capacitor/preferences'
import {
  LOCALE_CHANGED_EVENT,
  LOCALE_LABELS,
  LOCALE_PREF_KEY,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/constants/locales'
import { cn } from '@/lib/utils'

/**
 * App UI language switcher. Persists to Capacitor Preferences (the read side
 * lives in IntlProvider) and applies live via the locale-changed event — no
 * restart; RTL flips through IntlProvider's html[dir] effect.
 */
export function AppLanguageSelector() {
  const locale = useLocale()

  const select = (next: Locale) => {
    if (next === locale) return
    Preferences.set({ key: LOCALE_PREF_KEY, value: next }).catch(() => {
      // Persistence failure only loses the choice across restarts.
    })
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: next }))
  }

  return (
    <ul className="divide-border/40 border-border/40 divide-y rounded-xl border">
      {SUPPORTED_LOCALES.map((code) => {
        const isActive = code === locale
        return (
          <li key={code}>
            <button
              type="button"
              onClick={() => select(code)}
              aria-pressed={isActive}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-foreground text-sm">{LOCALE_LABELS[code]}</span>
              <Check
                className={cn('text-primary size-4', !isActive && 'invisible')}
                aria-hidden="true"
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
