'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

export function MiracleSection() {
  const t = useTranslations('homePage.miracle')

  const EVIDENCE_INDEX = [
    {
      metric: t('fact1k'),
      label: t('fact1v'),
      proof: t('fact1note'),
      annotation: 'Exact multiple confirmed across all 114 suras of the text',
    },
    {
      metric: t('fact2k'),
      label: t('fact2v'),
      proof: t('fact2note'),
      annotation: '6 + 3 + 4 + 6 = 19; exact sum of numbered verses',
    },
    {
      metric: t('fact3k'),
      label: t('fact3v'),
      proof: t('fact3note'),
      annotation: 'The foundational opening formula of the scripture',
    },
    {
      metric: t('fact4k'),
      label: t('fact4v'),
      proof: t('fact4note'),
      annotation: 'Revelation in 610 AD to computerized decoding in 1974',
    },
  ]

  return (
    <section
      id="miracle"
      className="relative overflow-hidden border-b border-[var(--ed-rule)]"
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        paddingTop: 'clamp(64px, 8vw, 96px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
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

        {/* ── Asymmetric Editorial Data Exhibit ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Typographic Artifact & Scriptural Premise */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="flex items-baseline gap-6">
              {/* Controlled Typographic Artifact '19' */}
              <div
                aria-hidden
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(72px, 10vw, 120px)',
                  lineHeight: 0.85,
                  letterSpacing: '-0.04em',
                  color: 'var(--ed-accent)',
                  userSelect: 'none',
                }}
                className="shrink-0 italic"
              >
                19
              </div>

              <div>
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ed-accent)] block mb-1"
                >
                  {t('ref')}
                </span>
                <h3
                  style={{
                    fontFamily: F.display,
                    fontSize: 'clamp(28px, 3.4vw, 38px)',
                    fontWeight: 500,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: 'var(--ed-fg)',
                  }}
                  className="m-0"
                >
                  {t('heading')}
                </h3>
              </div>
            </div>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: '15.5px',
                lineHeight: 1.72,
                color: 'var(--ed-fg-muted)',
                maxWidth: '48ch',
              }}
              className="m-0"
            >
              {t('desc')}
            </p>

            <div className="pt-2">
              <Link
                href="/miracle"
                className="ed-btn-primary group"
                style={{
                  fontFamily: F.serif,
                  padding: '11px 22px',
                  fontSize: '14px',
                }}
              >
                <span>{t('cta')}</span>
                <Arrow size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Archival Proof Ledger / Index (NOT 4 generic cards) */}
          <div className="lg:col-span-6 border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--ed-rule)]">
              <span
                style={{ fontFamily: F.glacial }}
                className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--ed-accent)]"
              >
                Mathematical Evidence Index
              </span>
              <span
                style={{ fontFamily: F.mono }}
                className="text-[9.5px] uppercase tracking-wider text-[var(--ed-fg-muted)]"
              >
                Verifiable Ledger
              </span>
            </div>

            <div className="divide-y divide-[var(--ed-rule)]">
              {EVIDENCE_INDEX.map((item, idx) => (
                <div
                  key={idx}
                  className="py-4 first:pt-4 last:pb-1 group/row transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                      <span
                        style={{ fontFamily: F.display }}
                        className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[var(--ed-fg)] group-hover/row:text-[var(--ed-accent)] transition-colors"
                      >
                        {item.metric}
                      </span>
                      <span
                        style={{ fontFamily: F.serif }}
                        className="text-sm font-medium text-[var(--ed-fg-muted)] group-hover/row:text-[var(--ed-fg)] transition-colors"
                      >
                        {item.label}
                      </span>
                    </div>

                    <span
                      style={{ fontFamily: F.mono }}
                      className="text-xs font-semibold uppercase tracking-wider text-[var(--ed-accent)] shrink-0 px-2 py-0.5 border border-[var(--ed-rule)] bg-[var(--ed-bg-alt)] rounded-[2px]"
                    >
                      {item.proof}
                    </span>
                  </div>

                  <p
                    style={{ fontFamily: F.mono }}
                    className="text-[11px] text-[var(--ed-fg-muted)] opacity-70 mt-1.5 m-0"
                  >
                    {item.annotation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}