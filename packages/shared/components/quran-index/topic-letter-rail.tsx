import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TopicIndexLetter } from '@/lib/topic-index'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * The A-Z rail.
 *
 * The printed index has no X, so letters are driven by the counts the API
 * returns rather than assumed: an absent letter renders as a disabled glyph, so
 * the rail still reads as a full alphabet without offering a dead link.
 */
export function TopicLetterRail({
  letters,
  active,
  className,
}: {
  letters: TopicIndexLetter[]
  active: string
  className?: string
}) {
  const counts = new Map(letters.map((l) => [l.letter, l.count]))

  return (
    <nav
      aria-label="Index letters"
      className={cn('flex flex-wrap justify-center gap-1', className)}
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
              className="size-8 grid place-items-center rounded-lg text-sm text-muted-foreground/30 select-none"
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
            title={`${count} ${count === 1 ? 'entry' : 'entries'}`}
            className={cn(
              'size-8 grid place-items-center rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {letter}
          </Link>
        )
      })}
    </nav>
  )
}
