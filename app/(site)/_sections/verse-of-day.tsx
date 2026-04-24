'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

const TABS: Tab[] = [
  {
    key: 'quran',
    label: 'Quran',
    sub: 'Final Testament',
    verses: [
      {
        ref: '2:62',
        title: 'One Religion',
        english:
          'Surely, those who believe, those who are Jewish, the Christians, and the converts; anyone who believes in GOD, believes in the Last Day, and leads a righteous life, will receive their recompense from their Lord.',
        footnote: 'Repeated verbatim in Sura 5, verse 69.',
      },
      {
        ref: '3:19',
        title: 'Submission',
        english: 'The only religion approved by GOD is Submission.',
        footnote: 'The Arabic word "Islam" literally means "Submission."',
      },
      {
        ref: '25:1',
        title: 'The Criterion',
        english:
          'Most blessed is the One who revealed the Statute Book to His servant, so he can serve as a warner to the whole world.',
        footnote: 'Al-Furqān — the decisive scripture.',
      },
    ],
  },
  {
    key: 'ot',
    label: 'Old Testament',
    sub: 'Tanakh',
    verses: [
      {
        ref: 'Deuteronomy 6:4',
        title: 'The Shema',
        english: 'Hear, O Israel: The LORD our God, the LORD is one.',
        footnote: 'Cited by Jesus as the first commandment.',
      },
      {
        ref: 'Isaiah 42:8',
        title: 'His Glory',
        english:
          'I am the LORD: that is my name: and my glory will I not give to another.',
        footnote: 'One of the clearest monotheistic declarations in the Tanakh.',
      },
      {
        ref: 'Micah 6:8',
        title: 'What He Requires',
        english:
          'To do justly, and to love mercy, and to walk humbly with thy God.',
        footnote: 'A distilled ethics of monotheism.',
      },
    ],
  },
  {
    key: 'nt',
    label: 'New Testament',
    sub: 'Gospels & Letters',
    verses: [
      {
        ref: 'Mark 12:29',
        title: 'The First Commandment',
        english:
          'The first of all the commandments is, Hear, O Israel; The Lord our God is one Lord.',
        footnote: 'Jesus quoting Deuteronomy 6:4.',
      },
      {
        ref: 'John 17:3',
        title: 'Eternal Life',
        english:
          'And this is life eternal, that they might know thee the only true God.',
        footnote: 'Spoken by Jesus in prayer to the Father.',
      },
      {
        ref: 'James 2:19',
        title: 'Belief in One',
        english: 'Thou believest that there is one God; thou doest well.',
      },
    ],
  },
]

const ROTATE_MS = 7000

export function VerseOfTheDaySection() {
  const [tabKey, setTabKey] = useState<Tab['key']>('quran')
  const [idx, setIdx] = useState(0)

  const current = useMemo(
    () => TABS.find((t) => t.key === tabKey) ?? TABS[0],
    [tabKey]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(0)
  }, [tabKey])

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % current.verses.length)
    }, ROTATE_MS)
    return () => clearInterval(t)
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
          num="III"
          title="Verse of the day"
          sub="Daily rotation"
        />

        <div
          style={{
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            backgroundColor: 'var(--ed-surface)',
            overflow: 'hidden',
          }}
        >
          {/* Header: tabs + date */}
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
              Today · {current.sub}
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
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tabKey === t.key}
                  onClick={() => setTabKey(t.key)}
                  type="button"
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10.5,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '6px 12px',
                    border: 'none',
                    background:
                      tabKey === t.key ? 'var(--ed-fg)' : 'transparent',
                    color:
                      tabKey === t.key ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 150ms',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
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
                  Footnote —
                </span>
                {v.footnote}
              </div>
            )}
          </div>

          {/* Actions */}
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
                Continue to chapter
                <Arrow />
              </Link>
            </div>

            <div
              aria-label="Rotation"
              style={{ display: 'flex', gap: 6 }}
            >
              {current.verses.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Verse ${i + 1}`}
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
