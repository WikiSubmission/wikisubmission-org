'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CornerDownRight, ChevronDown, ChevronUp, Link as LinkIcon, Check, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { topicCrossRefHref, topicEntryHref, flattenTopicRefs, type TopicEntry } from '@/lib/topic-index'
import { TopicRefChips } from './topic-ref-chips'
import { toast } from 'sonner'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

const SUBENTRY_COLLAPSE_THRESHOLD = 5

/**
 * Single topic entry card with progressive disclosure and quick actions.
 */
function TopicEntryRow({
  entry,
  showLetterBadge = false,
}: {
  entry: TopicEntry
  showLetterBadge?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const subentriesCount = entry.subentries.length
  const allRefs = flattenTopicRefs(entry)
  const isCollapsible = subentriesCount > SUBENTRY_COLLAPSE_THRESHOLD
  const visibleSubentries = isCollapsible && !expanded
    ? entry.subentries.slice(0, SUBENTRY_COLLAPSE_THRESHOLD)
    : entry.subentries

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}${topicEntryHref(entry)}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(`Copied link to "${entry.title}"`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <article
      id={entry.slug}
      className="group scroll-mt-24 p-4 sm:p-5 transition-all duration-200 hover:bg-[var(--ed-surface)]/80 relative"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          {/* Main title & badges */}
          <div className="flex flex-wrap items-baseline gap-2.5">
            {showLetterBadge && (
              <span
                style={{ fontFamily: F.mono }}
                className="inline-flex items-center justify-center size-5 rounded-md bg-[var(--ed-accent)]/15 text-[var(--ed-accent)] text-[10px] font-bold shrink-0"
              >
                {entry.letter}
              </span>
            )}

            <h3
              className="text-lg sm:text-xl font-semibold text-[var(--ed-fg)] tracking-tight group-hover:text-[var(--ed-accent)] transition-colors"
              style={{ fontFamily: F.glacial }}
            >
              {entry.title}
            </h3>

            {/* Direct verse refs on the main title */}
            {entry.refs.length > 0 && <TopicRefChips refs={entry.refs} />}

            {/* Total citation count badge */}
            {allRefs.length > 1 && (
              <span
                style={{ fontFamily: F.mono }}
                className="text-[10px] font-medium text-[var(--ed-fg-muted)]/70 tabular-nums px-1.5 py-0.5 rounded bg-[var(--ed-surface)] border border-[var(--ed-rule)]/50"
                title={`${allRefs.length} total verse citations`}
              >
                {allRefs.length} refs
              </span>
            )}
          </div>

          {/* Cross references */}
          {entry.cross_refs.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--ed-fg-muted)] pt-0.5"
              style={{ fontFamily: F.serif }}
            >
              <span className="italic">see also:</span>
              {entry.cross_refs.map((ref) => (
                <Link
                  key={ref}
                  href={topicCrossRefHref(ref)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[11px] font-medium text-[var(--ed-accent)] hover:border-[var(--ed-accent)]/60 hover:bg-[var(--ed-accent-soft)]/15 transition-all"
                  style={{ fontFamily: F.glacial }}
                >
                  <BookOpen className="size-2.5 opacity-60" />
                  <span>{ref}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Copy Anchor Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={`Copy link to ${entry.title}`}
          title="Copy link to this topic"
          className="size-7 rounded-lg grid place-items-center text-[var(--ed-fg-muted)]/40 hover:text-[var(--ed-fg)] hover:bg-[var(--ed-surface)] border border-transparent hover:border-[var(--ed-rule)] opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <LinkIcon className="size-3.5" />
          )}
        </button>
      </div>

      {/* Subentries Tree */}
      {subentriesCount > 0 && (
        <div className="mt-3.5 pt-2 border-t border-[var(--ed-rule)]/30 space-y-2">
          <ul className="space-y-2 border-l-2 border-[var(--ed-accent)]/25 ml-1 pl-3.5 sm:ml-2 sm:pl-4">
            {visibleSubentries.map((sub, i) => (
              <li
                key={`${entry.slug}:${i}`}
                className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 text-sm"
              >
                <CornerDownRight
                  className="size-3 text-[var(--ed-accent)]/60 shrink-0 self-center"
                  aria-hidden
                />
                <span
                  className="text-sm text-[var(--ed-fg)]/90 leading-snug"
                  style={{ fontFamily: F.serif }}
                >
                  {sub.label}
                </span>
                <TopicRefChips refs={sub.refs} />
              </li>
            ))}
          </ul>

          {/* Progressive disclosure toggle */}
          {isCollapsible && (
            <div className="pl-6 pt-1">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ed-accent)] hover:underline cursor-pointer"
                style={{ fontFamily: F.glacial }}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="size-3" />
                    <span>Show fewer subtopics</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" />
                    <span>Show {subentriesCount - SUBENTRY_COLLAPSE_THRESHOLD} more subtopics</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

/**
 * Renders a list of topic cards.
 */
export function TopicIndexList({
  entries,
  emptyMessage,
  showLetterBadges = false,
  className,
}: {
  entries: TopicEntry[]
  emptyMessage: string
  showLetterBadges?: boolean
  className?: string
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/40 p-12 text-center shadow-xs">
        <p
          className="text-sm text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 divide-y divide-[var(--ed-rule)]/50 shadow-sm overflow-hidden backdrop-blur-md transition-all',
        className,
      )}
    >
      {entries.map((entry) => (
        <TopicEntryRow
          key={`${entry.letter}:${entry.slug}`}
          entry={entry}
          showLetterBadge={showLetterBadges}
        />
      ))}
    </div>
  )
}

