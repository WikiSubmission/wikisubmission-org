'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { RandomVerseTile } from './random-verse-tile'
import { useLocale, useTranslations } from 'next-intl'
import type { components } from '@/src/api/types.gen'
import { directionForUiLocale } from '@/constants/ui-locales'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

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
  const titleDir = directionForUiLocale(locale)

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
    <div className="space-y-8">
      {/* ── Chapters ──────────────────────────────────────────────────── */}
      <section id="chapters" className="space-y-4">
        <button
          onClick={toggleChapters}
          type="button"
          className="flex items-center justify-between w-full py-2.5 border-b cursor-pointer transition-colors"
          style={{ borderColor: 'var(--ed-rule)' }}
        >
          <div className="flex items-baseline gap-2.5">
            <span
              style={{
                fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ed-accent)',
                fontWeight: 600,
              }}
            >
              114
            </span>
            <span style={{ color: 'var(--ed-rule)' }}>/</span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'var(--ed-fg)',
                margin: 0,
              }}
            >
              {tSidebar('chapters')}
            </h2>
          </div>
          <ChevronDown
            className={`size-4 text-[var(--ed-fg-muted)] transition-transform duration-200 ${chaptersOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {chaptersOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            <RandomVerseTile />
            {chapters.map((ch) => (
              <Link
                key={ch.chapter_number}
                href={`/quran/${ch.chapter_number}`}
                className="flex flex-col justify-between p-3.5 rounded-lg border transition-all duration-200 group cursor-pointer hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--ed-surface)',
                  borderColor: 'var(--ed-rule)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    color: 'var(--ed-accent)',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {String(ch.chapter_number).padStart(2, '0')}
                </span>
                <span
                  className="text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-[var(--ed-accent)]"
                  style={{
                    fontFamily: 'var(--font-source-serif), Georgia, serif',
                    color: 'var(--ed-fg)',
                  }}
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
      <section id="appendices" className="space-y-4">
        <button
          onClick={toggleAppendices}
          type="button"
          className="flex items-center justify-between w-full py-2.5 border-b cursor-pointer transition-colors"
          style={{ borderColor: 'var(--ed-rule)' }}
        >
          <div className="flex items-baseline gap-2.5">
            <span
              style={{
                fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ed-accent)',
                fontWeight: 600,
              }}
            >
              38
            </span>
            <span style={{ color: 'var(--ed-rule)' }}>/</span>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'var(--ed-fg)',
                margin: 0,
              }}
            >
              {tSidebar('appendices')}
            </h2>
          </div>
          <ChevronDown
            className={`size-4 text-[var(--ed-fg-muted)] transition-transform duration-200 ${appendicesOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {appendicesOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {appendices.map((app) => (
              <Link
                key={app.code}
                href={`/appendices/${app.code}`}
                className="flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-200 group cursor-pointer hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--ed-surface)',
                  borderColor: 'var(--ed-rule)',
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center size-7 rounded-md font-mono text-xs font-semibold"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--ed-accent) 12%, transparent)',
                    color: 'var(--ed-accent)',
                  }}
                >
                  {app.code}
                </span>
                <span
                  className="text-sm font-medium flex-1 min-w-0 truncate group-hover:text-[var(--ed-accent)] transition-colors"
                  style={{
                    fontFamily: 'var(--font-source-serif), Georgia, serif',
                    color: 'var(--ed-fg)',
                  }}
                  dir={titleDir}
                >
                  {app.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
