'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { Copy, Check, ChevronDown, Pause, Play, BookOpen } from 'lucide-react'
import { F, SectionDivider, Arrow } from './shared'
import { BIBLE_BOOKS } from '@/constants/bible-books'

function buildVerseHref(tabKey: Tab['key'], ref: string): string {
  if (tabKey === 'quran') {
    return `/quran/${ref}`
  }
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/)
  if (!match) return tabKey === 'ot' || tabKey === 'nt' ? '/bible' : '/'
  const [, bookName, chapter, verse] = match
  const book = BIBLE_BOOKS.find((b) => b.bk.toLowerCase() === bookName.toLowerCase())
  if (!book) return '/bible'
  return `/bible/${book.slug}/${chapter}?verse=${verse}`
}

type Verse = {
  ref: string
  title: string
  english: string
  footnote?: string
}

type Tab = {
  key: 'quran' | 'ot' | 'nt'
  label: string
  sub: string
  verses: Verse[]
}

const ROTATE_MS = 7500

function VerseText({
  verseKey,
  verse,
}: {
  verseKey: string
  verse: Verse
}) {
  const ref = useRef<HTMLParagraphElement | null>(null)
  const prevKeyRef = useRef(verseKey)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prevKeyRef.current === verseKey) {
      gsap.set(el, { opacity: 1, y: 0 })
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      )
    }
    prevKeyRef.current = verseKey
  }, [verseKey])

  return (
    <p
      ref={ref}
      style={{
        fontFamily: F.display,
        fontSize: 'clamp(23px, 3.4vw, 35px)',
        lineHeight: 1.42,
        color: 'var(--ed-fg)',
        letterSpacing: '-0.018em',
        maxWidth: '56ch',
        margin: 0,
      }}
      className="select-text"
    >
      <span
        aria-hidden
        style={{
          color: 'var(--ed-accent)',
          fontSize: '1.25em',
          lineHeight: 0,
          marginRight: 6,
          fontFamily: F.display,
          opacity: 0.75,
        }}
      >
        &ldquo;
      </span>
      {verse.english}
    </p>
  )
}

export function VerseOfTheDaySection() {
  const t = useTranslations('homePage.verseOfDay')
  const [copied, setCopied] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFootnoteOpen, setIsFootnoteOpen] = useState(false)

  const TABS: Tab[] = useMemo(
    () => [
      {
        key: 'quran',
        label: t('tabQuran'),
        sub: t('tabQuranSub'),
        verses: [
          {
            ref: '2:62',
            title: t('quran1Title'),
            english: t('quran1Text'),
            footnote: t('quran1Footnote'),
          },
          {
            ref: '3:19',
            title: t('quran2Title'),
            english: t('quran2Text'),
            footnote: t('quran2Footnote'),
          },
          {
            ref: '25:1',
            title: t('quran3Title'),
            english: t('quran3Text'),
            footnote: t('quran3Footnote'),
          },
        ],
      },
      {
        key: 'ot',
        label: t('tabOt'),
        sub: t('tabOtSub'),
        verses: [
          {
            ref: 'Deuteronomy 6:4',
            title: t('ot1Title'),
            english: t('ot1Text'),
            footnote: t('ot1Footnote'),
          },
          {
            ref: 'Isaiah 42:8',
            title: t('ot2Title'),
            english: t('ot2Text'),
            footnote: t('ot2Footnote'),
          },
          {
            ref: 'Micah 6:8',
            title: t('ot3Title'),
            english: t('ot3Text'),
            footnote: t('ot3Footnote'),
          },
        ],
      },
      {
        key: 'nt',
        label: t('tabNt'),
        sub: t('tabNtSub'),
        verses: [
          {
            ref: 'Mark 12:29',
            title: t('nt1Title'),
            english: t('nt1Text'),
            footnote: t('nt1Footnote'),
          },
          {
            ref: 'John 17:3',
            title: t('nt2Title'),
            english: t('nt2Text'),
            footnote: t('nt2Footnote'),
          },
          {
            ref: 'James 2:19',
            title: t('nt3Title'),
            english: t('nt3Text'),
          },
        ],
      },
    ],
    [t],
  )

  const [tabKey, setTabKey] = useState<Tab['key']>('quran')
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const current = useMemo(
    () => TABS.find((tab) => tab.key === tabKey) ?? TABS[0],
    [tabKey, TABS],
  )

  const v = current.verses[idx] ?? current.verses[0]
  const continueHref = buildVerseHref(tabKey, v.ref)

  // Reset index & footnote disclosure when switching scripture traditions
  const handleTabChange = useCallback((key: Tab['key']) => {
    setTabKey(key)
    setIdx(0)
    setProgress(0)
    setIsFootnoteOpen(false)
  }, [])

  // Smooth rotation timer with pause on hover/focus and manual pause
  const shouldPause = isPaused || isHovered

  useEffect(() => {
    if (shouldPause) return

    const intervalMs = 50
    const step = (intervalMs / ROTATE_MS) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIdx((currentIdx) => (currentIdx + 1) % current.verses.length)
          setIsFootnoteOpen(false)
          return 0
        }
        return prev + step
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [shouldPause, current.verses.length])

  const selectVerse = (index: number) => {
    setIdx(index)
    setProgress(0)
    setIsFootnoteOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${v.english}\n— ${v.ref}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // fallback if clipboard API is restricted
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
      className="relative"
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── Editorial Reading Lectern / Folio ── */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-xs transition-colors duration-300"
          style={{ borderRadius: 0 }}
        >
          {/* Subtle top hairline progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
            <div
              className="h-full bg-[var(--ed-accent)] transition-[width] duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                opacity: shouldPause ? 0.35 : 0.85,
              }}
            />
          </div>

          {/* ── Top Folio Header & Tradition Selector ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[var(--ed-rule)] px-5 py-3 sm:px-8 sm:py-3.5 gap-4">
            {/* Archival category kicker */}
            <div className="flex items-center gap-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]"
                aria-hidden
              />
              <span
                style={{ fontFamily: F.glacial }}
                className="text-[10px] sm:text-[10.5px] font-semibold tracking-[0.18em] uppercase text-[var(--ed-fg-muted)]"
              >
                {t('todayLabel')} · {current.sub}
              </span>
            </div>

            {/* Text-First Editorial Segmented Tabs */}
            <div
              role="tablist"
              aria-label={t('dividerTitle')}
              className="flex items-center gap-1 sm:gap-2 self-start sm:self-auto overflow-x-auto no-scrollbar"
            >
              {TABS.map((tab) => {
                const isActive = tabKey === tab.key
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    id={`tab-${tab.key}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.key}`}
                    onClick={() => handleTabChange(tab.key)}
                    type="button"
                    className="relative group px-3.5 py-1.5 text-left cursor-pointer transition-colors"
                  >
                    <span
                      style={{ fontFamily: F.glacial }}
                      className={`block text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                        isActive
                          ? 'text-[var(--ed-fg)]'
                          : 'text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-fg)]'
                      }`}
                    >
                      {tab.label}
                    </span>

                    {/* Active hairline indicator */}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-[1.5px] transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--ed-accent)] opacity-100 scale-x-100'
                          : 'bg-transparent opacity-0 scale-x-50 group-hover:opacity-40 group-hover:bg-[var(--ed-rule)]'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Main Reading Body ── */}
          <div
            id={`panel-${tabKey}`}
            role="tabpanel"
            aria-labelledby={`tab-${tabKey}`}
            className="p-6 sm:p-10 lg:p-12 flex flex-col gap-6"
          >
            {/* Archival Citation & Utility Action Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--ed-rule)]">
              <div className="flex items-baseline gap-3.5 flex-wrap">
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase text-[var(--ed-accent)]"
                >
                  {v.ref}
                </span>

                <span aria-hidden className="text-[var(--ed-rule)] text-sm">
                  /
                </span>

                <span
                  style={{ fontFamily: F.display }}
                  className="text-lg sm:text-xl italic text-[var(--ed-fg-muted)] tracking-tight"
                >
                  {v.title}
                </span>
              </div>

              {/* Utility Toolbar: Pause/Resume + Copy Citation */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Pause/Resume Auto-Rotation */}
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] border border-[var(--ed-rule)] bg-transparent text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-fg)] transition-all cursor-pointer rounded-[2px]"
                  style={{ fontFamily: F.mono }}
                  title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                  aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                >
                  {isPaused ? (
                    <>
                      <Play size={10} className="fill-current" />
                      <span className="hidden sm:inline">Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause size={10} className="fill-current" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  )}
                </button>

                {/* Copy Citation Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] border border-[var(--ed-rule)] bg-transparent text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-fg)] transition-all cursor-pointer rounded-[2px]"
                  style={{ fontFamily: F.mono }}
                  title="Copy scripture citation to clipboard"
                  aria-label="Copy scripture citation to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-500 shrink-0" />
                      <span className="text-emerald-500 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="shrink-0 opacity-70" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* The Verse Text — Visual Focal Point */}
            <div className="py-2 sm:py-4">
              <VerseText verseKey={`${tabKey}-${idx}`} verse={v} />
            </div>

            {/* ── Watermelon-Style Footnote Accordion Disclosure ── */}
            {v.footnote && (
              <div className="pt-2 border-t border-[var(--ed-rule)]">
                <button
                  type="button"
                  onClick={() => setIsFootnoteOpen(!isFootnoteOpen)}
                  aria-expanded={isFootnoteOpen}
                  aria-controls={`footnote-content-${tabKey}-${idx}`}
                  className="group inline-flex items-center gap-2 py-1 text-left cursor-pointer transition-colors text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
                >
                  <BookOpen size={13} className="text-[var(--ed-accent)] opacity-80" />
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[10px] sm:text-[10.5px] font-semibold tracking-[0.14em] uppercase"
                  >
                    {isFootnoteOpen ? 'Hide Scholarly Context' : 'View Scholarly Context'}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ease-out text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-fg)] ${
                      isFootnoteOpen ? 'rotate-180 text-[var(--ed-accent)]' : ''
                    }`}
                  />
                </button>

                {/* Animated Accordion Drawer */}
                <div
                  id={`footnote-content-${tabKey}-${idx}`}
                  role="region"
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isFootnoteOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-3'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="border-l-2 border-[var(--ed-accent)] bg-[var(--ed-bg-alt)]/60 px-4 py-3 sm:px-5 sm:py-3.5"
                      style={{
                        fontFamily: F.serif,
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--ed-fg-muted)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          style={{ fontFamily: F.glacial }}
                          className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-[var(--ed-accent)]"
                        >
                          {t('footnoteLabel')}
                        </span>
                      </div>
                      <p className="m-0 text-[var(--ed-fg)]/90">{v.footnote}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Navigation & Contextual Chapter CTA ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-[var(--ed-rule)] bg-[var(--ed-bg-alt)] px-5 py-4 sm:px-8 sm:py-4 gap-4">
            {/* Primary Action: Continue into Chapter */}
            <div className="flex items-center gap-4">
              <Link
                href={continueHref}
                className="ed-btn-primary"
                style={{
                  fontFamily: F.serif,
                  padding: '9px 18px',
                  fontSize: '13.5px',
                }}
              >
                <span>{t('continueChapter')}</span>
                <Arrow size={13} />
              </Link>

              <span
                style={{ fontFamily: F.mono }}
                className="hidden md:inline text-[11px] text-[var(--ed-fg-muted)]"
              >
                {current.label} · Chapter context
              </span>
            </div>

            {/* Reading Sequence Indicators */}
            <div
              aria-label={t('rotationLabel')}
              className="flex items-center gap-2 self-end sm:self-auto"
            >
              <span
                style={{ fontFamily: F.glacial }}
                className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ed-fg-muted)] mr-1 hidden sm:inline"
              >
                Passage
              </span>

              {current.verses.map((item, i) => {
                const isActive = i === idx
                const numLabel = String(i + 1).padStart(2, '0')
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectVerse(i)}
                    aria-label={t('verseAria', { n: i + 1 })}
                    aria-current={isActive ? 'true' : undefined}
                    title={`${item.ref} — ${item.title}`}
                    className={`relative inline-flex items-center justify-center px-2.5 py-1 text-xs transition-all cursor-pointer border rounded-[2px] ${
                      isActive
                        ? 'border-[var(--ed-accent)] bg-[var(--ed-surface)] text-[var(--ed-accent)] font-semibold shadow-2xs'
                        : 'border-[var(--ed-rule)] bg-transparent text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-fg-muted)]'
                    }`}
                    style={{ fontFamily: F.mono }}
                  >
                    <span>{numLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
