'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { RandomVerseTile } from './random-verse-tile'
import { useLocale, useTranslations } from 'next-intl'
import type { components } from '@/src/api/types.gen'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

const RTL_LOCALES = new Set(['ar', 'ku', 'fa', 'ur'])

interface Props {
  chapters: Chapter[]
  appendices: Appendix[]
  chaptersOpen: boolean
  appendicesOpen: boolean
}

export function QuranAccordions({
  chapters,
  appendices,
  chaptersOpen: initCh,
  appendicesOpen: initAp,
}: Props) {
  const [chaptersOpen, setChaptersOpen] = useState(initCh)
  const [appendicesOpen, setAppendicesOpen] = useState(initAp)
  const tSidebar = useTranslations('sidebar')
  const locale = useLocale()
  const titleDir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'

  function syncUrl(key: 'ch' | 'ap', open: boolean) {
    const url = new URL(window.location.href)
    if (!open) url.searchParams.set(key, '0')
    else url.searchParams.delete(key)
    window.history.replaceState(null, '', url)
  }

  function toggleChapters() {
    const next = !chaptersOpen
    setChaptersOpen(next)
    syncUrl('ch', next)
  }

  function toggleAppendices() {
    const next = !appendicesOpen
    setAppendicesOpen(next)
    syncUrl('ap', next)
  }

  return (
    <>
      {/* ── Chapters ──────────────────────────────────────────────────── */}
      <section id="chapters">
        <button
          onClick={toggleChapters}
          className="flex items-center justify-between w-full py-2 border-b border-border/40"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {tSidebar('chapters')}
          </h2>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${chaptersOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {chaptersOpen && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <RandomVerseTile />
            {chapters.map((ch) => (
              <Link
                key={ch.chapter_number}
                href={`/quran/${ch.chapter_number}`}
                className="flex flex-col gap-1 p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group"
              >
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {ch.chapter_number}
                </span>
                <span
                  className="text-sm font-medium leading-snug line-clamp-2"
                  dir={titleDir}
                >
                  {ch.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Appendices ────────────────────────────────────────────────── */}
      <section id="appendices">
        <button
          onClick={toggleAppendices}
          className="flex items-center justify-between w-full py-2 border-b border-border/40"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {tSidebar('appendices')}
          </h2>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${appendicesOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {appendicesOpen && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {appendices.map((app) => (
              <Link
                key={app.code}
                href={`/appendices/${app.code}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group"
              >
                <span className="flex-shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
                  {app.code}
                </span>
                <span
                  className="text-sm flex-1 min-w-0 truncate group-hover:text-foreground transition-colors"
                  dir={titleDir}
                >
                  {app.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
