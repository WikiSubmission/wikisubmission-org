'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { PaletteThemeSwitcher } from '@web/components/toggles/palette-theme-switcher'
import { BackupPanel } from '@/components/settings/backup-panel'
import { LOCALE_CHANGED_EVENT, LOCALE_LABELS, SUPPORTED_LOCALES } from '@/constants/locales'

// Desktop settings. The shared settings screen is built around a hosted
// account (email export, server-side deletion, consent, push notifications),
// none of which applies to the offline app, so this page is its own.
export default function SettingsPage() {
  const t = useTranslations('desktopSettings')
  const locale = useLocale()
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-10">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">{t('appearance')}</h2>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>{t('language')}</span>
          <select
            className="border-border bg-background rounded-md border px-2 py-1.5 text-sm"
            value={locale}
            onChange={(e) =>
              window.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: e.target.value }))
            }
          >
            {SUPPORTED_LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>{t('theme')}</span>
          <span className="flex items-center gap-2">
            <select
              className="border-border bg-background rounded-md border px-2 py-1.5 text-sm"
              value={theme ?? 'system'}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">{t('themeSystem')}</option>
              <option value="light">{t('themeLight')}</option>
              <option value="dark">{t('themeDark')}</option>
            </select>
            <PaletteThemeSwitcher />
          </span>
        </label>
      </section>

      <BackupPanel />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t('aboutTitle')}</h2>
        <p className="text-muted-foreground text-sm">{t('aboutOffline')}</p>
        <p className="text-muted-foreground text-xs">
          {t('aboutVersion', { version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev' })}
        </p>
      </section>
    </div>
  )
}
