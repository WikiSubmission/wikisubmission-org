'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'

import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F } from './shared'
import { HeroScriptureDeck } from './hero-scripture/hero-scripture-deck'

function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
      <div className="absolute inset-0">
        <Image
          src="/hero-image.png"
          alt=""
          fill
          priority
          quality={88}
          sizes="100vw"
          className="pointer-events-none object-cover object-[58%_38%] sm:object-[60%_36%] lg:object-[62%_38%]"
        />
      </div>

      {/* Atmospheric depth vignette (dark, subtle, zero white overcast — keeps painting fully vivid) */}
      <div
        className="hidden lg:block absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(15, 12, 10, 0.48) 0%,
              rgba(15, 12, 10, 0.22) 28%,
              transparent 56%
            )
          `,
        }}
      />
      <div
        className="lg:hidden absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(15, 12, 10, 0.48) 0%,
              rgba(15, 12, 10, 0.18) 32%,
              transparent 62%
            )
          `,
        }}
      />

      {/* Subtle bottom feather into following section */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 sm:h-32"
        style={{
          background: `
            linear-gradient(
              to bottom,
              transparent 0%,
              color-mix(in srgb, var(--background) 70%, transparent) 65%,
              var(--background) 100%
            )
          `,
        }}
      />

      {/* Subtle canvas grain */}
      <div
        className="absolute inset-0 opacity-[0.024] mix-blend-overlay"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")
          `,
        }}
      />
    </div>
  )
}


function StatItem({
  value,
  label,
  bordered = false,
}: {
  value: string
  label: string
  bordered?: boolean
}) {
  return (
    <div
      className={`
        py-1
        sm:px-6 sm:py-0
        ${bordered ? 'sm:border-l sm:border-white/15' : ''}
      `}
    >
      <div
        className="
          text-[2rem]
          font-medium
          leading-none
          tracking-[-0.045em]
          text-[#FAF6EE]
          sm:text-[2.35rem]
        "
        style={{
          fontFamily: F.display,
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {value}
      </div>

      <div
        className="
          mt-2
          text-[9px]
          font-medium
          uppercase
          tracking-[0.2em]
          text-[#FAF6EE]/75
        "
        style={{
          fontFamily: F.mono,
        }}
      >
        {label}
      </div>
    </div>
  )
}

export function HeroManifesto() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.hero')

  const heroRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const ledeRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scriptureRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) return

    const ctx = gsap.context(() => {
      gsap.set(
        [
          headlineRef.current,
          ledeRef.current,
          ctaRef.current,
          scriptureRef.current,
          statsRef.current,
        ],
        {
          opacity: 0,
          y: 22,
        },
      )

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      timeline
        .to(headlineRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.05,
        })
        .to(
          ledeRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
          },
          '-=0.65',
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          '-=0.48',
        )
        .to(
          scriptureRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          },
          '-=0.5',
        )
        .to(
          statsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          '-=0.45',
        )
    }, hero)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="
        relative isolate overflow-hidden
        border-b border-border/35
      "
    >
      <AmbientBackground />

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div
          className="
            grid min-h-[690px]
            grid-cols-1
            items-center
            gap-16
            py-20
            sm:py-24
            lg:grid-cols-[1.05fr_0.95fr]
            lg:gap-20
            lg:py-28
          "
        >
          <div className="max-w-[720px]">
            <h1
              ref={headlineRef}
              className="m-0 max-w-[11ch] text-[#FAF6EE]"
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(4.2rem, 7.2vw, 7.2rem)',
                fontWeight: 400,
                lineHeight: 0.88,
                letterSpacing: '-0.045em',
                textShadow: '0 2px 18px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span className="block text-[#FAF6EE]">{t('headline1')}</span>

              <span
                className="block italic text-[#E5B887]"
                style={{ fontWeight: 400 }}
              >
                {t('headline2')}
              </span>

              <span className="block text-[#FAF6EE]">{t('headline3')}</span>
            </h1>

            <p
              ref={ledeRef}
              className="
                mt-8 max-w-[45ch]
                text-[16px]
                leading-[1.72]
                tracking-[-0.005em]
                text-[#FAF6EE]/88
                sm:mt-9
                sm:text-[18px]
              "
              style={{
                fontFamily: F.serif,
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)',
              }}
            >
              {t('lede')}
            </p>

            <div
              ref={ctaRef}
              className="mt-9 flex flex-wrap items-center gap-3 sm:mt-10"
            >
              <Link
                href="/quran"
                className="
                  group btn-tap sheen-hover inline-flex items-center gap-3
                  rounded-[3px]
                  bg-[#FAF6EE]
                  px-5 py-3.5
                  text-sm font-medium
                  text-[#1A1715]
                  shadow-[0_10px_35px_rgba(0,0,0,0.25)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#E5B887]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#E5B887]/60
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                "
                style={{ fontFamily: F.serif }}
              >
                <span>{t('ctaPrimary')}</span>

                <ArrowRight
                  size={15}
                  strokeWidth={1.7}
                  className="
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <button
                type="button"
                onClick={toggleAsk}
                className="
                  btn-tap inline-flex items-center
                  rounded-[3px]
                  border border-white/30
                  bg-black/20
                  px-5 py-3.5
                  text-sm font-medium
                  text-[#FAF6EE]
                  backdrop-blur-md
                  shadow-xs
                  transition-all duration-300
                  hover:border-white/50
                  hover:bg-black/35
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/60
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background
                "
                style={{ fontFamily: F.serif }}
              >
                {t('ctaSecondary')}
              </button>
            </div>
          </div>

          <div
            ref={scriptureRef}
            className="
              relative w-full
              lg:justify-self-end
              lg:max-w-[580px]
            "
          >
            <HeroScriptureDeck />
          </div>
        </div>

        <div
          ref={statsRef}
          className="
            border-t border-white/20
            pb-10 pt-7
            sm:pb-12 sm:pt-8
          "
        >
          <div className="grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-y-0">
            <StatItem
              value={t('stat1k')}
              label={t('stat1label')}
            />

            <StatItem
              value={t('stat2k')}
              label={t('stat2label')}
              bordered
            />

            <StatItem
              value={t('stat3k')}
              label={t('stat3label')}
              bordered
            />

            <StatItem
              value={t('stat4k')}
              label={t('stat4label')}
              bordered
            />
          </div>
        </div>
      </div>
    </section>
  )
}
