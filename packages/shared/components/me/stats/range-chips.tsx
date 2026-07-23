'use client'

import type { ReadingStatsRange } from '@/types/bookmarks'

interface RangeChipsProps {
  value: ReadingStatsRange
  onChange: (next: ReadingStatsRange) => void
}

const RANGES: { value: ReadingStatsRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
]

export function RangeChips({ value, onChange }: RangeChipsProps) {
  return (
    <div role="group" aria-label="Time range" className="rs-chips">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          aria-pressed={value === r.value}
          className="rs-chip"
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
