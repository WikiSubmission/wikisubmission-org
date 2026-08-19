'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ListTree, SearchIcon, StickyNote } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { useTopicIndexSearch } from '@/hooks/use-topic-index-search'
import { topicEntryHref } from '@/lib/topic-index'
import { cn } from '@/lib/utils'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import { CHAPTER_TRANSLITERATIONS } from '@/constants/quran-chapters'
import {
  isQuranRefInput,
  normalizeQuranInput,
  parseQuranRef,
  parseAllChaptersVerseRef,
  expandAllChaptersVerseRef,
} from '@/lib/scripture-parser'
import { useMeSearch } from '@/hooks/use-me-search'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useReaderContext } from '@/hooks/use-reader-context-store'

export default function QuranSearchBar({ large }: { large?: boolean } = {}) {
  const t = useTranslations('search')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { replace } = router
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chapterNumber = useReaderContext((state) => state.chapterNumber)
  const activeResults = useReaderContext((state) => state.results)

  // The input is the draft's only owner, so blur, Escape, and the reader's
  // per-scroll `history.replaceState` verse sync can never discard what the
  // user typed. Keying on the string value (not the searchParams object) means
  // this only fires when `q` genuinely changes, i.e. on a real navigation.
  const lastUrlQueryRef = useRef(urlQuery)
  useEffect(() => {
    if (lastUrlQueryRef.current === urlQuery) return
    lastUrlQueryRef.current = urlQuery
    setQuery(urlQuery)
    // A navigation can remount or reset this controlled input without firing
    // onChange. Never let an old client-side filter outlive an empty field.
    if (!urlQuery.trim()) useReaderContext.getState().setDraftQuery('')
  }, [urlQuery])

  useEffect(() => {
    if (!query.trim()) useReaderContext.getState().setDraftQuery('')
  }, [query])

  const chapters = useQuranNavStore((s) => s.chapters)
  const appendices = useQuranNavStore((s) => s.appendices)

  const performSearch = useCallback(
    (q: string) => {
      // The draft has been promoted to a real query, so the results view should
      // stop filtering and show what the backend returns.
      useReaderContext.getState().setDraftQuery('')
      if (!q) {
        replace(`${pathname}`)
        return
      }
      const allChapters = parseAllChaptersVerseRef(q.trim())
      if (allChapters) {
        const expanded = expandAllChaptersVerseRef(allChapters, chapters)
        if (expanded) {
          router.push(`/quran/${expanded}`)
          return
        }
      }
      if (q.includes(',')) {
        const parts = q.split(',').map((s) => normalizeQuranInput(s.trim()))
        if (parts.every((p) => parseQuranRef(p) !== null)) {
          router.push(`/quran/${parts.join(',')}`)
          return
        }
      }
      // A fresh param set, not a clone: carrying `verse` into a text search is
      // meaningless, and a stale `tab=words` would silently force the words tab.
      const params = new URLSearchParams()
      params.set('q', decodeURIComponent(normalizeQuranInput(q.trim())))
      replace(`${pathname}?${params.toString()}`)
    },
    [pathname, replace, router, chapters]
  )

  const showDropdown = open && query.length >= 1 && !isQuranRefInput(query)

  const matchedChapters = showDropdown
    ? chapters
        .filter((c) => {
          const title = c.title ?? ''
          const n = c.chapter_number?.toString() ?? ''
          const transliteration =
            CHAPTER_TRANSLITERATIONS[(c.chapter_number ?? 1) - 1] ?? ''
          const q = query.toLowerCase()
          return (
            title.toLowerCase().includes(q) ||
            transliteration.toLowerCase().includes(q) ||
            n.startsWith(query)
          )
        })
        .slice(0, 5)
    : []

  const matchedAppendices = showDropdown
    ? appendices
        .filter((a) => {
          const title = a.title ?? ''
          const n = a.code?.toString() ?? ''
          return (
            title.toLowerCase().includes(query.toLowerCase()) ||
            n.startsWith(query)
          )
        })
        .slice(0, 3)
    : []

  // Notes search is the one network call reachable from the keystroke path, so
  // it reads a debounced copy of the draft. Chapters and appendices above stay
  // synchronous: they filter data the nav store already holds.
  const debouncedQuery = useDebouncedValue(query, 300)
  const noteQuery = showDropdown && debouncedQuery.trim().length >= 2 ? debouncedQuery : ''
  const noteResults = useMeSearch(noteQuery, 'quran').slice(0, 4)

  // Topical index entries ride the same debounce. They are jumps, like chapters
  // and appendices, so they belong in this dropdown rather than only in the
  // results page: "alimony" is one keystroke away from the verse that answers it.
  const topicResults = useTopicIndexSearch(noteQuery).entries.slice(0, 3)

  // Matching verses are not previewed here. They render as reader cards through
  // `QuranDraftSwitch`, which has the width to show the verse rather than a
  // clipped line of it. What stays is navigation: jumps and the submit row.
  const canSubmit = query.trim().length > 0
  const localScope = activeResults
    ? t('sourceResults')
    : chapterNumber !== null
      ? t('sourceThisChapter')
      : null
  const hasSuggestions =
    matchedChapters.length > 0 ||
    matchedAppendices.length > 0 ||
    topicResults.length > 0 ||
    noteResults.length > 0 ||
    canSubmit

  /** Clears the draft as well as the field, so the reader comes back. */
  const clearDraft = useCallback(() => {
    setQuery('')
    useReaderContext.getState().setDraftQuery('')
    setOpen(false)
  }, [])

  return (
    <div
      ref={containerRef}
      // Marked so the draft overlay can start below it. On the index route this
      // bar sits in the page body rather than the fixed header, and an overlay
      // anchored only to the header would cover the field being typed into.
      data-quran-search-bar
      className={cn(
        'relative min-w-0',
        large
          ? 'w-full'
          : 'flex-1 max-md:focus-within:absolute max-md:focus-within:inset-x-3 max-md:focus-within:top-1/2 max-md:focus-within:z-[60] max-md:focus-within:w-auto max-md:focus-within:-translate-y-1/2'
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setOpen(false)
          performSearch(query)
        }}
      >
        <button
          type="submit"
          aria-label={t('placeholder')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-foreground transition-colors',
            large ? 'left-3.5 size-4' : 'left-2.5 size-3.5'
          )}
        >
          <SearchIcon className="size-full" />
        </button>
        <Input
          type="search"
          placeholder={t('placeholder')}
          className={cn(
            'bg-muted/50 border-border/40',
            large ? 'pl-11 h-12 text-base rounded-xl' : 'pl-8 h-8 text-base md:text-sm'
          )}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // Lets the results view narrow what is already on screen as you type.
            useReaderContext.getState().setDraftQuery(e.target.value)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            // Escape is the one-key way back to reading: it drops the draft, so
            // the reader returns to where it was rather than staying filtered
            // behind a closed panel.
            if (e.key === 'Escape') {
              e.preventDefault()
              clearDraft()
              e.currentTarget.blur()
            }
          }}
          enterKeyHint="search"
          autoComplete="off"
        />
      </form>

      {showDropdown && hasSuggestions && (
        <div
          // Marked so the draft overlay can start below it — the panel floats
          // above the reader, and results tucked under it would be unreadable.
          data-quran-search-dropdown
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border/40 rounded-xl shadow-lg overflow-hidden"
        >
          {localScope && (
            <>
              <div
                role="status"
                className="flex items-center gap-2 bg-primary/5 px-3 py-2 text-xs text-muted-foreground"
              >
                <SearchIcon className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  {t('searchingWithin', { scope: localScope })}
                </span>
              </div>

              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOpen(false)
                  performSearch(query)
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/60"
              >
                <SearchIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate">
                  {t('searchEverything', { query: query.trim() })}
                </span>
                <span className="ms-auto shrink-0 font-mono text-[11px] text-muted-foreground/50 max-md:hidden">
                  ⏎
                </span>
              </button>

              {(matchedChapters.length > 0 ||
                matchedAppendices.length > 0 ||
                topicResults.length > 0 ||
                noteResults.length > 0) && (
                <div className="border-t border-border/20" />
              )}
            </>
          )}

          {matchedChapters.map((ch) => {
            const transliteration =
              CHAPTER_TRANSLITERATIONS[(ch.chapter_number ?? 1) - 1]
            return (
              <button
                type="button"
                key={ch.chapter_number}
                onMouseDown={() => {
                  setOpen(false)
                  router.push(`/quran/${ch.chapter_number}`)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/60 text-left"
              >
                <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 text-right">
                  {ch.chapter_number}
                </span>
                <span className="truncate">{ch.title}</span>
                {transliteration && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {transliteration}
                  </span>
                )}
              </button>
            )
          })}

          {matchedAppendices.length > 0 && matchedChapters.length > 0 && (
            <div className="border-t border-border/20" />
          )}

          {matchedAppendices.map((ap) => (
            <button
              type="button"
              key={ap.code}
              onMouseDown={() => {
                setOpen(false)
                router.push(`/appendices/${ap.code}`)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/60 text-left"
            >
              <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 text-right">
                {ap.code}
              </span>
              <span className="truncate text-muted-foreground">{ap.title}</span>
            </button>
          ))}

          {topicResults.length > 0 &&
            (matchedChapters.length > 0 || matchedAppendices.length > 0) && (
              <div className="border-t border-border/20" />
            )}

          {topicResults.map((entry) => (
            <button
              type="button"
              key={`topic-${entry.letter}-${entry.slug}`}
              onMouseDown={() => {
                setOpen(false)
                router.push(topicEntryHref(entry))
              }}
              className="flex items-start gap-2 w-full px-3 py-2 text-sm hover:bg-primary/5 text-left"
            >
              <ListTree className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/70" />
              <div className="flex-1 min-w-0">
                <span className="truncate block">{entry.title}</span>
                <span className="text-xs text-muted-foreground truncate block">
                  {t('topicsHint')}
                </span>
              </div>
            </button>
          ))}

          {noteResults.length > 0 &&
            (matchedChapters.length > 0 ||
              matchedAppendices.length > 0 ||
              topicResults.length > 0) && (
              <div className="border-t border-border/20" />
            )}

          {noteResults.map((n) => {
            const [chapter, verse] = n.verse_key.split(':')
            const href =
              n.scripture === 'quran'
                ? `/quran/${chapter}?verse=${verse}`
                : `/bible/${n.verse_key}`
            return (
              <button
                type="button"
                key={`note-${n.verse_key}`}
                onMouseDown={() => {
                  setOpen(false)
                  router.push(href)
                }}
                className="flex items-start gap-2 w-full px-3 py-2 text-sm hover:bg-amber-500/5 text-left"
              >
                <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500/70" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground block">
                    {n.verse_key}
                  </span>
                  <span className="text-xs text-muted-foreground truncate block">
                    {n.excerpt}
                  </span>
                </div>
              </button>
            )
          })}

          {canSubmit && !localScope && (
            <>
              <div className="border-t border-border/20" />
              <button
                type="button"
                onMouseDown={() => {
                  setOpen(false)
                  performSearch(query)
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-muted/60 text-left"
              >
                <SearchIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate">
                  {t('searchEverything', { query: query.trim() })}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground/50">
                  ⏎
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
