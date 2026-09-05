'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShieldCheck, CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react'
import { F, SectionDivider } from './shared'

export function SupportSection() {
  const t = useTranslations('homePage.support')

  const TRUST_ITEMS = [
    { icon: ShieldCheck, label: t('trust1') },
    { icon: CheckCircle2, label: t('trust2') },
    { icon: Lock, label: t('trust3') },
    { icon: Sparkles, label: t('trust4') },
  ]

  return (
    <section
      className="relative overflow-hidden border-b border-border/40"
      style={{
        backgroundColor: 'var(--ed-bg)',
        paddingTop: 'clamp(44px, 5.5vw, 64px)',
        paddingBottom: 'clamp(48px, 6vw, 72px)',
      }}
    >
      <div
        className="relative px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── Editorial Mission Showcase ── */}
        <div
          className="rounded-3xl border border-border/50 bg-gradient-to-br from-card/70 via-card/40 to-muted/20 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xs"
          style={{ borderColor: 'var(--ed-rule)' }}
        >
          {/* Subtle warm ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, var(--ed-accent) 0%, transparent 70%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-1">
            {/* Left Column: Mission Manifesto & Trust Badges */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2
                  style={{
                    fontFamily: F.display,
                    fontSize: 'clamp(30px, 3.8vw, 44px)',
                    fontWeight: 450,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: 'var(--ed-fg)',
                  }}
                  className="mb-3"
                >
                  {t('headline')}{' '}
                  <em
                    style={{
                      fontStyle: 'italic',
                      color: 'var(--ed-accent)',
                    }}
                  >
                    {t('headlineAccent')}
                  </em>
                </h2>

                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: '15.5px',
                    lineHeight: 1.7,
                    color: 'var(--ed-fg-muted)',
                  }}
                >
                  {t('lead')}
                </p>
              </div>

              {/* Trust Indicators */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--ed-rule)' }}
              >
                {TRUST_ITEMS.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.glacial }}
                    >
                      <Icon size={14} className="text-[var(--ed-accent)] shrink-0" />
                      <span className="leading-tight">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Quranic Principle & Direct Action */}
            <div
              className="lg:col-span-5 rounded-2xl border border-border/40 bg-card/50 p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-2xs"
              style={{ backgroundColor: 'var(--ed-surface)' }}
            >
              <div>
                <blockquote
                  style={{
                    fontFamily: F.serif,
                    fontStyle: 'italic',
                    fontSize: '14.5px',
                    lineHeight: 1.65,
                    color: 'var(--ed-fg)',
                  }}
                  className="mb-2"
                >
                  {t('verse')}
                </blockquote>
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[11px] text-[var(--ed-accent)] uppercase tracking-wider font-semibold"
                >
                  — {t('verseRef')}
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/30">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--ed-accent)] text-[var(--ed-bg)] hover:opacity-90 font-medium text-sm transition-all shadow-sm group cursor-pointer"
                  style={{ fontFamily: F.serif }}
                >
                  <span>{t('cta')}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <p
                  style={{ fontFamily: F.mono }}
                  className="text-[10.5px] text-[var(--ed-fg-muted)] text-center tracking-tight"
                >
                  {t('reassurance')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
