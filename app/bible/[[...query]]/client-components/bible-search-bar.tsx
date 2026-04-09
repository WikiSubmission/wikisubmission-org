'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { BIBLE_BOOKS, BibleBook } from '@/constants/bible-books'

// ---------------------------------------------------------------------------
// Parse helpers
// ---------------------------------------------------------------------------

/**
 * Split a raw query string into a book portion and an optional chapter number.
 *
 * Examples:
 *   "genesis"      → { bookPart: "genesis",   chapterPart: null }
 *   "genesis 3"    → { bookPart: "genesis",    chapterPart: "3" }
 *   "1 samuel 5"   → { bookPart: "1 samuel",   chapterPart: "5" }
 *   "song of solomon 2" → { bookPart: "song of solomon", chapterPart: "2" }
 */
function splitQuery(q: string): { bookPart: string; chapterPart: string | null } {
  const trimmed = q.trim()
  // Trailing digits preceded by a space are the chapter number.
  const trailingChapter = trimmed.match(/^(.*\S)\s+(\d+)$/)
  if (trailingChapter) {
    return { bookPart: trailingChapter[1].trim(), chapterPart: trailingChapter[2] }
  }
  return { bookPart: trimmed, chapterPart: null }
}

function parseBibleSearch(q: string): { book: BibleBook; chapter: number } | null {
  const trimmed = q.trim().toLowerCase()
  const match = trimmed.match(/^(.+?)(?:\s+(\d+))?$/)
  if (!match) return null

  const bookInput = match[1].trim()
  const chapter = match[2] ? parseInt(match[2], 10) : 1

  const book = BIBLE_BOOKS.find(
    (b) =>
      b.bk.toLowerCase().startsWith(bookInput) ||
      b.bk.toLowerCase() === bookInput ||
      b.slug.startsWith(bookInput)
  )
  if (!book) return null

  const clampedChapter = Math.max(1, Math.min(chapter, book.cc))
  return { book, chapter: clampedChapter }
}

function getBookMatches(bookPart: string): BibleBook[] {
  const lower = bookPart.toLowerCase()
  return BIBLE_BOOKS.filter(
    (b) =>
      b.bk.toLowerCase().includes(lower) || b.slug.includes(lower)
  ).slice(0, 6)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BibleSearchBarProps {
  className?: string
  large?: boolean
}

export default function BibleSearchBar({ className, large }: BibleSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const navigate = useCallback(
    (slug: string, chapter: number) => {
      setOpen(false)
      setQuery('')
      router.push(`/bible/${slug}/${chapter}`)
    },
    [router]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = query.trim()
      if (!q) return
      const result = parseBibleSearch(q)
      if (result) {
        navigate(result.book.slug, result.chapter)
      } else {
        // Free-text search
        setOpen(false)
        setQuery('')
        router.push(`/bible/search?q=${encodeURIComponent(q)}`)
      }
    },
    [query, navigate, router]
  )

  // Dropdown state
  const showDropdown = open && query.length >= 1

  const { bookPart, chapterPart } = splitQuery(query)
  const bookMatches = showDropdown ? getBookMatches(bookPart) : []

  // When a chapter number is present, determine if there is a single exact-book match
  // for the "book + chapter" direct-link row.
  const directMatch: { book: BibleBook; chapter: number } | null =
    showDropdown && chapterPart !== null ? parseBibleSearch(query) : null

  const hasSuggestions = bookMatches.length > 0

  return (
    <div
      ref={containerRef}
      className={cn('relative min-w-0 flex-1', className)}
    >
      <form onSubmit={handleSubmit}>
        <SearchIcon className={cn(
          'absolute top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none',
          large ? 'left-3.5 size-4' : 'left-2.5 size-3.5'
        )} />
        <Input
          type="search"
          placeholder="Search books, chapters, or text…"
          className={cn(
            'bg-muted/50 border-border/40',
            large ? 'pl-11 h-12 text-base rounded-xl' : 'h-8 text-sm pl-8'
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </form>

      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border/40 rounded-xl shadow-lg overflow-hidden">
          {/* Direct book+chapter match shown at the top when a chapter number is typed */}
          {directMatch && (
            <>
              <button
                type="button"
                onMouseDown={() => navigate(directMatch.book.slug, directMatch.chapter)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/60 text-left"
              >
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-5 text-center">
                  {directMatch.book.t}
                </span>
                <span className="truncate font-medium">
                  {directMatch.book.bk}
                </span>
                <span className="ml-auto font-mono text-xs text-muted-foreground shrink-0">
                  ch. {directMatch.chapter}
                </span>
              </button>
              {bookMatches.length > 0 && (
                <div className="border-t border-border/20" />
              )}
            </>
          )}

          {/* Book list */}
          {bookMatches.map((book) => (
            <button
              type="button"
              key={book.bn}
              onMouseDown={() => navigate(book.slug, 1)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/60 text-left"
            >
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-5 text-center">
                {book.t}
              </span>
              <span className="truncate">{book.bk}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
