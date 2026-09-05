import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TopicIndexLetter } from '@/lib/topic-index'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

/**
 * The A-Z letter navigation rail.
 *
 * Displays all letters with entry count indicators, smooth active state lighting,
 * and disabled states for empty letters (like X).
 */
export function TopicLetterRail({
  letters,
  active,
  compact = false,
  className,
}: {
  letters: TopicIndexLetter[]
  active: string
  compact?: boolean
  className?: string
}) {
  const counts = new Map(letters.map((l) => [l.letter, l.count]))

  return (
    <nav
      aria-label="Index letters"
      className={cn(
        'flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/60 backdrop-blur-md shadow-xs transition-all',
        className,
      )}
    >
      {ALPHABET.map((letter) => {
        const count = counts.get(letter) ?? 0
        const isActive = letter === active

        if (count === 0) {
          return (
            <span
              key={letter}
              aria-disabled
              title={`No entries under ${letter}`}
              className={cn(
                'grid place-items-center rounded-xl text-xs font-medium text-[var(--ed-fg-muted)]/25 select-none transition-colors',
                compact ? 'size-7 sm:size-8 text-[11px]' : 'size-8 sm:size-9',
              )}
              style={{ fontFamily: F.mono }}
            >
              {letter}
            </span>
          )
        }

        return (
          <Link
            key={letter}
            href={`/quran/index?letter=${letter}`}
            aria-current={isActive ? 'page' : undefined}
            title={`${letter}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
            className={cn(
              'group relative grid place-items-center rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none',
              compact ? 'size-7 sm:size-8 text-[11px]' : 'size-8 sm:size-9 sm:text-xs',
              isActive
                ? 'bg-[var(--ed-accent)] text-white shadow-sm ring-2 ring-[var(--ed-accent)]/30 scale-105 z-10'
                : 'text-[var(--ed-fg-muted)] hover:bg-[var(--ed-surface)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-accent)]/40 border border-transparent hover:shadow-2xs',
            )}
            style={{ fontFamily: F.mono }}
          >
            <span>{letter}</span>
            {count > 0 && !isActive && (
              <span
                className="absolute -bottom-0.5 size-1 rounded-full bg-[var(--ed-accent)]/40 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

