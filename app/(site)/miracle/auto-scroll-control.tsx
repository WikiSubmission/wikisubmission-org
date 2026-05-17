'use client'

import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AutoScrollControlProps {
  isPlaying: boolean
  onToggle: () => void
}

export function AutoScrollControl({ isPlaying, onToggle }: AutoScrollControlProps) {
  const t = useTranslations('miracle')

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <button
        onClick={onToggle}
        aria-pressed={isPlaying}
        aria-label={t('autoScrollLabel')}
        className="flex items-center gap-2 bg-[var(--ed-surface)]/80 border border-[var(--ed-rule)] backdrop-blur-sm rounded-full px-4 py-2 hover:border-[var(--ed-accent)]/50 transition-colors"
      >
        {isPlaying ? (
          <Pause size={10} className="text-[var(--ed-accent)]" />
        ) : (
          <Play size={10} className="text-[var(--ed-accent)]" />
        )}
        <span
          className="font-mono uppercase text-[10px] tracking-widest text-[var(--ed-fg-muted)]"
        >
          {isPlaying ? t('autoScrollPause') : t('autoScrollResume')}
        </span>
      </button>
    </div>
  )
}
