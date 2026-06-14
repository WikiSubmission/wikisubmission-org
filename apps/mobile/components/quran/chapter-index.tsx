'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { CHAPTER_TRANSLITERATIONS, VERSE_COUNTS } from '@/constants/quran-chapters'
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface ChapterRow {
  number: number
  english: string
  transliteration: string
  verses: number
}

const CHAPTERS: ChapterRow[] = CHAPTER_TRANSLITERATIONS.map((transliteration, i) => ({
  number: i + 1,
  english: CHAPTER_TITLES_EN[i + 1] ?? '',
  transliteration,
  verses: VERSE_COUNTS[i] ?? 0,
}))

function matches(chapter: ChapterRow, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    String(chapter.number) === q ||
    String(chapter.number).startsWith(q) ||
    chapter.english.toLowerCase().includes(q) ||
    chapter.transliteration.toLowerCase().includes(q)
  )
}

/**
 * Mobile Quran chapter index. Rendered entirely from the bundled chapter
 * constants so it works offline; tapping a row opens the shared reader.
 */
export function ChapterIndex() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => CHAPTERS.filter((c) => matches(c, query.trim())),
    [query]
  )

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a chapter"
          aria-label="Find a chapter"
          className="h-11 w-full rounded-xl border border-border/50 bg-muted/40 pl-10 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-muted/60"
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {filtered.map((chapter) => (
          <li key={chapter.number}>
            <Link
              href={`/quran/${chapter.number}`}
              prefetch={false}
              onClick={() => haptic('light')}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3',
                'transition-colors active:bg-muted/60'
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-medium text-primary">
                {chapter.number}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-serif text-base font-semibold leading-tight">
                  {chapter.english}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {chapter.transliteration} · {chapter.verses} verses
                </span>
              </span>
            </Link>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No chapters match “{query}”.
          </li>
        )}
      </ul>
    </div>
  )
}
