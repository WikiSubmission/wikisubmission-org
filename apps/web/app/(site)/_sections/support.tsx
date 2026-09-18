'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { About } from '@/constants/about'
import { F, SectionDivider } from './shared'
import {
  Code2,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'

export function SupportSection() {
  const t = useTranslations('homePage.support')

  return (
    <section
      className="relative border-b border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-fg)]"
      style={{
        paddingTop: 'clamp(52px, 6vw, 76px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1080, margin: '0 auto' }}
      >
        {/* Section Divider */}
        <SectionDivider
          num={t('dividerNum')}
          title="Community & Mission"
          sub="Open scripture for all"
        />

        {/* Section Header */}
        <div className="mb-10 sm:mb-12 max-w-[720px]">
          <h2
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--ed-fg)',
            }}
            className="m-0 mb-3"
          >
            Stand with the{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--ed-accent)',
                fontWeight: 400,
              }}
            >
              mission
            </em>
            . No obligation, ever.
          </h2>

          <p
            style={{
              fontFamily: F.serif,
              fontSize: '15.5px',
              lineHeight: 1.7,
              color: 'var(--ed-fg-muted)',
            }}
            className="m-0"
          >
            WikiSubmission is a registered 501(c)(3) nonprofit. Every verse, translation, and scholarly tool is 100% free and open for all humanity—no paywalls, no subscriptions, and zero requirements.
          </p>
        </div>

        {/* 3 Minimalist Avenues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Avenue 1: Open Source */}
          <div className="p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] flex flex-col justify-between hover:border-[var(--ed-accent)] transition-all">
            <div>
              <div className="flex size-9 items-center justify-center rounded-[6px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
                <Code2 size={18} />
              </div>
              <h3
                style={{ fontFamily: F.display }}
                className="m-0 text-xl font-medium text-[var(--ed-fg)] mb-1.5"
              >
                Open-Source Code
              </h3>
              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] text-[var(--ed-fg-muted)] leading-relaxed"
              >
                Contribute to our Next.js frontend, offline reader engine, or open scripture data APIs on GitHub.
              </p>
            </div>

            <a
              href={About.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
            >
              <span>GitHub Repository</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Avenue 2: Study Circles */}
          <div className="p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] flex flex-col justify-between hover:border-[var(--ed-accent)] transition-all">
            <div>
              <div className="flex size-9 items-center justify-center rounded-[6px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
                <Users size={18} />
              </div>
              <h3
                style={{ fontFamily: F.display }}
                className="m-0 text-xl font-medium text-[var(--ed-fg)] mb-1.5"
              >
                Study Circles
              </h3>
              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] text-[var(--ed-fg-muted)] leading-relaxed"
              >
                Join readers and researchers worldwide discussing verses, linguistics, and mathematical evidence.
              </p>
            </div>

            <a
              href={About.social.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
            >
              <span>Join Discord</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Avenue 3: Voluntary Patronage */}
          <div className="p-6 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] flex flex-col justify-between hover:border-[var(--ed-accent)] transition-all">
            <div>
              <div className="flex size-9 items-center justify-center rounded-[6px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
                <ShieldCheck size={18} />
              </div>
              <h3
                style={{ fontFamily: F.display }}
                className="m-0 text-xl font-medium text-[var(--ed-fg)] mb-1.5"
              >
                Voluntary Giving
              </h3>
              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] text-[var(--ed-fg-muted)] leading-relaxed"
              >
                Optional, tax-deductible contributions to keep hosting independently funded, fast, and 100% ad-free.
              </p>
            </div>

            <Link
              href="/donate"
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
            >
              <span>Patronage Info</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Quiet Reassurance Banner (1 line) */}
        <div className="py-3 px-4 rounded-[6px] border border-[var(--ed-rule)] bg-[color-mix(in_oklab,var(--ed-surface),transparent_50%)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
          <span>Ad-free · Public domain · Zero paywalls</span>
          <span className="text-[var(--ed-fg)] font-medium">All scripture is unconditionally free forever</span>
        </div>
      </div>
    </section>
  )
}
