'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useQuranNavStore } from '@/hooks/use-quran-nav-store'
import { CHAPTER_TRANSLITERATIONS } from '@/constants/quran-chapters'

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

  // Sync value from URL when searchParams change
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const performSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', decodeURIComponent(q))
      } else {
        params.delete('q')
      }
      replace(`${pathname}?${params.toString()}`)
    },
    [pathname, replace, searchParams]
  )

  // Autocomplete: skip verse-ref patterns
  const isVerseRef = /^\d+:/.test(query)
  const showDropdown = open && query.length >= 1 && !isVerseRef

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
      className={cn('relative min-w-0', large ? 'w-full' : 'flex-1 max-w-sm')}
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
          value={query}
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
            <a
              key={ap.code}
              href={`https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${ap.code}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={() => setOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/60 text-left"
            >
              <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 text-right">
                {ap.code}
              </span>
              <span className="truncate text-muted-foreground">{ap.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
