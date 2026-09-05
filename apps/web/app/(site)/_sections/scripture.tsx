'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'

import { F, SectionDivider, Arrow } from './shared'
import { StripeBook3D } from './stripe-book-3d'

type QuickLink = {
  label: string
  href: string
}

type ScriptureCardProps = {
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
  atmosphere: 'quran' | 'bible'
}

/* -------------------------------------------------------------------------- */
/* Atmospheric archive background                                             */
/* -------------------------------------------------------------------------- */

function ArchiveAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) return

    const canHover =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches

    if (!canHover) return

    let frame = 0
    let targetX = 76
    let targetY = 42
    let currentX = 76
    let currentY = 42

    const tick = () => {
      frame = 0

      currentX += (targetX - currentX) * 0.045
      currentY += (targetY - currentY) * 0.045

      root.style.setProperty('--pointer-x', `${currentX}%`)
      root.style.setProperty('--pointer-y', `${currentY}%`)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()

      targetX = ((event.clientX - rect.left) / rect.width) * 100
      targetY = ((event.clientY - rect.top) / rect.height) * 100

      if (!frame) {
        frame = requestAnimationFrame(tick)
      }
    }

    const handlePointerLeave = () => {
      targetX = 76
      targetY = 42

      if (!frame) {
        frame = requestAnimationFrame(tick)
      }
    }

    root.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    })

    root.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    })

    return () => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)

      if (frame) {
        cancelAnimationFrame(frame)
      }
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        '--pointer-x': '76%',
        '--pointer-y': '42%',
      } as React.CSSProperties}
    >
      {/* Base tonal field */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--ed-bg) 100%, transparent),
              color-mix(in srgb, var(--ed-bg-alt) 30%, var(--ed-bg)) 48%,
              color-mix(in srgb, var(--ed-bg) 100%, transparent)
            )
          `,
        }}
      />

      {/* Quran-side illumination */}
      <div
        className="absolute inset-y-0 left-[-15%] w-[65%] opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 55% 48% at 62% 48%, rgba(66, 122, 143, 0.09), transparent 72%)',
        }}
      />

      {/* Bible-side illumination */}
      <div
        className="absolute inset-y-0 right-[-12%] w-[65%] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 56% 50% at 42% 47%, color-mix(in srgb, var(--ed-accent) 8%, transparent), transparent 72%)',
        }}
      />

      {/* Central atmospheric transition */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 70% 72% at 50% 46%,
              transparent 12%,
              color-mix(in srgb, var(--ed-bg) 5%, transparent) 58%,
              color-mix(in srgb, var(--ed-bg) 28%, transparent) 100%
            )
          `,
        }}
      />

      {/* Pointer-responsive gallery light */}
      <div
        className="absolute inset-[-20%] opacity-70"
        style={{
          background:
            'radial-gradient(circle 430px at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--ed-accent) 6%, transparent), transparent 72%)',
        }}
      />

      {/* Architectural grid */}
      <div
        className="absolute inset-[-10%]"
        style={{
          backgroundImage: `
            linear-gradient(
              color-mix(in srgb, var(--ed-fg) 2.5%, transparent) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--ed-fg) 2.5%, transparent) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '112px 112px',
          maskImage:
            'radial-gradient(ellipse 74% 82% at 50% 44%, transparent 5%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 74% 82% at 50% 44%, transparent 5%, black 50%, transparent 100%)',
        }}
      />

      {/* Fine grain */}
      <div
        className="absolute inset-0 opacity-[0.026] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 34%, color-mix(in srgb, var(--ed-bg) 30%, transparent) 100%)',
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Quick links                                                                */
/* -------------------------------------------------------------------------- */

function ArchiveQuickLinks({
  links,
}: {
  links: QuickLink[]
}) {
  return (
    <nav
      aria-label="Quick links"
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <span
        className="
          mr-1
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-muted-foreground/55
        "
        style={{ fontFamily: F.mono }}
      >
        Jump to
      </span>

      {links.map((link, index) => (
        <React.Fragment key={link.href}>
          {index > 0 && (
            <span
              aria-hidden
              className="h-3 w-px bg-border/45"
            />
          )}

          <Link
            href={link.href}
            className="
              text-[11px]
              text-foreground/65
              transition-colors
              duration-200
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-primary/60
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background
            "
            style={{ fontFamily: F.serif }}
          >
            {link.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/* Exhibit                                                                    */
/* -------------------------------------------------------------------------- */

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
  atmosphere,
}: ScriptureCardProps) {
  return (
    <article
      className="
        group relative flex min-h-[720px] flex-col overflow-hidden
        rounded-[6px]
        border border-border/55
        bg-card/[0.14]
        backdrop-blur-[2px]
        transition-colors duration-500
        hover:border-border/80
      "
    >
      {/* Local exhibit illumination */}
      <div
        aria-hidden
        className={`
          pointer-events-none absolute inset-0
          opacity-80
          transition-opacity duration-700
          group-hover:opacity-100
          ${
            atmosphere === 'quran'
              ? 'bg-[radial-gradient(ellipse_64%_50%_at_50%_48%,rgba(50,110,132,0.12),transparent_70%)]'
              : 'bg-[radial-gradient(ellipse_64%_50%_at_50%_48%,rgba(170,128,82,0.10),transparent_70%)]'
          }
        `}
      />

      {/* Top hairline highlight */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--ed-accent) 35%, transparent), transparent)',
        }}
      />

      <div className="relative flex min-h-full flex-1 flex-col p-6 sm:p-8 lg:p-9">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.16em] text-primary"
              style={{ fontFamily: F.mono }}
            >
              {index} · {kicker}
            </span>

            <span
              className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/45"
              style={{ fontFamily: F.mono }}
            >
              SCRIPTURE
            </span>
          </div>

          <Link
            href={href}
            className="
              mt-6
              block
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-primary/60
            "
          >
            <h3
              className="
                m-0
                text-foreground
                transition-colors
                duration-300
                group-hover:text-foreground
              "
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(30px, 4vw, 42px)',
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: '-0.028em',
              }}
            >
              {title}

              <span
                className="ml-2 italic text-muted-foreground/70"
                style={{
                  fontWeight: 400,
                }}
              >
                {titleAlt}
              </span>
            </h3>
          </Link>

          <p
            className="mt-4 max-w-[48ch] text-[14px] leading-[1.7] text-muted-foreground"
            style={{ fontFamily: F.serif }}
          >
            {desc}
          </p>

          <div
            className="
              mt-3
              text-[9px]
              uppercase
              tracking-[0.12em]
              text-primary/80
            "
            style={{ fontFamily: F.mono }}
          >
            {meta}
          </div>
        </div>

        {/* Book stage */}
        <div className="relative flex flex-1 items-center justify-center py-10 sm:py-12">
          {/* Exhibit light well */}
          <div
            aria-hidden
            className={`
              pointer-events-none
              absolute bottom-[17%]
              h-28 w-72
              rounded-[50%]
              blur-[38px]
              opacity-60
              transition-opacity duration-700
              group-hover:opacity-85
              ${
                atmosphere === 'quran'
                  ? 'bg-[rgba(45,103,124,0.22)]'
                  : 'bg-[rgba(164,119,74,0.18)]'
              }
            `}
          />

          {/* Floor reflection */}
          <div
            aria-hidden
            className={`
              pointer-events-none
              absolute bottom-[15%]
              h-px w-44
              opacity-35
              blur-[2px]
              transition-all duration-700
              group-hover:w-52
              ${
                atmosphere === 'quran'
                  ? 'bg-[rgba(87,147,169,0.35)]'
                  : 'bg-[rgba(211,165,105,0.3)]'
              }
            `}
          />

          {/* IMPORTANT: DO NOT MODIFY THE 3D BOOK */}
          <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
            <StripeBook3D
              type={type}
              width={280}
              height={360}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 pt-5">
          <ArchiveQuickLinks links={quickLinks} />

          <div className="mt-6 flex items-center justify-between gap-5">
            <Link
              href={href}
              className="
                group/cta
                inline-flex
                items-center
                gap-2.5
                rounded-[3px]
                bg-foreground
                px-[18px]
                py-3
                text-[10px]
                font-medium
                uppercase
                tracking-[0.13em]
                text-background
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-primary
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/60
                focus-visible:ring-offset-2
                focus-visible:ring-offset-background
              "
              style={{ fontFamily: F.mono }}
            >
              {ctaLabel}

              <Arrow
                size={12}
                className="transition-transform duration-300 group-hover/cta:translate-x-1"
              />
            </Link>

            <Link
              href={href}
              className="
                inline-flex
                items-center
                gap-1.5
                text-[10px]
                text-muted-foreground/65
                transition-colors
                hover:text-foreground
                focus-visible:outline-none
                focus-visible:ring-1
                focus-visible:ring-primary/60
              "
              style={{ fontFamily: F.mono }}
            >
              <span>Browse All</span>
              <Arrow size={10} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Main section                                                               */
/* -------------------------------------------------------------------------- */

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

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const divider = section.querySelector('[data-scripture-divider]')
      const exhibits = section.querySelectorAll<HTMLElement>(
        '[data-scripture-exhibit]',
      )

      gsap.fromTo(
        divider,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
      )

      gsap.fromTo(
        exhibits,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        border-b border-border/40
      "
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        padding:
          'clamp(72px, 9vw, 116px) 0 clamp(80px, 10vw, 128px)',
      }}
    >
      <ArchiveAtmosphere />

      <div
        className="relative mx-auto w-full px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1280,
        }}
      >
        <div data-scripture-divider>
          <SectionDivider
            num={t('dividerNum')}
            title={t('dividerTitle')}
            sub={t('dividerSub')}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          <div data-scripture-exhibit>
            <ScriptureExhibit
              index="01"
              kicker="THE FINAL TESTAMENT"
              href="/quran"
              title={t('quranTitle')}
              titleAlt={t('quranTitleAlt')}
              desc={t('quranDesc')}
              meta="114 Suras · 6,346 Verses · Arabic & English · 38 Appendices"
              quickLinks={quranQuickLinks}
              ctaLabel={t('openReader')}
              type="quran"
              atmosphere="quran"
            />
          </div>

          <div data-scripture-exhibit>
            <ScriptureExhibit
              index="02"
              kicker="CANONICAL TESTAMENTS"
              href="/bible"
              title={t('bibleTitle')}
              titleAlt={t('bibleTitleAlt')}
              desc={t('bibleDesc')}
              meta="66 Books · 1,189 Chapters · Old & New Testaments"
              quickLinks={bibleQuickLinks}
              ctaLabel={t('openReader')}
              type="bible"
              atmosphere="bible"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
