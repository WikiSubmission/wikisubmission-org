'use client'

import { useRouter } from 'next/navigation'
import { Shuffle } from 'lucide-react'
import { VERSE_COUNTS } from '@/constants/quran-chapters'
import { useTranslations } from 'next-intl'

export function RandomVerseTile() {
  const router = useRouter()
  const t = useTranslations('common')

  const go = () => {
    const chapter = Math.floor(Math.random() * 114) + 1
    const verse = Math.floor(Math.random() * VERSE_COUNTS[chapter - 1]) + 1
    router.push(`/quran/${chapter}?verse=${verse}`)
  }

  return (
    <button
      onClick={go}
      type="button"
      className="flex flex-col justify-between p-3.5 rounded-lg border border-dashed transition-all duration-200 group text-left cursor-pointer hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--ed-surface)',
        borderColor: 'var(--ed-rule)',
      }}
    >
      <div className="flex items-center gap-1.5 text-[var(--ed-accent)] mb-1">
        <Shuffle className="size-3 shrink-0" />
        <span
          style={{
            fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
            fontSize: 9.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Random
        </span>
      </div>
      <span
        className="text-sm font-medium leading-snug group-hover:text-[var(--ed-accent)] transition-colors"
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          color: 'var(--ed-fg-muted)',
        }}
      >
        {t('randomVerse')}
      </span>
    </button>
  )
}
