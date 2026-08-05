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
      className="flex flex-col gap-1 p-3 rounded-xl border border-dashed border-border/60 bg-muted/10 hover:bg-muted/40 hover:border-primary/30 transition-all group text-left"
    >
      <Shuffle className="size-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
      <span className="text-sm font-medium leading-snug text-muted-foreground group-hover:text-foreground transition-colors">
        {t('randomVerse')}
      </span>
    </button>
  )
}
