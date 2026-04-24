'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PALETTES,
  usePalette,
  type PaletteKey,
} from '@/lib/theme-palette-context'
import { cn } from '@/lib/utils'

type Mode = 'light' | 'dark'

const mono = 'var(--font-jetbrains), ui-monospace, monospace'

function resolveMode(theme: string | undefined, systemTheme: string | undefined): Mode {
  const resolved = theme === 'system' ? systemTheme : theme
  return resolved === 'dark' ? 'dark' : 'light'
}

export function PaletteThemeSwitcher() {
  const { palette, setPalette } = usePalette()
  const { theme, systemTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[34px] w-[56px]" />
  }

  const mode = resolveMode(theme, systemTheme)
  const current = PALETTES[palette][mode]

  const apply = (nextPalette: PaletteKey, nextMode: Mode) => {
    setPalette(nextPalette)
    setTheme(nextMode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Theme"
          title="Theme"
          className="flex items-center gap-1.5 h-[34px] px-2 rounded-md transition-colors hover:bg-[color-mix(in_oklab,var(--ed-fg),transparent_94%)]"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '3px 4px',
              borderRadius: 2,
              border: `1px solid ${current.rule}`,
              background: current.bg,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 1,
                background: current.accent,
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 1,
                background: current.fg,
              }}
            />
          </span>
          <svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--ed-fg-muted)' }}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="p-2 min-w-[220px]"
        style={{
          borderRadius: 4,
          border: '1px solid var(--ed-rule)',
          backgroundColor: 'var(--ed-surface)',
          boxShadow: '0 8px 24px -8px rgba(26,23,21,0.18)',
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
            padding: '4px 6px 8px',
          }}
        >
          Theme
        </div>

        {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
          const entry = PALETTES[k]
          const isActivePalette = palette === k
          return (
            <div
              key={k}
              className="flex items-center justify-between gap-3 py-1.5 px-1.5 rounded-sm"
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: 'var(--ed-fg)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 13.5,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {entry.label}
              </span>
              <span className="flex items-center gap-1.5">
                <ModeSwatch
                  palette={entry}
                  mode="light"
                  active={isActivePalette && mode === 'light'}
                  onClick={() => apply(k, 'light')}
                />
                <ModeSwatch
                  palette={entry}
                  mode="dark"
                  active={isActivePalette && mode === 'dark'}
                  onClick={() => apply(k, 'dark')}
                />
              </span>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ModeSwatch({
  palette,
  mode,
  active,
  onClick,
}: {
  palette: (typeof PALETTES)[PaletteKey]
  mode: Mode
  active: boolean
  onClick: () => void
}) {
  const p = palette[mode]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${palette.label} ${mode}`}
      title={mode}
      className={cn(
        'relative inline-flex items-center gap-0.5 px-1.5 py-1 rounded-sm transition-all cursor-pointer',
        active ? 'ring-2 ring-offset-1' : 'hover:opacity-80'
      )}
      style={{
        background: p.bg,
        border: `1px solid ${p.rule}`,
        // @ts-expect-error — CSS ring color fallback via inline var
        '--tw-ring-color': p.accent,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 1,
          background: p.accent,
        }}
      />
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 1,
          background: p.fg,
        }}
      />
    </button>
  )
}
