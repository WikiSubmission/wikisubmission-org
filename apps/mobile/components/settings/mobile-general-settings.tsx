'use client'

import { useTranslations } from 'next-intl'
import { AppLanguageSelector } from '@/components/settings/app-language-selector'
import { ThemeSelector } from '@/components/settings/theme-selector'

/**
 * Mobile-only cards injected at the top of the shared settings screen's
 * general tab (generalExtrasSection slot): app UI language and appearance.
 */
export function MobileGeneralSettings() {
  const t = useTranslations('meSettings')

  return (
    <div className="space-y-4">
      <section className="border-border/50 bg-background/55 rounded-2xl border p-5 backdrop-blur-md">
        <h2 className="text-foreground text-sm font-semibold">{t('appearance.heading')}</h2>
        <p className="text-muted-foreground mt-0.5 mb-4 text-xs">{t('appearance.body')}</p>
        <ThemeSelector />
      </section>

      <section className="border-border/50 bg-background/55 rounded-2xl border p-5 backdrop-blur-md">
        <h2 className="text-foreground text-sm font-semibold">{t('language.heading')}</h2>
        <p className="text-muted-foreground mt-0.5 mb-4 text-xs">{t('language.body')}</p>
        <AppLanguageSelector />
      </section>
    </div>
  )
}
