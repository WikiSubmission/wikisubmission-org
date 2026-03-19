'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import {
  useChapterReader,
  type QuranResponse,
  type ChapterReaderOptions,
} from '@/hooks/use-chapter-reader'
import { VerseCard } from '../mini-components/verse-card'
import { useTranslations } from 'next-intl'

export function ChapterReader({
  chapterNumber,
  initialData,
}: {
  chapterNumber: number
  initialData: QuranResponse | null
}) {
  const prefs = useQuranPreferences()
  const reader = useChapterReader(chapterNumber, initialData)
  const t = useTranslations('quran')
  const tCommon = useTranslations('common')
  // Capture once at mount — must not react to later IntersectionObserver replaceState calls
  const searchParams = useSearchParams()
  const [initialVerseParam] = useState(() => searchParams.get('verse'))
  const scrolledRef = useRef(false)
  const [scrolled, setScrolled] = useState(false)

  const opts: ChapterReaderOptions = {
    primaryLang: prefs.primaryLanguage,
    secondaryLang: prefs.secondaryLanguage,
    includeArabic: prefs.arabic,
    includeWords: prefs.arabic,
    includeRoot: prefs.arabic,
    includeMeaning: prefs.arabic,
  }

  // Re-fetch when API-relevant preferences change
  const prevOptsRef = useRef(opts)
  useEffect(() => {
    const prev = prevOptsRef.current
    const changed =
      prev.primaryLang !== opts.primaryLang ||
      prev.secondaryLang !== opts.secondaryLang ||
      prev.includeArabic !== opts.includeArabic

    if (changed) reader.reload(opts)
    prevOptsRef.current = opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.primaryLanguage, prefs.secondaryLanguage, prefs.arabic])

  // Initial load if SSR returned nothing
  useEffect(() => {
    if (reader.verses.length === 0) reader.reload(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to ?verse=N once it's rendered. Uses a ref for the guard to avoid
  // stale-closure double-fires when batches load in rapid succession.
  useEffect(() => {
    if (!initialVerseParam || scrolledRef.current) return
    const el = document.getElementById(`${chapterNumber}:${initialVerseParam}`)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' })
      scrolledRef.current = true
      setScrolled(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reader.verses.length, initialVerseParam, chapterNumber])

  // Auto-preload: silently fetch next batch while user reads.
  // When seeking a specific verse, skip the delay so we reach it as fast as possible.
  useEffect(() => {
    if (!reader.hasMore || reader.loading) return
    const isSeekingVerse = !!initialVerseParam && !scrolled
    const timer = setTimeout(() => reader.loadMore(opts), isSeekingVerse ? 50 : 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reader.verses.length, reader.hasMore, reader.loading, initialVerseParam, scrolled])

  // Reveal the prev/next footer once the user reaches (or nearly reaches) the end.
  const [showNav, setShowNav] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShowNav(true) },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  const chapterTitle =
    reader.chapterTitles?.['en'] ??
    reader.chapterTitles?.[prefs.primaryLanguage] ??
    t('sura', { number: chapterNumber })

  return (
    <div className="space-y-2 pb-8">
      {/* Chapter title */}
      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold pl-1">
            {t('chapter', { number: chapterNumber, title: chapterTitle })}
          </h1>
          {reader.loading && reader.verses.length > 0 && (
            <p className="text-xs text-muted-foreground pl-1 flex items-center gap-1">
              <Spinner className="size-3" />
              {tCommon('loading')}
            </p>
          )}
        </div>
        {reader.chapterTitles?.['ar'] && (
          <h1 className="text-2xl font-bold font-arabic">
            {reader.chapterTitles['ar']}
          </h1>
        )}
      </div>

      {/* Verse list — flat DOM, window scroll, no inner scroller → no double scrollbar */}
      <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
        {reader.verses.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          reader.verses.map((verse, index) => (
            <VerseCard
              key={verse.vk ?? index}
              verse={verse}
              allVerses={reader.verses}
              isLast={index === reader.verses.length - 1 && !reader.hasMore}
            />
          ))
        )}
      </div>

      {reader.error && (
        <p className="text-sm text-destructive text-center py-2">{reader.error}</p>
      )}

      {/* Sentinel — IntersectionObserver watches this to reveal the nav */}
      <div ref={sentinelRef} aria-hidden />

      {/* Prev / Next chapter — hidden until user scrolls to the end */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showNav ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex justify-between items-center gap-4 pt-2 pb-24">
          {chapterNumber > 1 ? (
            <Link href={`/quran/${chapterNumber - 1}`} prefetch>
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                <span>
                  <span className="hidden sm:inline">{tCommon('chapter')} </span>
                  {chapterNumber - 1}
                </span>
              </Button>
            </Link>
          ) : (
            <span />
          )}

          {chapterNumber < 114 ? (
            <Link href={`/quran/${chapterNumber + 1}`} prefetch className="ml-auto">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <span>
                  <span className="hidden sm:inline">{tCommon('chapter')} </span>
                  {chapterNumber + 1}
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Button>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  )
}
