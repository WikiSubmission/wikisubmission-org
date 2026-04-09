'use client'

import { useState, useCallback, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import { CHAPTER_TRANSLITERATIONS } from '@/constants/quran-chapters'
import { isQuranRefInput, normalizeQuranInput, parseQuranRef } from '@/lib/scripture-parser'

export default function QuranSearchBar({ large }: { large?: boolean } = {}) {
  const t = useTranslations('search')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { replace } = router
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const chapters = useQuranNavStore((s) => s.chapters)
  const appendices = useQuranNavStore((s) => s.appendices)

  // Get query from URL or fall back to local state
  const urlQuery = searchParams.get('q') ?? ''
  const displayQuery = urlQuery || query

  const performSearch = useCallback(
    (q: string) => {
      if (!q) {
        replace(`${pathname}`)
        return
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
    [pathname, replace, router, searchParams]
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

  const hasSuggestions =
    matchedChapters.length > 0 || matchedAppendices.length > 0

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
          value={displayQuery}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
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
        </div>
      )}
    </div>
  )
}
