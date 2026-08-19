import Link from 'next/link'
import { cn } from '@/lib/utils'
import { topicRefHref, type TopicRef } from '@/lib/topic-index'

/**
 * A run of printed verse citations, rendered as links.
 *
 * `display` is shown verbatim — the printed index writes ranges as "7:65-72" and
 * comma runs as separate citations, and reproducing that is the point of an index
 * page. The link goes to the range's first verse.
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
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1', className)}>
      {shown.map((ref, i) => (
        <Link
          key={`${ref.chapter_number}:${ref.verse_start}-${ref.verse_end}:${i}`}
          href={topicRefHref(ref)}
          className="font-mono text-xs text-primary/90 hover:text-primary hover:underline underline-offset-2 tabular-nums"
        >
          {ref.display}
        </Link>
      ))}
      {hidden > 0 && (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          +{hidden}
        </span>
      )}
    </span>
  )
}
