'use client'

import type { StatsView } from './theme'

interface StatsTabsProps {
  value: StatsView
  onChange: (next: StatsView) => void
}

const TABS: { value: StatsView; label: string }[] = [
  { value: 'quran', label: 'Quran' },
  { value: 'bible', label: 'Bible' },
  { value: 'combined', label: 'Combined' },
]

export function StatsTabs({ value, onChange }: StatsTabsProps) {
  return (
    <div role="tablist" aria-label="Scripture" className="rs-tabs">
      {TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          className="rs-tab"
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
