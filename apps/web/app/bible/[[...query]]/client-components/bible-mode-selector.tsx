'use client'

import { BookOpen, List } from 'lucide-react'
import { useBiblePreferences } from '@/hooks/use-bible-preferences'
import type { BibleDisplayMode } from '@/hooks/use-bible-preferences'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MODES: { id: BibleDisplayMode; label: string; icon: React.ReactNode }[] = [
  { id: 'verse',   label: 'Verse by verse', icon: <List className="size-4" /> },
  { id: 'reading', label: 'Reading',        icon: <BookOpen className="size-4" /> },
]

export function BibleModeSelector() {
  const prefs = useBiblePreferences()

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/40">
      {MODES.map((mode) => {
        const isActive = prefs.displayMode === mode.id
        return (
          <Tooltip key={mode.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => prefs.setPreferences({ ...prefs, displayMode: mode.id })}
                aria-label={mode.label}
                className={cn(
                  'flex items-center gap-1.5 h-7 px-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                {mode.icon}
                <span className="hidden md:inline text-xs font-medium">{mode.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="md:hidden">
              <p>{mode.label}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
