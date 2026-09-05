'use client'

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react'

import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F } from './shared'

interface FeaturedVerse {
  id: string
  label: string
  ref: string
  suraNumber: number
  verseNumber: number
  theme: string
  arabic: string
  translation: string
}

const FEATURED_VERSES: FeaturedVerse[] = [
  {
    id: 'universal-salvation',
    label: '2:62',
    ref: 'Sura 2, Verse 62',
    suraNumber: 2,
    verseNumber: 62,
    theme: 'Universal Salvation',
    arabic:
      'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ',
    translation:
      'Surely, those who believe, those who are Jewish, the Christians, and the converts; anyone who (1) believes in GOD, and (2) believes in the Last Day, and (3) leads a righteous life, will receive their recompense from their Lord. They have nothing to fear, nor will they grieve.',
  },
  {
    id: 'god-alone',
    label: '39:45',
    ref: 'Sura 39, Verse 45',
    suraNumber: 39,
    verseNumber: 45,
    theme: 'God Alone',
    arabic:
      'وَإِذَا ذُكِرَ اللَّهُ وَحْدَهُ اشْمَأَزَّتْ قُلُوبُ الَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ',
    translation:
      'When GOD ALONE is mentioned, the hearts of those who do not believe in the Hereafter shrink with aversion. But when others are mentioned alongside Him, they become satisfied.',
  },
  {
    id: 'ultimate-testimony',
    label: '3:18',
    ref: 'Sura 3, Verse 18',
    suraNumber: 3,
    verseNumber: 18,
    theme: 'The Testimony',
    arabic:
      'شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ',
    translation:
      'GOD bears witness that there is no god except He, and so do the angels and those who possess knowledge. Truthfully and equitably, He is the absolute god; there is no god but He, the Almighty, Most Wise.',
  },
  {
    id: 'code-nineteen',
    label: '74:30',
    ref: 'Sura 74, Verse 30',
    suraNumber: 74,
    verseNumber: 30,
    theme: 'Physical Miracle',
    arabic: 'عَلَيْهَا تِسْعَةَ عَشَرَ',
    translation:
      'Over it is nineteen. We appointed angels to be guardians of Hell, and we assigned their number to disturb the disbelievers, to convince the Christians and Jews, and to strengthen the faith of the faithful.',
  },
]

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    const update = () => setReducedMotion(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion) return

    const updatePointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()

      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      root.style.setProperty('--spot-x', `${x}%`)
      root.style.setProperty('--spot-y', `${y}%`)
    }

    root.addEventListener('pointermove', updatePointer, { passive: true })

    return () => root.removeEventListener('pointermove', updatePointer)
  }, [reducedMotion])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={
        {
          '--spot-x': '78%',
          '--spot-y': '44%',
        } as React.CSSProperties
      }
    >
      {/* Warm asymmetric bloom */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(
              ellipse 650px 560px at 78% 44%,
              color-mix(in srgb, var(--primary) 9%, transparent),
              transparent 70%
            ),
            radial-gradient(
              ellipse 720px 540px at 16% 18%,
              color-mix(in srgb, var(--primary) 4%, transparent),
              transparent 72%
            ),
            radial-gradient(
              ellipse 950px 700px at 50% 100%,
              color-mix(in srgb, var(--foreground) 3%, transparent),
              transparent 72%
            )
          `,
        }}
      />

      {/* Pointer-responsive museum-light effect */}
      <div
        className="absolute inset-[-15%] transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle 320px at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--primary) 6%, transparent), transparent 72%)',
          opacity: reducedMotion ? 0 : 1,
        }}
      />

      {/* Architectural grid */}
      <div
        className="absolute inset-[-10%] opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(
              color-mix(in srgb, var(--foreground) 3%, transparent) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--foreground) 3%, transparent) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '96px 96px',
          maskImage:
            'radial-gradient(ellipse 72% 90% at 50% 42%, transparent 4%, black 58%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 72% 90% at 50% 42%, transparent 4%, black 58%, transparent 100%)',
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")
          `,
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 30%, color-mix(in srgb, var(--background) 35%, transparent) 100%)',
        }}
      />
    </div>
  )
}

function FeaturedScriptureDeck() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelId = useId()
  const reducedMotion = useReducedMotion()

  const activeVerse = FEATURED_VERSES[activeIndex]

  useEffect(() => {
    if (isPaused || reducedMotion) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURED_VERSES.length)
    }, 9000)

    return () => window.clearInterval(timer)
  }, [isPaused, reducedMotion])

  useEffect(() => {
    const content = contentRef.current
    if (!content || reducedMotion) return

    gsap.fromTo(
      content,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: 'power3.out',
      },
    )
  }, [activeIndex, reducedMotion])

  const selectVerse = useCallback((index: number) => {
    setCopied(false)
    setActiveIndex(index)
  }, [])

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      let nextIndex = activeIndex

      if (event.key === 'ArrowRight') {
        nextIndex = (activeIndex + 1) % FEATURED_VERSES.length
      } else if (event.key === 'ArrowLeft') {
        nextIndex =
          (activeIndex - 1 + FEATURED_VERSES.length) %
          FEATURED_VERSES.length
      } else if (event.key === 'Home') {
        nextIndex = 0
      } else if (event.key === 'End') {
        nextIndex = FEATURED_VERSES.length - 1
      } else {
        return
      }

      event.preventDefault()
      selectVerse(nextIndex)
      tabRefs.current[nextIndex]?.focus()
    },
    [activeIndex, selectVerse],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `"${activeVerse.translation}"\n— Quran ${activeVerse.suraNumber}:${activeVerse.verseNumber}`,
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch {
      setCopied(false)
    }
  }, [activeVerse])

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node,
          )
        ) {
          setIsPaused(false)
        }
      }}
    >
      <div
        className="
          relative overflow-hidden rounded-[22px]
          border border-border/70
          bg-card/35
          backdrop-blur-2xl
          shadow-[0_30px_100px_rgba(0,0,0,0.14)]
        "
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px opacity-80"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 55%, transparent), transparent)',
          }}
        />

        <div
          role="tablist"
          aria-label="Featured Quran verses"
          className="
            flex items-center gap-7 overflow-x-auto
            border-b border-border/45
            px-5 py-4 sm:px-7
          "
        >
          {FEATURED_VERSES.map((verse, index) => {
            const selected = index === activeIndex

            return (
              <button
                key={verse.id}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${panelId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectVerse(index)}
                onKeyDown={handleTabKeyDown}
                className={`
                  relative shrink-0 py-1
                  text-[11px]
                  font-medium
                  tracking-[0.12em]
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/50
                  ${
                    selected
                      ? 'text-foreground'
                      : 'text-muted-foreground/55 hover:text-foreground/80'
                  }
                `}
                style={{ fontFamily: F.mono }}
              >
                {verse.label}

                {selected && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-[17px] h-px bg-primary"
                  />
                )}
              </button>
            )
          })}

          <span
            className="ml-auto hidden shrink-0 text-[10px] tracking-[0.16em] text-muted-foreground/45 sm:block"
            style={{ fontFamily: F.mono }}
          >
            FEATURED SCRIPTURE
          </span>
        </div>

        <div
          id={`${panelId}-panel`}
          role="tabpanel"
          className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-7"
        >
          <div ref={contentRef}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <span
                className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary"
                style={{ fontFamily: F.mono }}
              >
                {activeVerse.theme}
              </span>

              <span
                className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/55"
                style={{ fontFamily: F.mono }}
              >
                {activeVerse.ref}
              </span>
            </div>

            <p
              dir="rtl"
              lang="ar"
              className="
                m-0 text-right
                text-[1.65rem] leading-[1.8]
                text-primary/90
                sm:text-[1.9rem]
              "
              style={{ fontFamily: F.arabic }}
            >
              {activeVerse.arabic}
            </p>

            <div className="my-6 h-px bg-border/40" />

            <blockquote
              className="
                m-0 max-w-[60ch]
                text-[17px]
                leading-[1.7]
                tracking-[-0.01em]
                text-foreground/90
                sm:text-[18px]
              "
              style={{ fontFamily: F.serif }}
            >
              “{activeVerse.translation}”
            </blockquote>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-border/40 pt-4">
              <button
                type="button"
                onClick={handleCopy}
                aria-label={
                  copied
                    ? 'Verse copied to clipboard'
                    : 'Copy verse to clipboard'
                }
                className="
                  inline-flex items-center gap-2
                  py-1.5
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/50
                "
                style={{ fontFamily: F.mono }}
              >
                {copied ? (
                  <>
                    <Check size={12} strokeWidth={1.8} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={1.8} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <Link
                href={`/quran/${activeVerse.suraNumber}?verse=${activeVerse.verseNumber}`}
                className="
                  group inline-flex items-center gap-2
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-foreground/70
                  transition-colors
                  hover:text-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/50
                "
                style={{ fontFamily: F.mono }}
              >
                <span>Read</span>

                <ArrowUpRight
                  size={13}
                  strokeWidth={1.7}
                  className="
                    transition-transform duration-200
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
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
        ${bordered ? 'sm:border-l sm:border-border/50' : ''}
      `}
    >
      <div
        className="
          text-[2rem]
          font-medium
          leading-none
          tracking-[-0.045em]
          text-foreground
          sm:text-[2.35rem]
        "
        style={{ fontFamily: F.display }}
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
          text-muted-foreground/60
        "
        style={{ fontFamily: F.mono }}
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
              className="m-0 max-w-[11ch] text-foreground"
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(4.2rem, 7.2vw, 7.2rem)',
                fontWeight: 400,
                lineHeight: 0.88,
                letterSpacing: '-0.045em',
              }}
            >
              <span className="block">{t('headline1')}</span>

              <span
                className="block italic text-primary"
                style={{ fontWeight: 400 }}
              >
                {t('headline2')}
              </span>

              <span className="block">{t('headline3')}</span>
            </h1>

            <p
              ref={ledeRef}
              className="
                mt-8 max-w-[45ch]
                text-[16px]
                leading-[1.72]
                tracking-[-0.005em]
                text-muted-foreground
                sm:mt-9
                sm:text-[18px]
              "
              style={{ fontFamily: F.serif }}
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
                  group inline-flex items-center gap-3
                  rounded-[3px]
                  bg-foreground
                  px-5 py-3.5
                  text-sm font-medium
                  text-background
                  shadow-[0_10px_35px_rgba(0,0,0,0.15)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-primary
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/60
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
                  inline-flex items-center
                  rounded-[3px]
                  border border-border/70
                  bg-card/20
                  px-5 py-3.5
                  text-sm font-medium
                  text-foreground/80
                  backdrop-blur-md
                  transition-all duration-300
                  hover:border-primary/45
                  hover:bg-primary/5
                  hover:text-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/60
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
            <FeaturedScriptureDeck />
          </div>
        </div>

        <div
          ref={statsRef}
          className="
            border-t border-border/50
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
