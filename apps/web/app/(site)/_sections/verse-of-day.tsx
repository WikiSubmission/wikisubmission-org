'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { Copy, Check } from 'lucide-react'
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

const ROTATE_MS = 7000

function ProgressBar({ progressKey, durationMs }: { progressKey: number; durationMs: number }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: 1, duration: durationMs / 1000, ease: 'none' },
    )
  }, [progressKey, durationMs])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--ed-accent)',
        transformOrigin: 'left center',
        transform: 'scaleX(0)',
        zIndex: 10,
        opacity: 0.6,
      }}
    />
  )
}

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
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      )
    }
    prevKeyRef.current = verseKey
  }, [verseKey])

  return (
    <p
      ref={ref}
      style={{
        fontFamily: F.display,
        fontSize: 'clamp(22px, 5vw, 30px)',
        lineHeight: 1.35,
        color: 'var(--ed-fg)',
        letterSpacing: '-0.015em',
        maxWidth: '52ch',
        margin: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          color: 'var(--ed-accent)',
          fontSize: '1.4em',
          lineHeight: 0,
          marginRight: 6,
          fontFamily: F.display,
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
  const [progressKey, setProgressKey] = useState(0)

  const current = useMemo(
    () => TABS.find((tab) => tab.key === tabKey) ?? TABS[0],
    [tabKey, TABS],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(0)
    setProgressKey((k) => k + 1)
  }, [tabKey])

  useEffect(() => {
    const tm = setInterval(() => {
      setIdx((p) => (p + 1) % current.verses.length)
      setProgressKey((k) => k + 1)
    }, ROTATE_MS)
    return () => clearInterval(tm)
  }, [current.verses.length])

  const v = current.verses[idx]
  const continueHref = buildVerseHref(tabKey, v.ref)

  const handleCopy = () => {
    navigator.clipboard.writeText(`${v.english}\n— ${v.ref}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
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

        <div
          style={{
            border: '1px solid var(--ed-rule)',
            borderRadius: 0,
            backgroundColor: 'var(--ed-surface)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ProgressBar progressKey={progressKey} durationMs={ROTATE_MS} />

          <div
            className="flex items-center justify-between gap-3 flex-wrap"
            style={{
              padding: 'clamp(16px, 3vw, 22px) clamp(20px, 4vw, 32px)',
              borderBottom: '1px solid var(--ed-rule)',
            }}
          >
            <div
              style={{
                fontFamily: F.glacial,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              {t('todayLabel')} · {current.sub}
            </div>
            <div
              role="tablist"
              style={{
                display: 'inline-flex',
                gap: 0,
                padding: 0,
                border: '1px solid var(--ed-rule)',
                borderRadius: 0,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={tabKey === tab.key}
                  onClick={() => setTabKey(tab.key)}
                  type="button"
                  style={{
                    fontFamily: F.glacial,
                    fontSize: 10,
                    fontWeight: tabKey === tab.key ? 700 : 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    border: 'none',
                    background:
                      tabKey === tab.key ? 'var(--ed-fg)' : 'transparent',
                    color:
                      tabKey === tab.key
                        ? 'var(--ed-bg)'
                        : 'var(--ed-fg-muted)',
                    cursor: 'pointer',
                    borderRadius: 0,
                    transition: 'all 150ms',
                    borderRight: '1px solid var(--ed-rule)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'baseline',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: F.glacial,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                }}
              >
                {v.ref}
              </span>
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 20,
                  fontStyle: 'italic',
                  color: 'var(--ed-fg-muted)',
                  letterSpacing: '-0.01em',
                }}
              >
                {v.title}
              </span>

              <button
                onClick={handleCopy}
                className="ml-auto p-2 opacity-50 hover:opacity-100 transition-opacity"
                title="Copy verse"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>

            <VerseText verseKey={`${tabKey}-${idx}`} verse={v} />

            {v.footnote && (
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: 'var(--ed-fg-muted)',
                  paddingTop: 14,
                  borderTop: '1px solid var(--ed-rule)',
                }}
              >
                <span
                  style={{
                    fontFamily: F.glacial,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-fg-muted)',
                    marginRight: 10,
                  }}
                >
                  {t('footnoteLabel')}
                </span>
                {v.footnote}
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between gap-3 flex-wrap"
            style={{
              padding: 'clamp(16px, 3vw, 20px) clamp(20px, 4vw, 32px)',
              borderTop: '1px solid var(--ed-rule)',
              backgroundColor: 'var(--ed-bg-alt)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                href={continueHref}
                className="ed-btn-primary"
                style={{ fontFamily: F.serif, padding: '10px 18px' }}
              >
                {t('continueChapter')}
                <Arrow />
              </Link>
            </div>

            <div aria-label={t('rotationLabel')} style={{ display: 'flex', gap: 6 }}>
              {current.verses.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIdx(i)
                    setProgressKey((k) => k + 1)
                  }}
                  aria-label={t('verseAria', { n: i + 1 })}
                  aria-current={i === idx ? 'true' : undefined}
                  style={{
                    width: i === idx ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    background:
                      i === idx ? 'var(--ed-accent)' : 'var(--ed-rule)',
                    cursor: 'pointer',
                    transition: 'all 180ms',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
