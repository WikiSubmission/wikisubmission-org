'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon, StickyNote } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
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
import { useLocalVerseSearch } from '@/hooks/use-local-verse-search'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { splitHighlight } from '@/lib/command-match'

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

  // The input is the draft's only owner, so blur, Escape, and the reader's
  // per-scroll `history.replaceState` verse sync can never discard what the
  // user typed. Keying on the string value (not the searchParams object) means
  // this only fires when `q` genuinely changes, i.e. on a real navigation.
  const lastUrlQueryRef = useRef(urlQuery)
  useEffect(() => {
    if (lastUrlQueryRef.current === urlQuery) return
    lastUrlQueryRef.current = urlQuery
    setQuery(urlQuery)
  }, [urlQuery])

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

  // Verse hits from whatever is already local: installed offline bundles, the
  // hydrated chapter, or the loaded search results. No network on this path — the
  // backend is only reached on submit.
  const primaryLanguage = useQuranPreferences((s) => s.primaryLanguage)
  const primaryCode =
    primaryLanguage === 'xl' || primaryLanguage === 'none' ? 'en' : primaryLanguage
  const localSearch = useLocalVerseSearch(showDropdown ? query : '', {
    primaryLang: primaryCode,
    limit: 5,
  })
  const localVerses = localSearch.data?.chapters?.flatMap((chapter) => chapter.verses ?? []) ?? []
  const localSourceLabel = (() => {
    switch (localSearch.source) {
      case 'bundle':
        return t('sourceOffline')
      case 'results':
        return t('sourceResults')
      case 'library':
        // Mid-sweep the coverage is partial, and "all verses" would read as
        // "these are all the matches" when they are not. Say how far it reaches.
        return localSearch.libraryComplete
          ? t('sourceAllVerses')
          : t('sourcePartialLibrary', { count: localSearch.libraryChapters })
      default:
        return t('sourceThisChapter')
    }
  })()

  const canSubmit = query.trim().length > 0
  const hasSuggestions =
    matchedChapters.length > 0 ||
    matchedAppendices.length > 0 ||
    noteResults.length > 0 ||
    localVerses.length > 0 ||
    canSubmit

  return (
    <div
      ref={containerRef}
      className={cn('relative min-w-0', large ? 'w-full' : 'flex-1')}
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
            large ? 'pl-11 h-12 text-base rounded-xl' : 'pl-8 h-8 text-sm'
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
            // Close the suggestions without discarding the draft.
            if (e.key === 'Escape') setOpen(false)
          }}
          autoComplete="off"
        />
      </form>

      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border/40 rounded-xl shadow-lg overflow-hidden">
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

          {noteResults.length > 0 && (matchedChapters.length > 0 || matchedAppendices.length > 0) && (
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

          {localVerses.length > 0 && (
            <>
              {(matchedChapters.length > 0 ||
                matchedAppendices.length > 0 ||
                noteResults.length > 0) && <div className="border-t border-border/20" />}
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
                  {t('localResults')}
                </span>
                <span className="text-[11px] text-muted-foreground/50">{localSourceLabel}</span>
              </div>
            </>
          )}

          {localVerses.map((verse) => {
            const [chapter, verseNumber] = (verse.vk ?? '').split(':')
            const translation = (verse.tr ?? {})[primaryCode] ?? (verse.tr ?? {})['en']
            const snippet = translation?.hl ?? translation?.tx ?? ''
            return (
              <button
                type="button"
                key={`local-${verse.vk}`}
                onMouseDown={() => {
                  setOpen(false)
                  router.push(`/quran/${chapter}?verse=${verseNumber}`)
                }}
                className="flex items-start gap-2 w-full px-3 py-2 text-sm hover:bg-primary/5 text-left"
              >
                <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                  {verse.vk}
                </span>
                <span className="flex-1 min-w-0 text-xs text-muted-foreground line-clamp-2">
                  {/* Renders the <b> runs the search emits as marks, never as raw HTML. */}
                  {splitHighlight(snippet).map((run, i) =>
                    run.match ? (
                      <mark key={i} className="bg-transparent font-medium text-primary">
                        {run.text}
                      </mark>
                    ) : (
                      <span key={i}>{run.text}</span>
                    )
                  )}
                </span>
              </button>
            )
          })}

          {canSubmit && (
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
