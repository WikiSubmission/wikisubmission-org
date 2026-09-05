'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, X, Sparkles, Compass, ArrowRight, BookOpen, Layers } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TopicEntry } from '@/lib/topic-index'
import { TopicIndexList } from './topic-index-list'
import { useTopicIndexSearch } from '@/hooks/use-topic-index-search'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

const FEATURED_THEMES = [
  { label: 'Prophets', query: 'Prophets' },
  { label: 'Prayer & Salat', query: 'Contact Prayers' },
  { label: 'Charity & Zakat', query: 'Charity' },
  { label: 'Day of Judgment', query: 'Day of Judgment' },
  { label: 'Paradise & Heaven', query: 'Heaven' },
  { label: 'Hell', query: 'Hell' },
  { label: 'Creation & Universe', query: 'Creation' },
  { label: 'Parents & Family', query: 'Parents' },
  { label: 'Dietary Rules', query: 'Dietary prohibitions' },
  { label: 'Forgiveness', query: 'Forgiveness' },
]

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
  const [searchMode, setSearchMode] = useState<'letter' | 'all'>('letter')

  const needle = filter.trim().toLowerCase()
  const filtered = useMemo(
    () => (needle ? entries.filter((entry) => matches(entry, needle)) : entries),
    [entries, needle],
  )

  // Live global search across the index when user types
  const { entries: globalResults, loading: globalLoading } = useTopicIndexSearch(
    needle.length >= 2 ? filter.trim() : '',
  )

  const handleGlobalSearch = (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length >= 2) {
      router.push(`/quran/index?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls ───────────────────────────────────── */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 backdrop-blur-md shadow-xs">
        {/* Mode Toggle & Label */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--ed-fg)]" style={{ fontFamily: F.glacial }}>
            <Compass className="size-3.5 text-[var(--ed-accent)]" />
            <span>Search & Filter</span>
          </div>

          <div className="inline-flex p-0.5 rounded-lg border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[11px]" style={{ fontFamily: F.glacial }}>
            <button
              type="button"
              onClick={() => setSearchMode('letter')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                searchMode === 'letter'
                  ? 'bg-[var(--ed-accent)] text-white shadow-2xs'
                  : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]',
              )}
            >
              Letter {letter} ({filtered.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('all')
                if (filter.trim().length >= 2) {
                  handleGlobalSearch(filter)
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                searchMode === 'all'
                  ? 'bg-[var(--ed-accent)] text-white shadow-2xs'
                  : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]',
              )}
            >
              All Topics (A–Z)
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const q = filter.trim()
            if (q.length >= 2) handleGlobalSearch(q)
          }}
          className="relative group"
        >
          <SearchIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--ed-fg-muted)] group-focus-within:text-[var(--ed-accent)] transition-colors pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={
              searchMode === 'all'
                ? 'Search all topics across the entire Quran index…'
                : `Filter topics under letter ${letter}…`
            }
            aria-label="Filter or search Quran topics"
            style={{ fontFamily: F.glacial }}
            className="h-12 pl-10 pr-24 rounded-xl border-[var(--ed-rule)] bg-[var(--ed-surface)]/90 text-sm text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]/60 focus-visible:ring-2 focus-visible:ring-[var(--ed-accent)]/40 focus-visible:border-[var(--ed-accent)] shadow-xs transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {filter && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFilter('')}
                aria-label={labels.clear}
                className="size-7 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] rounded-lg cursor-pointer"
              >
                <X className="size-3.5" />
              </Button>
            )}

            {filter.trim().length >= 2 && (
              <Button
                type="submit"
                size="sm"
                className="h-8 px-2.5 rounded-lg bg-[var(--ed-accent)] text-white hover:bg-[var(--ed-accent)]/90 text-xs font-semibold cursor-pointer shadow-2xs gap-1"
                style={{ fontFamily: F.glacial }}
              >
                <span>Search</span>
                <ArrowRight className="size-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Global Live Results Quick-Peek (when typing in letter mode) */}
        {needle.length >= 2 && searchMode === 'letter' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-[var(--ed-fg-muted)]">
              <span style={{ fontFamily: F.mono }}>
                {filtered.length} matching in letter {letter}
              </span>

              <button
                type="button"
                onClick={() => handleGlobalSearch(filter)}
                className="inline-flex items-center gap-1.5 font-semibold text-[var(--ed-accent)] hover:underline underline-offset-2 cursor-pointer"
                style={{ fontFamily: F.glacial }}
              >
                <Sparkles className="size-3" />
                <span>Search entire index for “{filter.trim()}”</span>
              </button>
            </div>

            {/* Zero match in current letter fallback helper */}
            {filtered.length === 0 && (
              <div className="p-3 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                  No matches starting with <strong>{letter}</strong> for “{filter}”.
                </span>
                <button
                  type="button"
                  onClick={() => handleGlobalSearch(filter)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--ed-accent)] text-white font-semibold cursor-pointer shadow-2xs hover:bg-[var(--ed-accent)]/90 transition-all"
                  style={{ fontFamily: F.glacial }}
                >
                  <span>Search all letters</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Curated Theme Pills */}
        <div className="pt-2 border-t border-[var(--ed-rule)]/40 flex flex-wrap items-center gap-1.5">
          <span
            className="text-[11px] font-semibold text-[var(--ed-fg-muted)]/80 mr-1 shrink-0"
            style={{ fontFamily: F.glacial }}
          >
            Themes:
          </span>
          {FEATURED_THEMES.map((theme) => (
            <button
              key={theme.label}
              type="button"
              onClick={() => handleGlobalSearch(theme.query)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[11px] font-medium text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-accent-soft)]/10 transition-all cursor-pointer shadow-2xs"
              style={{ fontFamily: F.glacial }}
            >
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic Cards List ───────────────────────────────────────────── */}
      <TopicIndexList
        entries={filtered}
        emptyMessage={labels.noneInLetter}
      />
    </div>
  )
}

