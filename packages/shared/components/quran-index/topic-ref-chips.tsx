'use client'

import { cn } from '@/lib/utils'
import type { TopicRef } from '@/lib/topic-index'
import { ScriptureRef } from '@/components/quran-ref'

const F = {
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
}

/**
 * A run of printed verse citations with in-situ Scripture preview dialogs.
 *
 * Clicking any citation opens the verse modal dialog with translation and context,
 * allowing readers to review the text instantly without losing their place on the index.
 */
export function TopicRefChips({
  refs,
  max,
  className,
}: {
  refs: TopicRef[]
  /** Truncate to this many, with a "+N more" tail. Omit to show all. */
  max?: number
  className?: string
}) {
  if (refs.length === 0) return null

  const shown = max ? refs.slice(0, max) : refs
  const hidden = refs.length - shown.length

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {shown.map((ref, i) => {
        const canonicalRef =
          ref.verse_end > ref.verse_start
            ? `${ref.chapter_number}:${ref.verse_start}-${ref.verse_end}`
            : `${ref.chapter_number}:${ref.verse_start}`

        return (
          <ScriptureRef
            key={`${ref.chapter_number}:${ref.verse_start}-${ref.verse_end}:${i}`}
            reference={canonicalRef}
            triggerClassName="inline-flex"
          >
            <span
              style={{ fontFamily: F.mono }}
              className="inline-flex items-center px-2 py-0.5 rounded-md border border-[var(--ed-accent)]/25 bg-[var(--ed-accent-soft)]/10 text-[var(--ed-accent)] text-[11px] font-semibold tabular-nums hover:border-[var(--ed-accent)] hover:bg-[var(--ed-accent-soft)]/25 active:scale-95 transition-all duration-150 cursor-pointer shadow-2xs select-none"
              title={`Read ${ref.display}`}
            >
              {ref.display}
            </span>
          </ScriptureRef>
        )
      })}
      {hidden > 0 && (
        <span
          style={{ fontFamily: F.mono }}
          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-[var(--ed-fg-muted)]/70 bg-[var(--ed-surface)] border border-[var(--ed-rule)]/60 tabular-nums"
        >
          +{hidden}
        </span>
      )}
    </span>
  )
}

