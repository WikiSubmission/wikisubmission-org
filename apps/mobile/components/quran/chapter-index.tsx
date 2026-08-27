'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookMarked, BookOpen, BookText, ListOrdered, Megaphone, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ContinueCoverToCover } from '@/components/quran-reader/continue-cover-to-cover'
import { ScriptureRef } from '@/components/quran-ref'
import { resolveScriptureRef } from '@/lib/scripture-search'
import { CHAPTER_TRANSLITERATIONS, REVELATION_ORDER, VERSE_COUNTS } from '@/constants/quran-chapters'
import { setChapterFlightState } from '@/lib/chapter-flight'
import { Flip } from '@/lib/gsap'
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'
import { useChapterTitles } from '@/hooks/use-chapter-titles'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface ChapterRow {
  number: number
  /** Bundled English title — the search haystack, always present. */
  english: string
  transliteration: string
  verses: number
  revelationOrder: number
}

const CHAPTERS: ChapterRow[] = CHAPTER_TRANSLITERATIONS.map((transliteration, i) => ({
  number: i + 1,
  english: CHAPTER_TITLES_EN[i + 1] ?? '',
  transliteration,
  verses: VERSE_COUNTS[i] ?? 0,
  revelationOrder: REVELATION_ORDER[i] ?? 0,
}))

type ChapterSort = 'chapter' | 'revelation'

// Companion texts reachable from the Quran tab. Routes mirror the web URLs;
// activeTab() in constants/navigation.ts keeps the Quran tab highlighted.
const LIBRARY_LINKS = [
  {
    href: '/introduction',
    labelKey: 'nav.introduction',
    descriptionKey: 'quran.introductionDesc',
    icon: BookMarked,
  },
  {
    href: '/proclamation',
    labelKey: 'nav.proclamation',
    descriptionKey: 'quran.proclamationDesc',
    icon: Megaphone,
  },
  {
    href: '/appendices',
    labelKey: 'sidebar.appendices',
    descriptionKey: 'mobile.reader.appendicesDesc',
    icon: ListOrdered,
  },
] as const

/**
 * Matches on the number, the localized title, the bundled English title and the
 * transliteration. English and transliteration stay in the haystack in every
 * locale so a shared link or a half-remembered "Al-Fatihah" still finds the row.
 */
function matches(chapter: ChapterRow, localizedTitle: string, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    String(chapter.number) === q ||
    String(chapter.number).startsWith(q) ||
    localizedTitle.toLowerCase().includes(q) ||
    chapter.english.toLowerCase().includes(q) ||
    chapter.transliteration.toLowerCase().includes(q)
  )
}

/**
 * Mobile Quran chapter index. Rendered entirely from the bundled chapter
 * constants so it works offline; tapping a row opens the shared reader.
 */
export function ChapterIndex() {
  const t = useTranslations()
  const router = useRouter()
  const titles = useChapterTitles()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<ChapterSort>('chapter')

  const filtered = useMemo(() => {
    const matched = CHAPTERS.filter((c) => matches(c, titles[c.number] ?? '', query.trim()))
    if (sortBy === 'revelation') {
      return [...matched].sort((a, b) => a.revelationOrder - b.revelationOrder)
    }
    return matched
  }, [query, titles, sortBy])

  // "2:255", "1 1-7", "1:4,2:45", ":50", "Mark 12:3" — a typed reference goes
  // straight to the passage instead of running a full-text search.
  const scriptureRef = useMemo(() => resolveScriptureRef(query), [query])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <form
        className="relative mb-4"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = query.trim()
          if (!trimmed) return
          if (scriptureRef?.kind === 'quran') {
            router.push(scriptureRef.href)
            return
          }
          if (!scriptureRef) {
            router.push(`/quran/search?q=${encodeURIComponent(trimmed)}`)
          }
        }}
      >
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('mobile.reader.searchPlaceholder')}
          aria-label={t('mobile.reader.searchPlaceholder')}
          className="h-11 w-full rounded-xl border border-border/50 bg-muted/40 ps-10 pe-3 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-muted/60"
        />
      </form>

      {scriptureRef?.kind === 'quran' && (
        <Link
          href={scriptureRef.href}
          prefetch={false}
          onClick={() => haptic('light')}
          className="mb-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 transition-colors active:bg-primary/10"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookOpen className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col text-start">
            <span className="truncate font-mono text-base font-semibold leading-tight text-primary">
              {scriptureRef.label}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {t('mobile.reader.goToReference')}
            </span>
          </span>
        </Link>
      )}

      {scriptureRef?.kind === 'bible' && (
        <ScriptureRef
          reference={scriptureRef.reference}
          triggerClassName="mb-3 flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 transition-colors active:bg-primary/10"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookText className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col text-start">
            <span className="truncate text-base font-semibold leading-tight text-primary">
              {scriptureRef.label}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {t('mobile.reader.previewBibleVerse')}
            </span>
          </span>
        </ScriptureRef>
      )}

      {query.trim() && !scriptureRef && (
        <div className="mb-3">
          <p
            role="status"
            className="mb-2 flex items-center gap-1.5 px-1 text-xs text-muted-foreground"
          >
            <ListOrdered className="size-3.5 shrink-0 text-primary" />
            <span>{t('mobile.reader.searchingChapters')}</span>
          </p>
          <Link
            href={`/quran/search?q=${encodeURIComponent(query.trim())}`}
            prefetch={false}
            onClick={() => haptic('light')}
            className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 transition-colors active:bg-primary/10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Search className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col text-start">
              <span className="truncate text-base font-semibold leading-tight text-primary">
                {t('mobile.reader.searchAllVerses')}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {t('mobile.reader.searchAcross', { query: query.trim() })}
              </span>
            </span>
          </Link>
        </div>
      )}

      {!query.trim() && (
        <>
          <ContinueCoverToCover
            getChapterTitle={(n) => titles[n]}
            className="mb-4"
            linkClassName="transition-colors active:bg-muted/60"
            onNavigate={() => haptic('light')}
          />

          <ul className="mb-4 flex flex-col gap-1.5">
            {LIBRARY_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    onClick={() => haptic('light')}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3',
                      'transition-colors active:bg-muted/60'
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-serif text-base font-semibold leading-tight">
                        {t(link.labelKey)}
                      </span>
                      <span className="truncate text-sm text-muted-foreground">
                        {t(link.descriptionKey)}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {!query.trim() && (
        <div className="mb-2 flex items-center gap-1.5 px-1">
          {(['chapter', 'revelation'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                haptic('light')
                setSortBy(option)
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                sortBy === option
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground active:bg-muted/60'
              )}
            >
              {t(
                option === 'chapter'
                  ? 'mobile.reader.sortChapterOrder'
                  : 'mobile.reader.sortRevelationOrder'
              )}
            </button>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {filtered.map((chapter) => (
          <li key={chapter.number}>
            <Link
              href={`/quran/${chapter.number}`}
              prefetch={false}
              onClick={(e) => {
                haptic('light')
                // Capture the tapped title's position; the reader's heading
                // flies in from here (see lib/chapter-flight.ts).
                const title = e.currentTarget.querySelector<HTMLElement>(
                  '[data-chapter-card-title]',
                )
                if (title) setChapterFlightState(Flip.getState(title))
              }}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3',
                'transition-colors active:bg-muted/60'
              )}
            >
              <span className="pointer-events-none absolute end-2.5 top-2.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {t('mobile.reader.revealedOrder', { order: chapter.revelationOrder })}
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-medium text-primary">
                {chapter.number}
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  data-chapter-card-title
                  data-flip-id="chapter-title"
                  className="truncate font-serif text-base font-semibold leading-tight"
                >
                  {titles[chapter.number] ?? chapter.english}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {chapter.verses} verses
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
