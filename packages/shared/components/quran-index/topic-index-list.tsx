import Link from 'next/link'
import { CornerDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { topicCrossRefHref, type TopicEntry } from '@/lib/topic-index'
import { TopicRefChips } from './topic-ref-chips'

/**
 * One letter of the printed topical index.
 *
 * Layout mirrors the printed page: the entry title on its own line with any
 * citations that hang directly off it, then indented sub-entries each with their
 * own citations. Cross-references ("see also Hood") link to a search for the
 * target title rather than to an id, because the printed text does not always
 * spell a target exactly as that entry's own title.
 */

function TopicEntryRow({ entry }: { entry: TopicEntry }) {
  const hasSubentries = entry.subentries.length > 0

  return (
    <div id={entry.slug} className="scroll-mt-32 px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold">{entry.title}</h3>

        {entry.cross_refs.length > 0 && (
          <span className="text-xs text-muted-foreground">
            see also{' '}
            {entry.cross_refs.map((ref, i) => (
              <span key={ref}>
                {i > 0 && ', '}
                <Link
                  href={topicCrossRefHref(ref)}
                  className="italic hover:text-foreground hover:underline underline-offset-2"
                >
                  {ref}
                </Link>
              </span>
            ))}
          </span>
        )}

        <TopicRefChips refs={entry.refs} />
      </div>

      {hasSubentries && (
        <ul className="mt-1.5 space-y-1">
          {entry.subentries.map((sub, i) => (
            <li
              key={`${entry.slug}:${i}`}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pl-4"
            >
              <CornerDownRight
                className="size-3 text-muted-foreground/40 shrink-0 self-center"
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">{sub.label}</span>
              <TopicRefChips refs={sub.refs} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function TopicIndexList({
  entries,
  emptyMessage,
  className,
}: {
  entries: TopicEntry[]
  emptyMessage: string
  className?: string
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">{emptyMessage}</p>
    )
  }

  return (
    <div
      className={cn(
        'bg-muted/30 rounded-2xl border border-border/40 divide-y divide-border/40',
        className,
      )}
    >
      {entries.map((entry) => (
        <TopicEntryRow key={`${entry.letter}:${entry.slug}`} entry={entry} />
      ))}
    </div>
  )
}
