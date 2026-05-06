'use client'

import { Loader2, Pause, Volume2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useWordAudio, wordAudioId } from '@/lib/word-audio'
import { cn } from '@/lib/utils'

interface PlayWordButtonProps {
  chapter: number
  verse: number
  /** 1-based word index. The data layer stores `wi` 0-based — pass `wi + 1`. */
  word: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
  ariaLabel?: string
}

const SIZES: Record<NonNullable<PlayWordButtonProps['size']>, string> = {
  xs: 'h-5 w-5 [&_svg]:h-3 [&_svg]:w-3',
  sm: 'h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 w-9 [&_svg]:h-4 [&_svg]:w-4',
}

export function PlayWordButton({
  chapter,
  verse,
  word,
  size = 'sm',
  className,
  ariaLabel,
}: PlayWordButtonProps) {
  const t = useTranslations('wordLab')
  const { playingId, loadingId, play } = useWordAudio()
  const id = wordAudioId(chapter, verse, word)
  const isLoading = loadingId === id
  const isPlaying = playingId === id

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? t('playPronunciation')}
      title={ariaLabel ?? t('playPronunciation')}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        play(chapter, verse, word)
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-primary/20 bg-background/60 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary active:scale-95',
        isPlaying && 'border-primary/40 bg-primary/15 text-primary',
        SIZES[size],
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : isPlaying ? (
        <Pause />
      ) : (
        <Volume2 />
      )}
    </button>
  )
}
