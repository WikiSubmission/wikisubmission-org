'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { PALETTES, usePalette, type PaletteKey } from '@/lib/theme-palette-context'
import { useMounted } from '@/hooks/use-mounted'
import { cn } from '@/lib/utils'

const MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Monitor },
] as const

const PALETTE_ORDER: PaletteKey[] = ['ink', 'violet', 'mono']

/**
 * Appearance controls: light/dark/system mode (next-themes) and the color
 * palette (ink / violet / mono) with swatches from the palette definitions.
 * Mounted-gated — resolved theme is unknowable during hydration.
 */
export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { palette, setPalette } = usePalette()
  const mounted = useMounted()

  if (!mounted) return <div className="h-28" aria-hidden="true" />

  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 border-border/40 flex items-center gap-0.5 rounded-lg border p-0.5">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-pressed={theme === id}
            className={cn(
              'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors',
              theme === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <ul className="divide-border/40 border-border/40 divide-y rounded-xl border">
        {PALETTE_ORDER.map((key) => {
          const def = PALETTES[key]
          const colors = def[mode]
          const isActive = key === palette
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setPalette(key)}
                aria-pressed={isActive}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <span className="flex shrink-0 -space-x-1">
                  <span
                    className="border-border/60 size-5 rounded-full border"
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span
                    className="border-border/60 size-5 rounded-full border"
                    style={{ backgroundColor: colors.accent }}
                  />
                </span>
                <span
                  className={cn(
                    'flex-1 text-sm',
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {def.label}
                </span>
                {isActive && <span className="bg-primary size-1.5 rounded-full" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
