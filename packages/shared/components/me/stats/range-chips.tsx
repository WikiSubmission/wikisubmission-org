'use client'

import { useTranslations } from 'next-intl'
import type { ReadingStatsRange } from '@/types/bookmarks'

interface RangeChipsProps {
  value: ReadingStatsRange
  onChange: (next: ReadingStatsRange) => void
}

const RANGES: { value: ReadingStatsRange; labelKey: string }[] = [
  { value: '7d', labelKey: 'range7d' },
  { value: '30d', labelKey: 'range30d' },
  { value: '90d', labelKey: 'range90d' },
  { value: '1y', labelKey: 'range1y' },
  { value: 'all', labelKey: 'allTime' },
]

export function RangeChips({ value, onChange }: RangeChipsProps) {
  const t = useTranslations('meStats')
  return (
    <div role="group" aria-label={t('timeRange')} className="rs-chips">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          aria-pressed={value === r.value}
          className="rs-chip"
          onClick={() => onChange(r.value)}
        >
          {t(r.labelKey)}
        </button>
      ))}
    </div>
  )
}
