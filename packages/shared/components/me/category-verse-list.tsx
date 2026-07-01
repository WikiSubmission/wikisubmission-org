'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useQueries } from '@tanstack/react-query'
import { useBookmarkCategoryEntries } from '@/hooks/use-bookmarks'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { VerseCard } from '@/components/quran-reader/verse-card'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { BookmarkEntryData } from '@/types/bookmarks'

type VerseData = components['schemas']['VerseData']

interface CategoryVerseListProps {
  categoryId: number
  /** Free-text filter applied client-side over verse_key + translated text. */
  search?: string
  /** Hide the per-verse audio control (useful inside dialogs). */
  hideAudio?: boolean
  /** Hide note-edit affordance (useful when the dialog isn't routed to /me). */
  hideNotes?: boolean
}

/**
 * Renders the verse list for a single bookmark category using the shared
 * `VerseCard`. Used both on `/me/bookmarks/[id]` and inside the in-reader
 * bookmarks dialog so the editorial restyle propagates everywhere.
 */
export function CategoryVerseList({
  categoryId,
  search = '',
  hideAudio = false,
  hideNotes = false,
}: CategoryVerseListProps) {
  const { entries, isLoading } = useBookmarkCategoryEntries(categoryId)
  const { primaryLanguage, secondaryLanguage, arabic, wordByWord, zoomLevel } =
    useQuranPreferences()

  const bibleEntries = entries.filter((e) => e.scripture === 'bible')

  const chapterNumbers = useMemo(
    () =>
      [
        ...new Set(
          entries
            .filter((e) => e.scripture === 'quran')
            .map((e) => parseInt(e.verse_key.split(':')[0] ?? '0', 10))
            .filter((n) => n > 0),
        ),
      ].sort((a, b) => a - b),
    [entries],
  )

  const langs = useMemo(() => {
    const primary =
      primaryLanguage && primaryLanguage !== 'none' && primaryLanguage !== 'xl'
        ? primaryLanguage
        : 'en'
    const result: string[] = [primary]
    if (
      secondaryLanguage &&
      secondaryLanguage !== 'none' &&
      secondaryLanguage !== 'xl' &&
      secondaryLanguage !== primary
    ) {
      result.push(secondaryLanguage)
    }
    return result
  }, [primaryLanguage, secondaryLanguage])

  const optsKey = `v2-${primaryLanguage}-${secondaryLanguage ?? 'none'}-${arabic}-${wordByWord}-detail-${zoomLevel}`

  const chapterQueries = useQueries({
    queries: chapterNumbers.map((cn) => ({
      queryKey: ['quran-chapter-bookmark', cn, langs[0]],
      queryFn: async () => {
        const res = await wsApi.GET('/quran', {
          params: { query: { chapter_number_start: cn, langs } },
        })
        return res.data
      },
      staleTime: 5 * 60_000,
      enabled: cn > 0,
    })),
  })

  const verseMap = useMemo(() => {
    const map: Record<string, VerseData> = {}
    for (const q of chapterQueries) {
      for (const chapter of q.data?.chapters ?? []) {
        for (const verse of chapter.verses ?? []) {
          if (verse.vk) map[verse.vk] = verse
        }
      }
    }
    return map
  }, [chapterQueries])

  const entryByVerseKey = useMemo(() => {
    const map: Record<string, BookmarkEntryData[]> = {}
    for (const e of entries) {
      ;(map[e.verse_key] ??= []).push(e)
    }
    return map
  }, [entries])

  const needle = search.trim().toLowerCase()
  const matchVerse = useCallback(
    (verseKey: string, verse: VerseData | undefined): boolean => {
      if (!needle) return true
      if (verseKey.toLowerCase().includes(needle)) return true
      if (!verse?.tr) return false
      return Object.values(verse.tr).some((t) =>
        typeof t?.tx === 'string' && t.tx.toLowerCase().includes(needle),
      )
    },
    [needle],
  )

  const sortedQuranEntries = useMemo(
    () =>
      entries
        .filter((e) => e.scripture === 'quran')
        .filter((e) => matchVerse(e.verse_key, verseMap[e.verse_key]))
        .sort((a, b) => {
          const [aCn, aVn] = a.verse_key.split(':').map(Number)
          const [bCn, bVn] = b.verse_key.split(':').map(Number)
          return aCn !== bCn ? (aCn ?? 0) - (bCn ?? 0) : (aVn ?? 0) - (bVn ?? 0)
        }),
    [entries, verseMap, matchVerse],
  )

  const filteredBibleEntries = bibleEntries.filter((e) =>
    matchVerse(e.verse_key, undefined),
  )

  const versesLoading =
    chapterNumbers.length > 0 && chapterQueries.some((q) => q.isLoading)

  if (isLoading || versesLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--ed-bg-alt)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="empty">
        <span className="empty-glyph">§</span>
        <p className="empty-verse">
          No verses in this category yet. Open the reader and tap the bookmark icon on any verse.
        </p>
      </div>
    )
  }

  if (sortedQuranEntries.length === 0 && filteredBibleEntries.length === 0) {
    return (
      <div className="empty">
        <span className="empty-glyph">§</span>
        <p className="empty-verse">No verses match &ldquo;{search}&rdquo;.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col border-t border-[var(--ed-rule)]">
      {sortedQuranEntries.map((entry, i) => {
        const verse = verseMap[entry.verse_key]
        if (!verse) {
          return (
            <div key={entry.id} className="px-6 py-4 text-sm text-[var(--ed-fg-muted)] border-b border-[var(--ed-rule)]">
              {entry.verse_key}
            </div>
          )
        }
        const isLast =
          i === sortedQuranEntries.length - 1 && filteredBibleEntries.length === 0
        return (
          <div key={entry.id} className="border-b border-[var(--ed-rule)]">
            <VerseCard
              verse={verse}
              isLast={isLast}
              optsKey={optsKey}
              showBookmark
              entries={entryByVerseKey[entry.verse_key] ?? []}
              scripture="quran"
              showNotes={!hideNotes}
              showAudio={!hideAudio}
              verseHref={`/quran/${entry.verse_key.split(':')[0]}?verse=${entry.verse_key.split(':')[1]}`}
            />
          </div>
        )
      })}

      {filteredBibleEntries.length > 0 ? (
        <section className="flex flex-col gap-2 px-4 sm:px-0 mt-4 pb-4">
          {sortedQuranEntries.length > 0 ? (
            <p className="font-[var(--font-glacial)] text-[10px] tracking-[0.18em] uppercase text-[var(--ed-fg-muted)] mb-1 px-4 sm:px-0">
              Bible
            </p>
          ) : null}
          {filteredBibleEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/bible/${entry.verse_key}`}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--ed-rule)] hover:bg-[var(--ed-bg-alt)] transition-colors text-sm"
            >
              <span className="font-[var(--font-jetbrains)] text-xs text-[var(--ed-accent)]">
                {entry.verse_key}
              </span>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  )
}
