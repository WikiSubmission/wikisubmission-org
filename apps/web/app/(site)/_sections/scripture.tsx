'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'
import { StripeBook3D } from './stripe-book-3d'

type QuickLink = {
  label: string
  href: string
}

type ScriptureExhibitProps = {
  index: string
  kicker: string
  href: string
  title: string
  titleAlt: string
  desc: string
  meta: string
  quickLinks: QuickLink[]
  ctaLabel: string
  type: 'quran' | 'bible'
}

function ArchivalPassages({ links }: { links: QuickLink[] }) {
  return (
    <nav
      aria-label="Archival passages"
      className="flex flex-wrap items-center gap-1.5"
    >
      <span
        className="mr-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--ed-fg-muted)] opacity-60"
        style={{ fontFamily: F.mono }}
      >
        Passages
      </span>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="
            inline-flex items-center
            border border-[var(--ed-rule)]
            bg-[var(--ed-surface)]/60
            px-2.5 py-1
            text-[11px]
            font-medium
            text-[var(--ed-fg-muted)]
            transition-all duration-200
            hover:border-[var(--ed-accent)]
            hover:text-[var(--ed-fg)]
            hover:bg-[var(--ed-bg-alt)]
            rounded-[2px]
          "
          style={{ fontFamily: F.serif }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

function ScriptureExhibit({
  index,
  kicker,
  href,
  title,
  titleAlt,
  desc,
  meta,
  quickLinks,
  ctaLabel,
  type,
}: ScriptureExhibitProps) {
  return (
    <article
      className="
        group relative flex flex-col justify-between
        border border-[var(--ed-rule)]
        bg-[var(--ed-surface)]
        p-7 sm:p-9 lg:p-10
        transition-all duration-400
        hover:border-[var(--ed-fg)]/30
      "
      style={{ borderRadius: 0 }}
    >
      {/* ── 1. Top Archival Header ── */}
      <div>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--ed-rule)] pb-3.5">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]"
              aria-hidden
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ed-accent)]"
              style={{ fontFamily: F.glacial }}
            >
              FOLIO {index} · {kicker}
            </span>
          </div>

          <span
            className="text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.mono }}
          >
            {meta}
          </span>
        </div>

        <Link href={href} className="mt-4 block no-underline group/title">
          <h3
            className="m-0 text-[var(--ed-fg)] transition-colors duration-200 group-hover/title:text-[var(--ed-accent)]"
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(28px, 2.6vw, 36px)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.022em',
            }}
          >
            {title}
            <span
              className="ml-2 font-normal italic text-[var(--ed-fg-muted)]"
              style={{ fontWeight: 400 }}
            >
              {titleAlt}
            </span>
          </h3>
        </Link>
      </div>

      {/* ── 2. Heroic Visual Object Stage: 3D Rare Book ── */}
      <div className="relative my-6 sm:my-8 flex min-h-[380px] sm:min-h-[440px] items-center justify-center py-4 select-none">
        {/* Archival Pedestal Halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 rounded-full blur-3xl opacity-25"
          style={{
            background:
              type === 'quran'
                ? 'radial-gradient(circle, rgba(209,166,74,0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(160,115,75,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Pedestal Floor Shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[6%] h-3 w-52 rounded-[50%] bg-black/30 blur-[8px] opacity-40 transition-all duration-500 group-hover:w-56 group-hover:opacity-60"
        />

        {/* 3D Book Container */}
        <div className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:-translate-y-2">
          <StripeBook3D
            type={type}
            className="w-[280px] h-[350px] sm:w-[340px] sm:h-[425px]"
            priority={type === 'quran'}
            staggerDelay={type === 'bible' ? 300 : 0}
          />
        </div>
      </div>

      {/* ── 3. Footer: Concise Description, Passages & Reader Action ── */}
      <div className="border-t border-[var(--ed-rule)] pt-5 space-y-4">
        <p
          className="text-[14px] leading-[1.65] text-[var(--ed-fg-muted)] m-0 max-w-prose"
          style={{ fontFamily: F.serif }}
        >
          {desc}
        </p>

        {/* Archival Passages */}
        <div className="pt-2 border-t border-[var(--ed-rule)]/60">
          <ArchivalPassages links={quickLinks} />
        </div>

        {/* Direct Reader Link */}
        <div className="pt-2 flex items-center justify-between">
          <Link
            href={href}
            className="ed-btn-primary group/btn"
            style={{
              fontFamily: F.serif,
              padding: '10px 20px',
              fontSize: '13.5px',
            }}
          >
            <span>{ctaLabel}</span>
            <Arrow size={13} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          <Link
            href={href}
            className="text-[10px] uppercase tracking-[0.14em] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors inline-flex items-center gap-1.5"
            style={{ fontFamily: F.mono }}
          >
            <span>Catalog Index</span>
            <Arrow size={9} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ScriptureSection() {
  const t = useTranslations('homePage.scripture')
  const sectionRef = useRef<HTMLElement>(null)

  const quranQuickLinks: QuickLink[] = [
    { label: 'Sura 1 · The Key', href: '/quran/1' },
    { label: 'Sura 25 · The Criterion', href: '/quran/25' },
    { label: 'Sura 36 · Ya Seen', href: '/quran/36' },
    { label: 'Topical Index (A–Z)', href: '/quran/index' },
  ]

  const bibleQuickLinks: QuickLink[] = [
    { label: 'Genesis · Creation', href: '/bible/genesis/1' },
    { label: 'Psalms 23 · The Shepherd', href: '/bible/psalms/23' },
    { label: 'Matthew 5 · Sermon on Mount', href: '/bible/matthew/5' },
    { label: 'Proverbs · Wisdom', href: '/bible/proverbs/1' },
  ]

  return (
    <section
      ref={sectionRef}
      id="scripture"
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--ed-bg)',
        paddingTop: 'clamp(64px, 8vw, 96px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1280, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── 2-Column Rare-Book Exhibition Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <ScriptureExhibit
            index="01"
            kicker="THE FINAL TESTAMENT"
            href="/quran"
            title={t('quranTitle')}
            titleAlt={t('quranTitleAlt')}
            desc={t('quranDesc')}
            meta={t('quranTags')}
            quickLinks={quranQuickLinks}
            ctaLabel={t('openReader')}
            type="quran"
          />

          <ScriptureExhibit
            index="02"
            kicker="OLD & NEW TESTAMENTS"
            href="/bible"
            title={t('bibleTitle')}
            titleAlt={t('bibleTitleAlt')}
            desc={t('bibleDesc')}
            meta={t('bibleTags')}
            quickLinks={bibleQuickLinks}
            ctaLabel={t('openReader')}
            type="bible"
          />
        </div>
      </div>
    </section>
  )
}
