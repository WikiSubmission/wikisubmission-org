export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import SearchResult from '@/components/quran-reader/result-search'
import { ReaderBoot } from './client-components/reader-boot'
import QuranSearchBar from './client-components/search-bar'
import { wsApiServer } from '@/src/api/server-client'
import { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'
import { ArrowRight, BookOpen, ListTree } from 'lucide-react'
import { VerseListFetcher } from './mini-components/verse-list-fetcher'
import { VerseListSkeleton } from '@/components/quran-reader/verse-list-skeleton'
import { QuranAccordions } from './mini-components/quran-accordions'
import { ContinueCoverToCoverSection } from './mini-components/continue-cover-to-cover-section'
import { QuranStudyBand } from './mini-components/quran-study-band'
import { QuranSectionRail } from './client-components/section-rail'
import { parseQuranRef, normalizeQuranInput } from '@/lib/scripture-parser'
import { ActivityRecorder } from '@/components/activity-recorder'
import { fetchChapters, fetchQuranMetadata } from '@/lib/quran-metadata'
import { auth } from '@/auth'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { meApiServer } from '@/src/api/me-server-client'

// Detect query intent: chapter, verse-list, or text search.
// Single verse refs AND ranges both go to verse-list (VerseListResult).
// Accepts both canonical "2:255" and space-separated "2 255" forms.
function parseQueryType(q: string): {
  type: 'chapter' | 'verse-list' | 'search'
  chapterNumber?: number
} {
  // Comma-separated verse refs: "1:4,1:1-5,2:45" or "1 4,1 1-5,2 45"
  if (q.includes(',')) {
    const parts = q.split(',').map((s) => normalizeQuranInput(s.trim()))
    if (parts.length > 0 && parts.every((p) => parseQuranRef(p) !== null)) {
      return { type: 'verse-list' }
    }
  }

  // Pure chapter number: "1", "2", "114"
  if (/^\d{1,3}$/.test(q)) {
    const n = parseInt(q)
    if (n >= 1 && n <= 114) return { type: 'chapter', chapterNumber: n }
  }

  // Single verse or verse range — both go to VerseListResult
  if (parseQuranRef(q) !== null) return { type: 'verse-list' }

  return { type: 'search' }
}

export default async function QuranPage({
  params,
  searchParams,
}: {
  params: Promise<{ query?: string[] }>
  searchParams: Promise<{ q?: string; verse?: string; ch?: string; ap?: string }>
}) {
  const { q, verse, ch, ap } = await searchParams
  const { query } = await params

  const rawQuery = q || query?.join(' ')
  const queryText = rawQuery ? decodeURIComponent(rawQuery) : undefined

  if (!queryText) {
    const locale = await getLocale()
    const [metadata, tQuran, tNav, tCommon, tSidebar] = await Promise.all([
      fetchQuranMetadata(locale),
      getTranslations('quran'),
      getTranslations('nav'),
      getTranslations('common'),
      getTranslations('sidebar'),
    ])

    const chapters = metadata.chapters
      .filter(Boolean)
      .sort((a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0))
    const appendices = metadata.appendices
      .filter(Boolean)
      .sort((a, b) => (a.code ?? 0) - (b.code ?? 0))

    // Localized titles for the continue card — reuses the /chapters fetch above
    // so the client card needs no request of its own.
    const chapterTitles: Record<number, string> = Object.fromEntries(
      chapters.map((c) => [c.chapter_number, c.title ?? '']),
    )

    // Study-band data, prefetched into react-query so a signed-in reader sees
    // their bookmarks, notes and streak in the first paint. Copies the pattern in
    // app/me/page.tsx, but never redirects: /quran is public, and the band
    // renders a sign-in prompt when there is no session.
    //
    // Reading stats are deliberately NOT prefetched. useReadingStats keys on the
    // browser's resolved timezone, which the server cannot know, so a prefetch
    // here would land under a different key and be thrown away. It loads client
    // side instead.
    const session = await auth()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000 } },
    })

    if (session?.accessToken) {
      const meApi = meApiServer(session.accessToken)
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['bookmark-categories'],
          queryFn: () => meApi.listBookmarkCategories(),
        }),
        queryClient.prefetchQuery({
          queryKey: ['notes', 'quran'],
          queryFn: () => meApi.getNotes('quran'),
        }),
        queryClient.prefetchQuery({
          queryKey: ['streak', 'quran'],
          queryFn: () => meApi.getStreak('quran'),
        }),
        queryClient.prefetchQuery({
          queryKey: ['cover-to-cover', 'quran'],
          queryFn: () => meApi.getCoverToCover('quran'),
        }),
      ])
    }

    // Bars for the right-edge section rail. Ids match the sections rendered
    // below; #chapters and #appendices belong to QuranAccordions. The continue
    // card resolves client side and renders nothing without reading progress,
    // so the rail drops that bar on its own when the section comes back empty.
    const railSections = [
      { id: 'quran-continue', label: tQuran('sectionContinue') },
      { id: 'quran-read', label: tQuran('bandRead') },
      { id: 'chapters', label: tSidebar('chapters') },
      { id: 'appendices', label: tSidebar('appendices') },
      { id: 'quran-study', label: tQuran('bandStudy') },
    ]

    // Three entry points into the book itself, ahead of the 114-chapter grid.
    const readCards = [
      {
        href: '/introduction',
        title: tNav('introduction'),
        description: tQuran('introductionDesc'),
        icon: BookOpen,
      },
      {
        href: '/proclamation',
        title: tNav('proclamation'),
        description: tQuran('proclamationDesc'),
        icon: BookOpen,
      },
      {
        href: '/quran/index',
        title: tQuran('indexTitle'),
        description: tQuran('indexDesc'),
        icon: ListTree,
      },
    ]

    return (
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* ── Hero ──────────────────────────────────────────────────── */}
          <section className="space-y-6 text-center max-w-xl mx-auto">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
                {tQuran('title')}
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                {tCommon('finalTestament')}
              </h1>
            </div>
            <QuranSearchBar large />
          </section>

          {/* ── Continue cover to cover (signed in, once marked) ──────── */}
          <div id="quran-continue" className="empty:hidden">
            <ContinueCoverToCoverSection chapterTitles={chapterTitles} />
          </div>

          {/* ── Read: the book ────────────────────────────────────────── */}
          <section id="quran-read" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
              {tQuran('bandRead')}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {readCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex flex-col gap-2 p-5 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                      <card.icon className="size-4 text-primary/70 shrink-0" />
                      <span className="truncate">{card.title}</span>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </Link>
              ))}
            </div>

            <QuranAccordions
              chapters={chapters}
              appendices={appendices}
              chaptersOpen={ch !== '0'}
              appendicesOpen={ap !== '0'}
            />
          </section>

          {/* ── Your study: bookmarks, notes, reading stats ───────────── */}
          <div id="quran-study">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <QuranStudyBand />
            </HydrationBoundary>
          </div>
        </div>

        <QuranSectionRail sections={railSections} />
      </main>
    )
  }

  const parsed = parseQueryType(queryText)

  // ── Chapter view: SSR first N verses via internal Railway network ───────────
  // If ?verse=N is set, start the SSR window 5 verses before the target so
  // scrollToIndex only needs to jump ~5 measured items — avoiding the
  // estimation error that occurs when scrolling past dozens of unmeasured items.
  if (parsed.type === 'chapter' && parsed.chapterNumber) {
    const targetVerse = verse ? parseInt(verse) : undefined
    // Chapters 1 and 9 have no pre-verse Basmala; all others start at verse 0.
    const verseFloor = (parsed.chapterNumber === 1 || parsed.chapterNumber === 9) ? 1 : 0
    const ssrVerseStart = targetVerse ? Math.max(verseFloor, targetVerse - 5) : verseFloor
    const ssrVerseEnd = ssrVerseStart + 49 // always fetch a 50-verse window

    let data = null
    try {
      const result = await wsApiServer.GET('/quran', {
        params: {
          query: {
            chapter_number_start: parsed.chapterNumber,
            langs: ['en', 'ar'],
            verse_start: ssrVerseStart,
            verse_end: ssrVerseEnd,
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar', 'en', 'tl'],
          },
        },
      })
      data = result.data ?? null
    } catch {
      // SSR fetch failed — ChapterReader will load verses client-side
    }

    return (
      <main>
        <ActivityRecorder
          kind="browse_chapter"
          scripture="quran"
          verseKey={`${parsed.chapterNumber}:${verse ?? 1}`}
        />
        <Suspense fallback={<Spinner />}>
          <ReaderBoot
            key={`${parsed.chapterNumber}-${verse ?? 'full'}`}
            chapterNumber={parsed.chapterNumber}
            initialData={data}
            initialVerse={verse}
          />
        </Suspense>
      </main>
    )
  }

  // ── Verse list: single refs, ranges, and comma-separated lists ──────────────
  if (parsed.type === 'verse-list') {
    return (
      <main className="py-8 px-4">
        <ActivityRecorder
          kind={queryText.includes('-') || queryText.includes(',') ? 'browse_verse_range' : 'browse_verse'}
          scripture="quran"
          query={queryText}
        />
        <Suspense
          fallback={<VerseListSkeleton queryText={queryText} zoom="comfortable" />}
        >
          <VerseListFetcher queryText={queryText} />
        </Suspense>
      </main>
    )
  }

  // ── Verse ref & text search: client-side via SearchResult ────────────────────
  return (
    <main className="pt-6 sm:pt-8 px-4">
      <ActivityRecorder kind="search" scripture="quran" query={queryText} />
      <section>
        <Suspense fallback={<Spinner />}>
          <SearchResult props={{ query: queryText }} />
        </Suspense>
      </section>
    </main>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ query?: string[] }>
  searchParams: Promise<{ q?: string; verse?: string }>
}): Promise<Metadata> {
  const { q, verse: verseParam } = await searchParams
  const { query } = await params
  const queryText = decodeURIComponent(q || query?.join(' ') || '')

  if (!queryText) {
    return buildPageMetadata({
      title: 'Quran | The Final Testament | WikiSubmission',
      description: 'Read and study the Final Testament (Quran) at WikiSubmission — a free and open-source platform for Submission',
      url: '/quran',
    })
  }

  const parsed = parseQueryType(queryText)

  const LOGO = '/brand-assets/logo-transparent.png'

  if (parsed.type === 'chapter' && parsed.chapterNumber) {
    // If a specific verse is anchored, resolve metadata for that verse instead
    const specificVerse = verseParam ? parseInt(verseParam) : undefined
    if (specificVerse && specificVerse > 0) {
      let verseText = ''
      let chapterTitle = ''
      try {
        const locale = await getLocale()
        const [chapters, verseRes] = await Promise.all([
          fetchChapters(locale),
          wsApiServer.GET('/quran', {
            params: {
              query: {
                chapter_number_start: parsed.chapterNumber,
                langs: ['en'],
                verse_start: specificVerse,
                verse_end: specificVerse,
              },
            },
          }),
        ])
        const ch = chapters.find((c) => c.chapter_number === parsed.chapterNumber)
        if (ch?.title) chapterTitle = ch.title
        const tx = verseRes.data?.chapters?.[0]?.verses?.[0]?.tr?.['en']?.tx ?? ''
        verseText = tx.length > 220 ? tx.slice(0, 217) + '...' : tx
      } catch {}
      const ref = `${parsed.chapterNumber}:${specificVerse}`
      const title = chapterTitle
        ? `${ref} | ${chapterTitle} | Quran | WikiSubmission`
        : `${ref} | Quran | WikiSubmission`
      const description = verseText
        ? `[${ref}] ${verseText}`
        : `Verse ${ref} of the Final Testament`
      return buildPageMetadata({
        title,
        description,
        url: `/quran/${parsed.chapterNumber}?verse=${specificVerse}`,
        image: LOGO,
        twitterCard: 'summary',
      })
    }

    let chapterTitle = ''
    let verseCount = 0
    let versePreview = ''
    try {
      const locale = await getLocale()
      const [chapters, versesRes] = await Promise.all([
        fetchChapters(locale),
        wsApiServer.GET('/quran', {
          params: {
            query: {
              chapter_number_start: parsed.chapterNumber,
              langs: ['en'],
              verse_start: 1,
              verse_end: 3,
            },
          },
        }),
      ])
      const ch = chapters.find((c) => c.chapter_number === parsed.chapterNumber)
      if (ch?.title) chapterTitle = ch.title
      if (ch?.verse_count) verseCount = ch.verse_count
      const verses = versesRes.data?.chapters?.[0]?.verses ?? []
      const joined = verses
        .map((v) => `[${v.vk}] ${v.tr?.['en']?.tx ?? ''}`)
        .join(' ')
        .trim()
      versePreview = joined.length > 220 ? joined.slice(0, 217) + '...' : joined
    } catch {}

    const title = chapterTitle
      ? `Sura ${parsed.chapterNumber}: ${chapterTitle} | Quran | WikiSubmission`
      : `Sura ${parsed.chapterNumber} | Quran | WikiSubmission`
    const countNote = verseCount ? ` (${verseCount} verses)` : ''
    const description = versePreview
      ? versePreview
      : `Read Sura ${parsed.chapterNumber}${chapterTitle ? ` (${chapterTitle})` : ''} of the Final Testament${countNote}`
    return buildPageMetadata({
      title,
      description,
      url: `/quran/${parsed.chapterNumber}`,
      image: LOGO,
      twitterCard: 'summary',
    })
  }

  if (parsed.type === 'verse-list') {
    // Normalise: add space after each comma for display
    const queryParts = queryText.split(',').map((s) => s.trim())
    const displayQuery = queryParts.join(', ')
    const title = `${displayQuery} | Quran | WikiSubmission`
    let description = `Read ${displayQuery} from the Final Testament (Quran)`
    try {
      const result = await wsApiServer.GET('/quran', {
        params: {
          query: {
            langs: ['en'],
            verses: queryText,
          },
        },
      })
      const allVerses = (result.data?.chapters ?? []).flatMap((c) => c.verses ?? [])
      // Reorder verses to match the original query order (API returns by chapter number)
      const sorted = [...allVerses].sort((a, b) => {
        const vkA = a.vk ?? ''
        const vkB = b.vk ?? ''
        const indexOf = (vk: string) => {
          const idx = queryParts.findIndex((qp) => {
            if (vk === qp) return true
            const rm = qp.match(/^(\d+):(\d+)-(\d+)$/)
            if (rm) {
              const vm = vk.match(/^(\d+):(\d+)$/)
              if (vm && vm[1] === rm[1]) {
                const n = parseInt(vm[2])
                return n >= parseInt(rm[2]) && n <= parseInt(rm[3])
              }
            }
            return false
          })
          return idx === -1 ? 999 : idx
        }
        return indexOf(vkA) - indexOf(vkB)
      })
      const joined = sorted
        .map((v) => `[${v.vk}] ${v.tr?.['en']?.tx ?? ''}`)
        .join(' ')
        .trim()
      if (joined) description = joined.length > 220 ? joined.slice(0, 217) + '...' : joined
    } catch {}
    return buildPageMetadata({
      title,
      description,
      url: `/quran?q=${encodeURIComponent(queryText)}`,
      image: LOGO,
      twitterCard: 'summary',
    })
  }

  // text search
  const title = `"${queryText}" | Quran Search | WikiSubmission`
  const description = `Search results for "${queryText}" in the Final Testament (Quran)`
  return buildPageMetadata({
    title,
    description,
    url: `/quran?q=${encodeURIComponent(queryText)}`,
    image: LOGO,
    twitterCard: 'summary',
  })
}
