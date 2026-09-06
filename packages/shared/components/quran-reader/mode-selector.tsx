'use client'

import { BookOpen, List, ScanText } from 'lucide-react'
import { useQuranDisplayMode, type QuranModeId } from '@/hooks/use-quran-display-mode'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

export type { QuranModeId }

type ModeId = QuranModeId

export interface QuranModeSelectorProps {
  /** Disable reading mode (search results and verse lists have no single-chapter flow). */
  readingBlocked?: boolean
  /**
   * Optional gate before enabling word mode. Return (or resolve) false to keep
   * the current mode — e.g. mobile shows a download sheet when the word-by-word
   * bundle for the user's language is published but not installed.
   */
  onWordModeIntercept?: () => boolean | Promise<boolean>
  /** Fires after the mode actually changed (not on taps that keep the current mode). */
  onModeChanged?: (mode: QuranModeId) => void
}

/**
 * Segmented verse / word / reading display-mode toggle, shared by the web
 * reader header and the mobile chapter toolbar. The mode rules themselves live
 * in `useQuranDisplayMode`, which the settings panel's mode row shares.
 */
export function QuranModeSelector({
  readingBlocked = false,
  onWordModeIntercept,
  onModeChanged,
}: QuranModeSelectorProps) {
  const { activeMode, setMode } = useQuranDisplayMode({
    readingBlocked,
    onWordModeIntercept,
    onModeChanged,
  })
  const t = useTranslations('quran')

  const MODES: { id: ModeId; label: string; icon: React.ReactNode }[] = [
    { id: 'verse', label: t('modeVerse'), icon: <List className="size-4" /> },
    { id: 'word', label: t('modeWord'), icon: <ScanText className="size-4" /> },
    { id: 'reading', label: t('modeReading'), icon: <BookOpen className="size-4" /> },
  ]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/40 transition-opacity',
            readingBlocked && activeMode === 'reading' && 'opacity-80'
          )}
          aria-disabled={false}
        >
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id
            const modeDisabled = mode.id === 'reading' && readingBlocked
            return (
              <Tooltip key={mode.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => void setMode(mode.id)}
                    disabled={modeDisabled}
                    aria-label={mode.label}
                    className={cn(
                      'flex items-center gap-1.5 h-7 px-2 rounded-md transition-colors disabled:pointer-events-none',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {mode.icon}
                    <span className="hidden md:inline text-xs font-medium">{mode.label}</span>
                  </button>
                </TooltipTrigger>
                {!modeDisabled && (
                  <TooltipContent side="bottom" className="md:hidden">
                    <p>{mode.label}</p>
                  </TooltipContent>
                )}
                {modeDisabled && (
                  <TooltipContent side="bottom">
                    <p>{t('modeReadingBlocked')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>
      </TooltipTrigger>
    </Tooltip>
  )
}
