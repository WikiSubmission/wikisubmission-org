'use client'

import { BookOpen, List, ScanText } from 'lucide-react'
import { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { parseQuranRef, normalizeQuranInput } from '@/lib/scripture-parser'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

type ModeId = 'verse' | 'word' | 'reading'

/** Mirrors the server-side parseQueryType from page.tsx. */
function detectQueryType(raw: string | undefined): 'chapter' | 'verse-list' | 'search' | null {
  if (!raw) return null
  if (raw.includes(',')) {
    const parts = raw.split(',').map((s) => normalizeQuranInput(s.trim()))
    if (parts.length > 0 && parts.every((p) => parseQuranRef(p) !== null)) return 'verse-list'
  }
  if (/^\d{1,3}$/.test(raw)) {
    const n = parseInt(raw)
    if (n >= 1 && n <= 114) return 'chapter'
  }
  if (parseQuranRef(normalizeQuranInput(raw)) !== null) return 'verse-list'
  return 'search'
}

export function QuranModeSelector() {
  const prefs = useQuranPreferences()
  const t = useTranslations('quran')
  const params = useParams()
  const searchParams = useSearchParams()

  const q = searchParams.get('q')
  const rawQuery = q || (params.query as string[] | undefined)?.join(' ')
  const queryType = detectQueryType(rawQuery ? decodeURIComponent(rawQuery) : undefined)
  const readingBlocked = queryType === 'search' || queryType === 'verse-list'

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

  const handleModeChange = (mode: ModeId) => {
    if (mode === 'reading' && readingBlocked) return
    if (mode === 'reading') {
      prefs.setPreferences({ ...prefs, displayMode: 'reading' })
    } else if (mode === 'word') {
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
                    onClick={() => handleModeChange(mode.id)}
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
