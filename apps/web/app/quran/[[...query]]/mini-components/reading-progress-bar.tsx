'use client'

import { useReadingProgress } from '@/hooks/use-reading-progress'
import { useSession } from 'next-auth/react'

const QURAN_TOTAL_CHAPTERS = 114

export function QuranReadingProgressBar() {
  const { data: session } = useSession()
  const progress = useReadingProgress('quran')

  if (!session?.accessToken || !progress?.verse_key) return null

  const chapterNum = parseInt(progress.verse_key.split(':')[0] ?? '0', 10)
  if (!chapterNum) return null

  const percent = Math.min(100, Math.round((chapterNum / QURAN_TOTAL_CHAPTERS) * 100))

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/30"
      title={`Cover-to-cover: ${percent}% (${progress.verse_key})`}
    >
      <div
        className="h-full bg-primary/60 transition-all duration-700"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
