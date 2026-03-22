'use client'

import { BookOpen, List, ScanText } from 'lucide-react'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import type { DisplayMode } from '@/hooks/use-quran-preferences'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MODES: { id: DisplayMode; label: string; icon: React.ReactNode }[] = [
  { id: 'verse', label: 'Verse', icon: <List className="size-4" /> },
  { id: 'word', label: 'Word by Word', icon: <ScanText className="size-4" /> },
  { id: 'reading', label: 'Reading', icon: <BookOpen className="size-4" /> },
]

export function QuranModeSelector() {
  const prefs = useQuranPreferences()

  const handleModeChange = (mode: DisplayMode) => {
    prefs.setPreferences({
      ...prefs,
      displayMode: mode,
      // Keep wordByWord in sync so VerseCard renders correctly
      wordByWord: mode === 'word',
    })
  }

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/40 ml-auto">
      {MODES.map((mode) => {
        const isActive = prefs.displayMode === mode.id
        return (
          <Tooltip key={mode.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleModeChange(mode.id)}
                aria-label={mode.label}
                className={cn(
                  'flex items-center justify-center size-7 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {mode.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{mode.label}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
