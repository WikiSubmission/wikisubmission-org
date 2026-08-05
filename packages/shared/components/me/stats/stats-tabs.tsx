'use client'

import { useTranslations } from 'next-intl'
import type { StatsView } from './theme'

interface StatsTabsProps {
  value: StatsView
  onChange: (next: StatsView) => void
}

const TABS: { value: StatsView; labelKey: string }[] = [
  { value: 'quran', labelKey: 'navbar.quran' },
  { value: 'bible', labelKey: 'navbar.bible' },
  { value: 'combined', labelKey: 'meStats.combined' },
]

export function StatsTabs({ value, onChange }: StatsTabsProps) {
  const t = useTranslations()
  return (
    <div role="tablist" aria-label={t('meCollections.scripture')} className="rs-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className="rs-tab"
          onClick={() => onChange(tab.value)}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  )
}
