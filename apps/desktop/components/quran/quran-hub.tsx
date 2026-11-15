'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowRight, BookOpen, ListTree } from 'lucide-react'
import QuranSearchBar from '@web/app/quran/[[...query]]/client-components/search-bar'
import { QuranSectionRail } from '@web/app/quran/[[...query]]/client-components/section-rail'
import { QuranAccordions } from '@web/app/quran/[[...query]]/mini-components/quran-accordions'
import { ContinueCoverToCoverSection } from '@web/app/quran/[[...query]]/mini-components/continue-cover-to-cover-section'
import { QuranStudyBand } from '@web/app/quran/[[...query]]/mini-components/quran-study-band'
import { useAppendices, useChapters } from '@/hooks/use-quran-metadata'
import { quranSearchHref } from '@/lib/desktop-links'

/**
 * The /quran hub: client counterpart of the no-query branch of
 * apps/web/app/quran/[[...query]]/page.tsx, with the same sections.
 */
export function QuranHub() {
  const router = useRouter()
  const params = useSearchParams()
  const q = params.get('q')
  const tQuran = useTranslations('quran')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tSidebar = useTranslations('sidebar')

  // The web app answers /quran?q=… with results; here that lives on the
  // search page (activity history links use this form).
  useEffect(() => {
    if (q?.trim()) router.replace(quranSearchHref(q.trim()))
  }, [q, router])

  const chaptersData = useChapters().data
  const appendicesData = useAppendices().data

  const chapters = useMemo(
    () =>
      (chaptersData ?? [])
        .filter(Boolean)
        .sort((a, b) => (a.chapter_number ?? 0) - (b.chapter_number ?? 0)),
    [chaptersData],
  )
  const appendices = useMemo(
    () => (appendicesData ?? []).filter(Boolean).sort((a, b) => (a.code ?? 0) - (b.code ?? 0)),
    [appendicesData],
  )
  const chapterTitles = useMemo<Record<number, string>>(
    () => Object.fromEntries(chapters.map((c) => [c.chapter_number, c.title ?? ''])),
    [chapters],
  )

  const railSections = [
    { id: 'quran-continue', label: tQuran('sectionContinue') },
    { id: 'quran-read', label: tQuran('bandRead') },
    { id: 'chapters', label: tSidebar('chapters') },
    { id: 'appendices', label: tSidebar('appendices') },
    { id: 'quran-study', label: tQuran('bandStudy') },
  ]

  const readCards = [
    { href: '/introduction/', title: tNav('introduction'), description: tQuran('introductionDesc'), icon: BookOpen },
    { href: '/proclamation/', title: tNav('proclamation'), description: tQuran('proclamationDesc'), icon: BookOpen },
    { href: '/quran/index/', title: tQuran('indexTitle'), description: tQuran('indexDesc'), icon: ListTree },
  ]

  return (
    <main className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <section className="space-y-6 text-center max-w-xl mx-auto">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
              {tQuran('title')}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">{tCommon('finalTestament')}</h1>
          </div>
          <QuranSearchBar large />
        </section>

        <div id="quran-continue" className="empty:hidden">
          <ContinueCoverToCoverSection chapterTitles={chapterTitles} />
        </div>

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
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </Link>
            ))}
          </div>
          <QuranAccordions
            chapters={chapters}
            appendices={appendices}
            chaptersOpen={params.get('ch') !== '0'}
            appendicesOpen={params.get('ap') !== '0'}
          />
        </section>

        <div id="quran-study">
          <QuranStudyBand />
        </div>
      </div>

      <QuranSectionRail sections={railSections} />
    </main>
  )
}
