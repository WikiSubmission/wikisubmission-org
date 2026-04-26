'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

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

export function VerseOfTheDaySection() {
  const t = useTranslations('homePage.verseOfDay')

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
    [t]
  )

  const [tabKey, setTabKey] = useState<Tab['key']>('quran')
  const [idx, setIdx] = useState(0)

  const current = useMemo(
    () => TABS.find((tab) => tab.key === tabKey) ?? TABS[0],
    [tabKey, TABS]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(0)
  }, [tabKey])

  useEffect(() => {
    const tm = setInterval(() => {
      setIdx((p) => (p + 1) % current.verses.length)
    }, ROTATE_MS)
    return () => clearInterval(tm)
  }, [current.verses.length])

  const v = current.verses[idx]
  const continueHref = tabKey === 'quran' ? '/quran' : '/bible'

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
            borderRadius: 3,
            backgroundColor: 'var(--ed-surface)',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between gap-3 flex-wrap"
            style={{
              padding: 'clamp(16px, 3vw, 22px) clamp(20px, 4vw, 32px)',
              borderBottom: '1px solid var(--ed-rule)',
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
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
                gap: 2,
                padding: 2,
                border: '1px solid var(--ed-rule)',
                borderRadius: 2,
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
                    fontFamily: F.mono,
                    fontSize: 10.5,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '6px 12px',
                    border: 'none',
                    background:
                      tabKey === tab.key ? 'var(--ed-fg)' : 'transparent',
                    color:
                      tabKey === tab.key
                        ? 'var(--ed-bg)'
                        : 'var(--ed-fg-muted)',
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 150ms',
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
                  fontFamily: F.mono,
                  fontSize: 11,
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
            </div>

            <p
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
              {v.english}
            </p>

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
                    fontFamily: F.mono,
                    fontSize: 10.5,
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
                  onClick={() => setIdx(i)}
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
