'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Square, Volume2 } from 'lucide-react'
import {
  PRAYER_SOUND_ORDER,
  PRAYER_SOUNDS,
  type PrayerSoundId,
} from '@/lib/notifications/sounds'
import { cn } from '@/lib/utils'

interface AdhanSoundSelectorProps {
  value: PrayerSoundId
  disabled?: boolean
  onChange: (sound: PrayerSoundId) => void
}

/**
 * Prayer notification sound picker (system default + bundled adhans).
 * Selecting an adhan also plays a preview; the speaker button replays or
 * stops it. Preview audio comes from the webview copy in public/audio/.
 */
export function AdhanSoundSelector({ value, disabled = false, onChange }: AdhanSoundSelectorProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [previewing, setPreviewing] = useState<PrayerSoundId | null>(null)

  const stopPreview = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPreviewing(null)
  }

  useEffect(() => stopPreview, [])

  const playPreview = (sound: PrayerSoundId) => {
    const url = PRAYER_SOUNDS[sound].previewUrl
    stopPreview()
    if (!url) return
    try {
      const audio = new Audio(url)
      audio.onended = () => setPreviewing((cur) => (cur === sound ? null : cur))
      audioRef.current = audio
      setPreviewing(sound)
      void audio.play().catch(() => setPreviewing(null))
    } catch {
      setPreviewing(null)
    }
  }

  const select = (sound: PrayerSoundId) => {
    if (sound !== value) onChange(sound)
    if (sound === previewing) stopPreview()
    else playPreview(sound)
  }

  return (
    <div className="py-3">
      <p className={cn('text-sm font-medium', disabled ? 'text-muted-foreground' : 'text-foreground')}>
        Sound
      </p>
      <p className="text-muted-foreground mt-0.5 text-xs">
        Played when a prayer time arrives
      </p>
      <ul
        className={cn(
          'divide-border/40 border-border/40 mt-3 divide-y rounded-xl border',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {PRAYER_SOUND_ORDER.map((id) => {
          const sound = PRAYER_SOUNDS[id]
          const isSelected = id === value
          const isPreviewing = id === previewing
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => select(id)}
                aria-pressed={isSelected}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60',
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm">{sound.label}</span>
                  <span className="text-muted-foreground block text-xs">{sound.description}</span>
                </span>
                {sound.previewUrl && (
                  <span
                    role="button"
                    aria-label={isPreviewing ? `Stop ${sound.label} preview` : `Preview ${sound.label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPreviewing) stopPreview()
                      else playPreview(id)
                    }}
                    className={cn(
                      'shrink-0 rounded-full p-2',
                      isPreviewing ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {isPreviewing ? <Square className="size-4" /> : <Volume2 className="size-4" />}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
