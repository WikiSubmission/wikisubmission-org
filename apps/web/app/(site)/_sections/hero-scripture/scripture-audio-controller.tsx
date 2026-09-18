'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'

interface ScriptureAudioControllerProps {
  audioUrl: string
  verseLabel: string
  onPlayingChange?: (isPlaying: boolean) => void
}

export function ScriptureAudioController({
  audioUrl,
  verseLabel,
  onPlayingChange,
}: ScriptureAudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Setup audio element listeners and clean up on url change / unmount
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.src = audioUrl
    audioRef.current = audio

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }

    const handlePlaying = () => {
      setIsPlaying(true)
      onPlayingChange?.(true)
    }
    const handlePause = () => {
      setIsPlaying(false)
      onPlayingChange?.(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      onPlayingChange?.(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [audioUrl, onPlayingChange])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [isPlaying])

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? `Pause recitation of ${verseLabel}` : `Listen to recitation of ${verseLabel}`}
        title={isPlaying ? 'Pause Arabic Recitation' : 'Listen in Arabic (Mishary Alafasy)'}
        className="
          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px]
          border border-[var(--ed-rule)] hover:border-[var(--ed-accent)]
          bg-[color-mix(in_oklab,var(--ed-bg),transparent_25%)]
          hover:bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)]
          text-[10px] font-mono tracking-[0.14em] uppercase
          text-[var(--ed-fg)] transition-all cursor-pointer group
        "
      >
        {isPlaying ? (
          <Pause size={11} className="text-[var(--ed-accent)] fill-current shrink-0" />
        ) : (
          <Play size={11} className="text-[var(--ed-accent)] fill-current shrink-0 ml-0.5" />
        )}

        <span>{isPlaying ? 'Reciting' : 'Listen'}</span>

        {/* Soundwave Bars */}
        <div className="flex items-center gap-0.5 ml-0.5 h-3" aria-hidden>
          <span
            className={`w-0.5 rounded-full bg-[var(--ed-accent)] transition-all ${
              isPlaying ? 'h-3 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[var(--ed-accent)] transition-all delay-75 ${
              isPlaying ? 'h-2 animate-bounce' : 'h-2.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[var(--ed-accent)] transition-all delay-150 ${
              isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-[var(--ed-accent)] transition-all delay-100 ${
              isPlaying ? 'h-2 animate-pulse' : 'h-2 opacity-40'
            }`}
          />
        </div>
      </button>

      {/* Progress pill when playing */}
      {isPlaying && (
        <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-[var(--ed-fg-muted)]">
          <span className="w-12 h-1 bg-[var(--ed-rule)] rounded-full overflow-hidden">
            <span
              className="block h-full bg-[var(--ed-accent)] transition-all duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </span>
        </div>
      )}
    </div>
  )
}
