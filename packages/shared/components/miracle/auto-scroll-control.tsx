'use client'

import { Minus, Pause, Play, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AutoScrollControlProps {
  isPlaying: boolean
  speedIndex: number
  speedCount: number
  multiplier: number
  onToggle: () => void
  onSpeedUp: () => void
  onSpeedDown: () => void
}

export function AutoScrollControl({
  isPlaying,
  speedIndex,
  speedCount,
  multiplier,
  onToggle,
  onSpeedUp,
  onSpeedDown,
}: AutoScrollControlProps) {
  const t = useTranslations('miracle')

  const pillClass =
    'flex items-center justify-center bg-[var(--ed-surface)] border border-[var(--ed-rule)] hover:border-[var(--ed-accent)]/50 transition-colors'

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center">
      <button
        onClick={onSpeedDown}
        disabled={speedIndex === 0}
        aria-label={t('autoScrollSlower')}
        className={`${pillClass} pl-3 pr-2.5 py-2 border-r-0 disabled:opacity-30`}
      >
        <Minus size={10} className="text-[var(--ed-accent)]" />
      </button>

      <button
        onClick={onToggle}
        aria-pressed={isPlaying}
        aria-label={t('autoScrollLabel')}
        className={`${pillClass} gap-2 px-4 py-2 border-x-0`}
      >
        {isPlaying ? (
          <Pause size={10} className="text-[var(--ed-accent)]" />
        ) : (
          <Play size={10} className="text-[var(--ed-accent)]" />
        )}
        <span
          className="uppercase text-[10px] tracking-widest text-[var(--ed-fg-muted)]"
          style={{ fontFamily: 'var(--font-glacial), sans-serif' }}
        >
          {isPlaying ? t('autoScrollPause') : t('autoScrollResume')}
        </span>
        <span
          className="text-[9px] text-[var(--ed-accent)] opacity-60 tabular-nums"
          style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}
        >
          {multiplier}x
        </span>
      </button>

      <button
        onClick={onSpeedUp}
        disabled={speedIndex === speedCount - 1}
        aria-label={t('autoScrollFaster')}
        className={`${pillClass} pl-2.5 pr-3 py-2 border-l-0 disabled:opacity-30`}
      >
        <Plus size={10} className="text-[var(--ed-accent)]" />
      </button>
    </div>
  )
}
