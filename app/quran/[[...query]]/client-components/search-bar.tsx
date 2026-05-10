'use client'

import { useState, useCallback, useRef } from 'react'
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

  const chapters = useQuranNavStore((s) => s.chapters)
  const appendices = useQuranNavStore((s) => s.appendices)

  const performSearch = useCallback(
    (q: string) => {
      if (!q) {
        replace(`${pathname}`)
        return
      }
      // All-chapters verse form (e.g. ":50" or ":50-55") — expand to every
      // chapter that has the requested verse, then navigate as a verse list.
      const allChapters = parseAllChaptersVerseRef(q.trim())
      if (allChapters) {
        const expanded = expandAllChaptersVerseRef(allChapters, chapters)
        if (expanded) {
          router.push(`/quran/${expanded}`)
          return
        }
      }
      // Comma-separated verse refs (e.g. "1:1,2:255-257" or "1 1,2 255-257")
      // Normalize each part to canonical colon form before navigating.
      if (q.includes(',')) {
        const parts = q.split(',').map((s) => normalizeQuranInput(s.trim()))
        if (parts.every((p) => parseQuranRef(p) !== null)) {
          router.push(`/quran/${parts.join(',')}`)
          return
        }
      }
      // Normalize single verse ref ("3 5" → "3:5") before placing in the URL
      const normalized = normalizeQuranInput(q.trim())
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', decodeURIComponent(normalized))
      replace(`${pathname}?${params.toString()}`)
    },
    [pathname, replace, router, searchParams, chapters]
  )

  // Autocomplete: skip verse-ref patterns (colon or space-separated)
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

  const noteResults = useMeSearch(showDropdown ? query : '', 'quran').slice(0, 4)

  const hasSuggestions =
    matchedChapters.length > 0 || matchedAppendices.length > 0 || noteResults.length > 0

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
        <SearchIcon
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none',
            large ? 'left-3.5 size-4' : 'left-2.5 size-3.5'
          )}
        />
        <Input
          type="search"
          placeholder={t('placeholder')}
          className={cn(
            'bg-muted/50 border-border/40',
            large ? 'pl-11 h-12 text-base rounded-xl' : 'pl-8 h-8 text-sm'
          )}
          value={open ? query : urlQuery}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setQuery(urlQuery)
            setOpen(true)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
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
        </div>
      )}
    </div>
  )
}
