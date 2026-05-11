'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookmarkX, Plus } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useBookmarkCategoryEntries } from '@/hooks/use-bookmarks'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { VerseCard } from '@/app/quran/[[...query]]/mini-components/verse-card'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { BookmarkEntryData } from '@/types/bookmarks'
import { AddVerseRefDialog } from '@/components/me/add-verse-ref-dialog'

type VerseData = components['schemas']['VerseData']

function BookmarkDetailContent({ categoryId }: { categoryId: number }) {
  const categories = useBookmarkCategories()
  const category = categories.find((c) => c.id === categoryId)
  const { entries, isLoading } = useBookmarkCategoryEntries(categoryId)
  const { primaryLanguage, secondaryLanguage, arabic, wordByWord, zoomLevel } =
    useQuranPreferences()
  const [addOpen, setAddOpen] = useState(false)

  const bibleEntries = entries.filter((e) => e.scripture === 'bible')

  const chapterNumbers = useMemo(
    () =>
      [
        ...new Set(
          entries
            .filter((e) => e.scripture === 'quran')
            .map((e) => parseInt(e.verse_key.split(':')[0] ?? '0', 10))
            .filter((n) => n > 0)
        ),
      ].sort((a, b) => a - b),
    [entries]
  )

  const langs = useMemo(() => {
    const primary =
      primaryLanguage && primaryLanguage !== 'none' && primaryLanguage !== 'xl'
        ? primaryLanguage
        : 'en'
    const langs: string[] = [primary]
    if (
      secondaryLanguage &&
      secondaryLanguage !== 'none' &&
      secondaryLanguage !== 'xl' &&
      secondaryLanguage !== primary
    ) {
      langs.push(secondaryLanguage)
    }
    return langs
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

  const sortedQuranEntries = useMemo(
    () =>
      entries
        .filter((e) => e.scripture === 'quran')
        .sort((a, b) => {
          const [aCn, aVn] = a.verse_key.split(':').map(Number)
          const [bCn, bVn] = b.verse_key.split(':').map(Number)
          return aCn !== bCn ? (aCn ?? 0) - (bCn ?? 0) : (aVn ?? 0) - (bVn ?? 0)
        }),
    [entries]
  )

  const versesLoading = chapterNumbers.length > 0 && chapterQueries.some((q) => q.isLoading)

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 py-10 sm:py-14 flex flex-col gap-6">
      <div className="px-4 sm:px-0 flex items-center justify-between gap-4">
        <Link
          href="/me/bookmarks"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add verses
        </Button>
      </div>

      {category && (
        <div className="px-4 sm:px-0 flex items-center gap-3">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{ background: category.color }}
          />
          <div>
            <h1 className="text-xl font-semibold">{category.name}</h1>
            <p className="text-xs text-muted-foreground">
              {category.entry_count}{' '}
              {category.entry_count === 1 ? 'verse' : 'verses'}
            </p>
          </div>
        </div>
      )}

      {isLoading || versesLoading ? (
        <div className="flex flex-col gap-2 px-4 sm:px-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl border border-dashed border-border mx-4 sm:mx-0">
          <BookmarkX className="w-6 h-6 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No verses yet. Add some using the button above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {sortedQuranEntries.length > 0 && (
            <section>
              {sortedQuranEntries.map((entry, i) => {
                const verse = verseMap[entry.verse_key]
                if (!verse) {
                  return (
                    <div
                      key={entry.id}
                      className="px-6 py-4 text-sm text-muted-foreground"
                    >
                      {entry.verse_key}
                    </div>
                  )
                }
                const isLast =
                  i === sortedQuranEntries.length - 1 && bibleEntries.length === 0
                return (
                  <VerseCard
                    key={entry.id}
                    verse={verse}
                    isLast={isLast}
                    optsKey={optsKey}
                    showBookmark
                    entries={entryByVerseKey[entry.verse_key] ?? []}
                    scripture="quran"
                    showNotes={false}
                    showAudio
                    verseHref={`/quran/${entry.verse_key.split(':')[0]}?verse=${entry.verse_key.split(':')[1]}`}
                  />
                )
              })}
            </section>
          )}

          {bibleEntries.length > 0 && (
            <section className="flex flex-col gap-2 px-4 sm:px-0 mt-4">
              {sortedQuranEntries.length > 0 && (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Bible
                </p>
              )}
              {bibleEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/bible/${entry.verse_key}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.verse_key}
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      )}

      {category && (
        <AddVerseRefDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          categoryId={categoryId}
          categoryName={category.name}
        />
      )}
    </div>
  )
}

export default function BookmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const categoryId = parseInt(id, 10)

  return (
    <BookmarkDetailContent categoryId={categoryId} />
  )
}
