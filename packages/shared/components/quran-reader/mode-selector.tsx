'use client'

import { BookOpen, List, ScanText } from 'lucide-react'
import { useEffect } from 'react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

type ModeId = 'verse' | 'word' | 'reading'

export interface QuranModeSelectorProps {
  /** Disable reading mode (search results and verse lists have no single-chapter flow). */
  readingBlocked?: boolean
  /**
   * Optional gate before enabling word mode. Return (or resolve) false to keep
   * the current mode — e.g. mobile redirects to the downloads screen when the
   * word-by-word bundle for the user's language is published but not installed.
   */
  onWordModeIntercept?: () => boolean | Promise<boolean>
}

/**
 * Segmented verse / word / reading display-mode toggle, shared by the web
 * reader header and the mobile chapter toolbar. The two underlying preferences
 * (displayMode + wordByWord) are folded into one three-state control.
 */
export function QuranModeSelector({ readingBlocked = false, onWordModeIntercept }: QuranModeSelectorProps) {
  const prefs = useQuranPreferences()
  const t = useTranslations('quran')

  const MODES: { id: ModeId; label: string; icon: React.ReactNode }[] = [
    { id: 'verse', label: t('modeVerse'), icon: <List className="size-4" /> },
    { id: 'word', label: t('modeWord'), icon: <ScanText className="size-4" /> },
    { id: 'reading', label: t('modeReading'), icon: <BookOpen className="size-4" /> },
  ]

  const activeMode: ModeId =
    prefs.displayMode === 'reading'
      ? 'reading'
      : prefs.wordByWord
        ? 'word'
        : 'verse'

  useEffect(() => {
    if (!readingBlocked) return
    if (prefs.displayMode !== 'reading') return
    prefs.setPreferences({ ...prefs, displayMode: 'verse' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingBlocked, prefs.displayMode])

  const handleModeChange = async (mode: ModeId) => {
    if (mode === 'reading' && readingBlocked) return
    if (mode === 'reading') {
      prefs.setPreferences({ ...prefs, displayMode: 'reading' })
    } else if (mode === 'word') {
      if (onWordModeIntercept && (await onWordModeIntercept()) === false) return
      prefs.setPreferences({
        ...prefs,
        displayMode: 'verse',
        wordByWord: true,
        arabic: true,
      })
    } else {
      prefs.setPreferences({
        ...prefs,
        displayMode: 'verse',
        wordByWord: false,
      })
    }
  }

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
                    onClick={() => void handleModeChange(mode.id)}
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
                    <p>Reading mode is disabled for search and verse references</p>
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
