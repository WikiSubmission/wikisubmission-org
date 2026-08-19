'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TopicEntry } from '@/lib/topic-index'
import { TopicIndexList } from './topic-index-list'

/**
 * Client shell for one letter of the index: a filter box over the entries already
 * on the page, plus a hand-off to a full-corpus search.
 *
 * The filter is deliberately local and synchronous. A letter arrives whole (the
 * largest, S, is 186 entries), so narrowing it needs no request and should feel
 * instant. Submitting the box instead navigates to `?q=`, which searches every
 * letter through the backend — the two are different questions and the copy under
 * the box says so.
 */

function matches(entry: TopicEntry, needle: string): boolean {
  if (entry.title.toLowerCase().includes(needle)) return true
  if (entry.cross_refs.some((ref) => ref.toLowerCase().includes(needle))) return true
  return entry.subentries.some((sub) => sub.label.toLowerCase().includes(needle))
}

export function TopicIndexBrowser({
  entries,
  letter,
  labels,
}: {
  entries: TopicEntry[]
  letter: string
  labels: {
    filterPlaceholder: string
    searchWholeIndex: string
    noneInLetter: string
    clear: string
  }
}) {
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const needle = filter.trim().toLowerCase()
  const filtered = useMemo(
    () => (needle ? entries.filter((entry) => matches(entry, needle)) : entries),
    [entries, needle],
  )

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const q = filter.trim()
          if (q.length >= 2) router.push(`/quran/index?q=${encodeURIComponent(q)}`)
        }}
        className="relative"
      >
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={labels.filterPlaceholder}
          aria-label={labels.filterPlaceholder}
          className="pl-9 pr-9"
        />
        {filter && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setFilter('')}
            aria-label={labels.clear}
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
          >
            <X className="size-4" />
          </Button>
        )}
      </form>

      {needle.length >= 2 && (
        <p className="text-xs text-muted-foreground px-1">
          {filtered.length} in {letter} ·{' '}
          <button
            type="button"
            onClick={() => router.push(`/quran/index?q=${encodeURIComponent(filter.trim())}`)}
            className="text-primary hover:underline underline-offset-2"
          >
            {labels.searchWholeIndex}
          </button>
        </p>
      )}

      <TopicIndexList entries={filtered} emptyMessage={labels.noneInLetter} />
    </div>
  )
}
