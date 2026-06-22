'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  ExternalLink,
  Activity,
  Binary,
  Cpu,
  Database,
  ShieldCheck,
} from 'lucide-react'
import { FaYoutube } from 'react-icons/fa'

let scrollTriggerRegistered = false
function ensureScrollTrigger() {
  if (typeof window === 'undefined' || scrollTriggerRegistered) return
  gsap.registerPlugin(ScrollTrigger)
  scrollTriggerRegistered = true
}

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
  arabic: 'var(--font-amiri), "Scheherazade New", serif',
}

// ─── DATA ─────────────────────────────────────────────────────────────

const CHAPTER_NAMES = [
  'Al-Fatihah', 'Al-Baqarah', 'Al-Imran', 'An-Nisa', 'Al-Maidah', 'Al-Anam',
  'Al-Araf', 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Rad',
  'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan', 'Ash-Shuara',
  'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajdah',
  'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar',
  'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat',
  'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqiah', 'Al-Hadid',
  'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah', 'As-Saff', 'Al-Jumuah',
  'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam',
  'Al-Haqqah', 'Al-Maarij', 'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir',
  'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Naziat', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-Ala', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams',
  'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr',
  'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat', 'Al-Qariah', 'At-Takathur',
  'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Maun', 'Al-Kawthar',
  'Al-Kafirun', 'An-Nasr', 'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
]

const ALAQ_VERSES = [
  'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
  'خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ',
  'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',
  'الَّذِي عَلَّمَ بِالْقَلَمِ',
  'عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ',
  'كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَى',
  'أَنْ رَآهُ اسْتَغْنَى',
  'إِنَّ إِلَى رَبِّكَ الرُّجْعَى',
  'أَرَأَيْتَ الَّذِي يَنْهَى',
  'عَبْدًا إِذَا صَلَّى',
  'أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَى',
  'أَوْ أَمَرَ بِالتَّقْوَى',
  'أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّى',
  'أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَى',
  'كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا',
  'نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ',
  'فَلْيَدْعُ نَادِيَهُ',
  'سَنَدْعُ الزَّبَانِيَةَ',
  'كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ',
]

const REVELATION_WORDS = [
  'اقْرَأْ', 'بِاسْمِ', 'رَبِّكَ', 'الَّذِي', 'خَلَقَ',
  'خَلَقَ', 'الْإِنْسَانَ', 'مِنْ', 'عَلَقٍ',
  'اقْرَأْ', 'وَرَبُّكَ', 'الْأَكْرَمُ',
  'الَّذِي', 'عَلَّمَ', 'بِالْقَلَمِ',
  'عَلَّمَ', 'الْإِنسانَ', 'مَا لَمْ', 'يَعْلَمْ',
]

const BISMILLAH_LETTERS = [
  'بِ', 'سْ', 'مِ',
  'ا', 'ل', 'لَّ', 'هِ',
  'ا', 'ل', 'رَّ', 'حْ', 'مَ', 'نِ',
  'ا', 'ل', 'رَّ', 'حِ', 'ي', 'مِ',
]

// ─── SHARED FORENSIC LAYERS ──────────────────────────────────────────

function ForensicScanlines() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.to(el, {
      backgroundPositionY: '40px',
      duration: 1.2,
      repeat: -1,
      ease: 'none',
    })
    return () => {
      tween.kill()
    }
  }, [])
  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none z-[5] opacity-[0.06]"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--ed-accent) 2px, var(--ed-accent) 4px)',
        backgroundPosition: '0 0',
      }}
    />
  )
}

function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[4]"
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 30%, var(--ed-bg) 100%)',
      }}
    />
  )
}

function CornerMarkers({ label, sub }: { label: string; sub: string }) {
  const t = useTranslations('miracle')
  return (
    <>
      <div className="absolute top-6 left-6 font-mono text-[8px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-30 z-30">
        {label}
      </div>
      <div className="absolute top-6 right-6 font-mono text-[8px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-30 z-30">
        {sub}
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[8px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-30 z-30">
        {t('visualForensicUnit')}
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[8px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-30 z-30">
        {t('visualConst')}
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export function MiracleExperience() {
  const t = useTranslations('miracle')
  const rootRef = useRef<HTMLDivElement | null>(null)

  const heroRef = useRef<HTMLElement | null>(null)
  const heroBgRef = useRef<HTMLDivElement | null>(null)
  const heroHeadlineRef = useRef<HTMLHeadingElement | null>(null)
  const heroBoxRef = useRef<HTMLDivElement | null>(null)
  const heroScanlineRef = useRef<HTMLDivElement | null>(null)

  const bismillahRef = useRef<HTMLElement | null>(null)
  const bismillahLettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const bismillahCounterRef = useRef<HTMLSpanElement | null>(null)
  const bismillahFinalRef = useRef<HTMLDivElement | null>(null)

  const chaptersRef = useRef<HTMLElement | null>(null)
  const chaptersCounterRef = useRef<HTMLDivElement | null>(null)
  const chaptersNameRef = useRef<HTMLDivElement | null>(null)
  const chaptersFormulaRef = useRef<HTMLDivElement | null>(null)
  const [chapterIndex, setChapterIndex] = useState(0)

  const revelationRef = useRef<HTMLElement | null>(null)
  const revelationWordsRef = useRef<(HTMLSpanElement | null)[]>([])
  const revelationCounterRef = useRef<HTMLSpanElement | null>(null)
  const revelationBeamRef = useRef<HTMLDivElement | null>(null)

  const godRef = useRef<HTMLElement | null>(null)
  const godCounterRef = useRef<HTMLDivElement | null>(null)
  const godFormulaRef = useRef<HTMLDivElement | null>(null)
  const godHaloRef = useRef<HTMLDivElement | null>(null)

  const verseRef = useRef<HTMLElement | null>(null)
  const verseNumberRef = useRef<HTMLDivElement | null>(null)
  const verseTextRef = useRef<HTMLParagraphElement | null>(null)
  const verseProgressRef = useRef<HTMLDivElement | null>(null)
  const [verseIndex, setVerseIndex] = useState(1)

  const discoveryRef = useRef<HTMLElement | null>(null)
  const discoveryYearRef = useRef<HTMLDivElement | null>(null)
  const discoveryLunarRef = useRef<HTMLDivElement | null>(null)
  const discoveryFactorRef = useRef<HTMLDivElement | null>(null)
  const discoveryAnchorRef = useRef<HTMLDivElement | null>(null)

  const finaleRef = useRef<HTMLElement | null>(null)
  const finaleNumbersRef = useRef<(HTMLSpanElement | null)[]>([])
  const finaleCenterRef = useRef<HTMLDivElement | null>(null)
  const finaleCardsRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    ensureScrollTrigger()

    const prevSnapType = document.documentElement.style.scrollSnapType
    document.documentElement.style.scrollSnapType = 'y mandatory'

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop: per-section enter animations (no pinning, no scrub)
      mm.add(
        '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        () => {
          // ── Scene 1: Hero
          const heroTl = gsap.timeline({ paused: true })
          heroTl
            .from(heroBgRef.current, { scale: 4, opacity: 0, ease: 'power3.out', duration: 0.8 })
            .from(
              heroHeadlineRef.current?.querySelectorAll('.hero-letter') ?? [],
              { y: 80, opacity: 0, stagger: 0.04, ease: 'power3.out', duration: 0.5 },
              '<0.2',
            )
            .from(heroBoxRef.current, { y: 60, opacity: 0, ease: 'power3.out', duration: 0.5 }, '<0.3')
            .fromTo(heroScanlineRef.current, { y: -20 }, { y: 200, ease: 'none', duration: 0.8 }, '<')
          ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top+=10',
            onEnter: () => heroTl.play(0),
            onEnterBack: () => heroTl.restart(),
          })

          // ── Scene 2: Bismillah
          const letters = bismillahLettersRef.current.filter(Boolean)
          const bismillahTl = gsap.timeline({ paused: true })
          bismillahTl
            .to(letters, {
              opacity: 1,
              color: 'var(--ed-accent)',
              stagger: { each: 0.06 },
              duration: 0.06 * letters.length,
              ease: 'power3.out',
              onUpdate: function () {
                const total = letters.length
                const progress = this.progress()
                const idx = Math.min(total, Math.round(progress * total))
                if (bismillahCounterRef.current) {
                  bismillahCounterRef.current.textContent = String(idx)
                }
              },
            })
            .to(
              bismillahFinalRef.current,
              {
                opacity: 1,
                textShadow: '0 0 40px var(--ed-accent-soft), 0 0 80px var(--ed-accent-soft)',
                duration: 0.4,
                ease: 'power2.out',
              },
              '+=0.05',
            )
          ScrollTrigger.create({
            trigger: bismillahRef.current,
            start: 'top top+=10',
            onEnter: () => bismillahTl.play(0),
            onEnterBack: () => bismillahTl.restart(),
          })

          // ── Scene 3: 114 Chapters
          const chapterProxy = { value: 0 }
          const chaptersTl = gsap.timeline({ paused: true })
          chaptersTl
            .to(chapterProxy, {
              value: 114,
              ease: 'none',
              duration: 1.2,
              onUpdate: () => {
                const v = Math.floor(chapterProxy.value)
                if (chaptersCounterRef.current) {
                  chaptersCounterRef.current.textContent = String(v)
                }
                const idx = Math.min(113, Math.max(0, v - 1))
                setChapterIndex(idx)
              },
            })
            .to(
              chaptersCounterRef.current,
              { color: 'var(--ed-accent)', textShadow: '0 0 50px var(--ed-accent-soft)', scale: 1.05, duration: 0.2 },
              '>',
            )
            .from(chaptersFormulaRef.current, { y: 60, opacity: 0, duration: 0.4, ease: 'power3.out' }, '<')
          ScrollTrigger.create({
            trigger: chaptersRef.current,
            start: 'top top+=10',
            onEnter: () => chaptersTl.play(0),
            onEnterBack: () => chaptersTl.restart(),
          })

          // ── Scene 4: First Revelation
          const words = revelationWordsRef.current.filter(Boolean)
          const revelationTl = gsap.timeline({ paused: true })
          revelationTl
            .fromTo(revelationBeamRef.current, { left: '-5%' }, { left: '105%', ease: 'none', duration: 1.2 }, 0)
            .to(
              words,
              {
                opacity: 1,
                color: 'var(--ed-accent)',
                stagger: { each: 0.06 },
                duration: 0.06 * words.length,
                ease: 'power3.out',
                onUpdate: function () {
                  const total = words.length
                  const progress = this.progress()
                  const idx = Math.min(total, Math.round(progress * total))
                  if (revelationCounterRef.current) {
                    revelationCounterRef.current.textContent = String(idx)
                  }
                },
              },
              0,
            )
          ScrollTrigger.create({
            trigger: revelationRef.current,
            start: 'top top+=10',
            onEnter: () => revelationTl.play(0),
            onEnterBack: () => revelationTl.restart(),
          })

          // ── Scene 5: God frequency
          const godProxy = { value: 0 }
          const godTl = gsap.timeline({ paused: true })
          godTl
            .to(godProxy, {
              value: 2698,
              duration: 1.5,
              ease: 'none',
              onUpdate: () => {
                if (godCounterRef.current) {
                  godCounterRef.current.textContent = Math.floor(godProxy.value).toLocaleString()
                }
              },
            })
            .to(
              godCounterRef.current,
              { color: 'var(--ed-accent)', textShadow: '0 0 60px var(--ed-accent-soft)', duration: 0.2 },
              '>',
            )
            .from(godFormulaRef.current, { y: 40, opacity: 0, scale: 0.9, duration: 0.4, ease: 'power3.out' }, '<')
            .to(godHaloRef.current, { opacity: 0.4, scale: 1.4, duration: 0.6, ease: 'power2.out' }, '<')
          ScrollTrigger.create({
            trigger: godRef.current,
            start: 'top top+=10',
            onEnter: () => godTl.play(0),
            onEnterBack: () => godTl.restart(),
          })

          // ── Scene 6: Chapter 96 verse reel
          const verseProxy = { value: 1 }
          const verseTl = gsap.timeline({ paused: true })
          verseTl
            .to(verseProxy, {
              value: 19,
              duration: 1.5,
              ease: 'none',
              onUpdate: () => {
                const v = Math.max(1, Math.min(19, Math.round(verseProxy.value)))
                if (verseNumberRef.current) {
                  verseNumberRef.current.textContent = String(v).padStart(2, '0')
                }
                if (verseProgressRef.current) {
                  verseProgressRef.current.style.transform = `scaleX(${v / 19})`
                }
                setVerseIndex(v)
              },
            })
            .to(
              verseTextRef.current,
              { color: 'var(--ed-accent)', textShadow: '0 0 30px var(--ed-accent-soft)', duration: 0.2 },
              '>',
            )
          ScrollTrigger.create({
            trigger: verseRef.current,
            start: 'top top+=10',
            onEnter: () => verseTl.play(0),
            onEnterBack: () => verseTl.restart(),
          })

          // ── Scene 7: Discovery 1974
          const yearChars = '0123456789'
          const discoveryTl = gsap.timeline({ paused: true })
          discoveryTl
            .to(
              { p: 0 },
              {
                p: 1,
                duration: 0.8,
                ease: 'none',
                onUpdate: function () {
                  const p = this.progress()
                  if (!discoveryYearRef.current) return
                  if (p < 0.95) {
                    const target = '1974'
                    const lockCount = Math.floor(p * 4)
                    let display = ''
                    for (let i = 0; i < 4; i++) {
                      display += i < lockCount ? target[i] : yearChars[Math.floor(Math.random() * 10)]
                    }
                    discoveryYearRef.current.textContent = display
                  } else {
                    discoveryYearRef.current.textContent = '1974'
                  }
                },
              },
            )
            .from(discoveryLunarRef.current, { y: 30, opacity: 0, duration: 0.4, ease: 'power3.out' }, '>')
            .from(discoveryFactorRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.4, ease: 'power3.out' }, '>+=0.1')
            .from(discoveryAnchorRef.current, { y: 40, opacity: 0, duration: 0.4, ease: 'power3.out' }, '>+=0.1')
          ScrollTrigger.create({
            trigger: discoveryRef.current,
            start: 'top top+=10',
            onEnter: () => discoveryTl.play(0),
            onEnterBack: () => discoveryTl.restart(),
          })

          // ── Scene 8: Convergence finale
          const finaleTl = gsap.timeline({ paused: true })
          finaleTl
            .to(finaleNumbersRef.current.filter(Boolean), {
              x: 0, y: 0, scale: 0.4, opacity: 0.3, stagger: 0.05, duration: 0.6, ease: 'power2.in',
            })
            .from(finaleCenterRef.current, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(1.7)' }, '>-0.2')
            .from(
              finaleCardsRef.current?.children ?? [],
              { scale: 0, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(1.4)' },
              '>-0.2',
            )
          ScrollTrigger.create({
            trigger: finaleRef.current,
            start: 'top top+=10',
            onEnter: () => finaleTl.play(0),
            onEnterBack: () => finaleTl.restart(),
          })
        },
      )

      // Mobile or reduced-motion: per-section fade-in, no pinning
      mm.add(
        '(max-width: 767px), (prefers-reduced-motion: reduce)',
        () => {
          const sections = [
            heroRef,
            bismillahRef,
            chaptersRef,
            revelationRef,
            godRef,
            verseRef,
            discoveryRef,
            finaleRef,
          ]
          sections.forEach((sectionRef) => {
            const el = sectionRef.current
            if (!el) return
            gsap.fromTo(
              el,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                },
              },
            )
          })

          // Set static end-states for animated content
          if (bismillahCounterRef.current) bismillahCounterRef.current.textContent = '19'
          if (bismillahFinalRef.current) bismillahFinalRef.current.style.opacity = '1'
          if (chaptersCounterRef.current) chaptersCounterRef.current.textContent = '114'
          if (revelationCounterRef.current) revelationCounterRef.current.textContent = '19'
          if (godCounterRef.current) godCounterRef.current.textContent = '2,698'
          if (discoveryYearRef.current) discoveryYearRef.current.textContent = '1974'
          if (verseNumberRef.current) verseNumberRef.current.textContent = '19'
          gsap.set(bismillahLettersRef.current.filter(Boolean), {
            opacity: 1,
            color: 'var(--ed-accent)',
          })
          gsap.set(revelationWordsRef.current.filter(Boolean), {
            opacity: 1,
            color: 'var(--ed-accent)',
          })
          setVerseIndex(19)
        },
      )
    }, rootRef)

    return () => {
      ctx.revert()
      document.documentElement.style.scrollSnapType = prevSnapType
    }
  }, [])

  return (
    <div ref={rootRef} className="bg-[var(--ed-bg)] text-[var(--ed-fg)]">
      {/* ─── Scene 1: Hero ─── */}
      <section
        ref={heroRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualForensicUnit')}
          sub={t('visualVerified')}
        />

        <div
          ref={heroBgRef}
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[2]"
          style={{
            fontFamily: F.arabic,
            fontSize: 'clamp(280px, 38vw, 560px)',
            lineHeight: 1,
            color: 'var(--ed-fg)',
            opacity: 0.05,
            transform: 'rotate(-5deg)',
          }}
        >
          ١٩
        </div>

        <div className="relative z-30 max-w-5xl px-6 text-center flex flex-col items-center gap-12">
          <h1
            ref={heroHeadlineRef}
            className="max-w-4xl"
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(42px, 8vw, 84px)',
              lineHeight: 0.95,
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            <SplitText text={t('heroHeadingLine1')} className="hero-letter" />
            <br className="hidden md:block" />
            <span className="opacity-50">
              <SplitText text={t('heroHeadingLine2')} className="hero-letter" />
            </span>
          </h1>

          <p
            className="max-w-2xl text-lg md:text-xl text-[var(--ed-fg-muted)] leading-relaxed"
            style={{ fontFamily: F.serif }}
          >
            {t('description')}
          </p>

          <div
            ref={heroBoxRef}
            className="relative p-1 rounded-2xl bg-gradient-to-br from-[var(--ed-rule)] to-transparent overflow-hidden"
          >
            <div className="px-12 py-8 rounded-[14px] bg-[var(--ed-bg)] border border-[var(--ed-rule)] flex flex-col items-center gap-2 shadow-2xl">
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.4em',
                  color: 'var(--ed-accent)',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                }}
              >
                {t('proofLabel')}
              </div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                19
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 opacity-40">
                  <Binary size={12} />
                  <span style={{ fontFamily: F.mono, fontSize: 9 }}>
                    {t('proofVerified')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <ShieldCheck size={12} />
                  <span style={{ fontFamily: F.mono, fontSize: 9 }}>
                    {t('proofTamperProof')}
                  </span>
                </div>
              </div>
            </div>

            <div
              ref={heroScanlineRef}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--ed-accent)] to-transparent opacity-60 pointer-events-none"
              style={{ top: 0 }}
            />
          </div>

          <ScrollHint label={t('visualInitializingScan')} />
        </div>
      </section>

      {/* ─── Scene 2: Bismillah ─── */}
      <section
        ref={bismillahRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualBismillahLabel')}
          sub={t('visualBismillahSublabel')}
        />

        <SceneIndex i={1} t={t} />

        <div className="relative z-30 flex flex-col items-center gap-10 max-w-5xl">
          <SceneTitle text={t('factBismillahLabel')} />

          <div
            className="flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-3"
            dir="rtl"
          >
            {BISMILLAH_LETTERS.map((letter, i) => (
              <span
                key={`bism-${i}`}
                ref={(el) => {
                  bismillahLettersRef.current[i] = el
                }}
                className="text-3xl md:text-6xl"
                style={{
                  fontFamily: F.arabic,
                  color: 'var(--ed-fg-muted)',
                  opacity: 0.08,
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          <div
            ref={bismillahFinalRef}
            className="text-2xl md:text-4xl text-center font-arabic text-[var(--ed-accent)] whitespace-nowrap"
            dir="rtl"
            style={{ fontFamily: F.arabic, opacity: 0 }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>

          <div className="text-sm md:text-lg font-serif italic text-[var(--ed-fg-muted)] opacity-60">
            {t('visualBismillahTranslation')}
          </div>

          <div className="flex items-baseline gap-2 pt-6 border-t border-[var(--ed-rule)]/20 px-12">
            <span
              ref={bismillahCounterRef}
              className="font-mono text-6xl md:text-7xl font-bold tabular-nums"
            >
              0
            </span>
            <span className="font-mono text-sm text-[var(--ed-fg-muted)] opacity-30">
              / 19
            </span>
          </div>

          <StatusBadge text={t('visualScanningGraphemes')} icon={<Activity size={10} />} />
        </div>
      </section>

      {/* ─── Scene 3: 114 Chapters ─── */}
      <section
        ref={chaptersRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualChapterIndex')}
          sub={t('visual114Units')}
        />
        <SceneIndex i={2} t={t} />

        <div className="relative z-30 flex flex-col items-center gap-10 max-w-3xl">
          <SceneTitle text={t('factChaptersLabel')} />

          <div
            ref={chaptersNameRef}
            className="text-xl md:text-2xl font-serif italic text-[var(--ed-fg-muted)] h-10"
          >
            {CHAPTER_NAMES[chapterIndex]}
          </div>

          <div className="relative flex items-center justify-center">
            <svg
              className="absolute w-72 h-72 md:w-96 md:h-96 opacity-10"
              viewBox="0 0 100 100"
              style={{ animation: 'spin 20s linear infinite' }}
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="var(--ed-accent)"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
            </svg>
            <div
              ref={chaptersCounterRef}
              className="font-mono text-8xl md:text-[10rem] font-bold leading-none tabular-nums"
            >
              0
            </div>
          </div>

          <div
            ref={chaptersFormulaRef}
            className="flex items-center gap-4 bg-[var(--ed-surface)]/60 px-6 py-3 rounded-2xl border border-[var(--ed-rule)] backdrop-blur-sm"
          >
            <div className="font-mono text-4xl md:text-5xl font-bold text-[var(--ed-accent)]">
              19
            </div>
            <div className="text-xl opacity-20">×</div>
            <div className="font-mono text-3xl md:text-4xl font-bold">6</div>
            <div className="text-xl opacity-20">=</div>
            <div className="font-mono text-3xl md:text-4xl font-bold">114</div>
          </div>

          <StatusBadge text={t('visualVerified114')} icon={<Activity size={10} />} />
        </div>
      </section>

      {/* ─── Scene 4: First Revelation ─── */}
      <section
        ref={revelationRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualRevelationLabel')}
          sub={t('visualFirstRevelation')}
        />
        <SceneIndex i={3} t={t} />

        <div
          ref={revelationBeamRef}
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--ed-accent)] to-transparent opacity-70 z-20 pointer-events-none"
          style={{ left: '-5%', boxShadow: '0 0 20px var(--ed-accent-soft)' }}
        />

        <div className="relative z-30 flex flex-col items-center gap-10 max-w-3xl">
          <SceneTitle text={t('factRevelationLabel')} />

          <div
            className="flex flex-wrap justify-center gap-x-4 gap-y-3"
            dir="rtl"
          >
            {REVELATION_WORDS.map((word, i) => (
              <span
                key={`rev-${i}`}
                ref={(el) => {
                  revelationWordsRef.current[i] = el
                }}
                className="text-2xl md:text-4xl"
                style={{
                  fontFamily: F.arabic,
                  color: 'var(--ed-fg-muted)',
                  opacity: 0.1,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          <div className="flex items-baseline gap-3 pt-6 border-t border-[var(--ed-rule)]/20 px-12">
            <span
              ref={revelationCounterRef}
              className="font-mono text-6xl md:text-7xl font-bold tabular-nums text-[var(--ed-accent)]"
            >
              0
            </span>
            <span className="font-mono text-lg text-[var(--ed-fg-muted)] opacity-30">
              / 19
            </span>
          </div>

          <StatusBadge text={t('visualVerified19Words')} icon={<Activity size={10} />} />
        </div>
      </section>

      {/* ─── Scene 5: God frequency ─── */}
      <section
        ref={godRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualFrequencyScan')}
          sub={t('visualWordAllah')}
        />
        <SceneIndex i={4} t={t} />

        <div
          ref={godHaloRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]"
          style={{
            background:
              'radial-gradient(circle at center, var(--ed-accent-soft) 0%, transparent 60%)',
            opacity: 0,
          }}
        />

        <div className="relative z-30 flex flex-col items-center gap-10 max-w-3xl">
          <SceneTitle text={t('factGodLabel')} />

          <div
            className="text-7xl md:text-9xl font-arabic"
            style={{ fontFamily: F.arabic, opacity: 0.1 }}
          >
            الله
          </div>

          <div
            ref={godCounterRef}
            className="font-mono text-7xl md:text-[9rem] font-bold tabular-nums leading-none"
          >
            0
          </div>

          <div className="font-serif italic text-sm md:text-base text-[var(--ed-fg-muted)] opacity-50">
            {t('visualAllahFrequency')}
          </div>

          <div
            ref={godFormulaRef}
            className="flex items-center gap-4 bg-[var(--ed-surface)]/60 px-6 py-3 rounded-2xl border border-[var(--ed-rule)]"
          >
            <div className="font-mono text-3xl md:text-5xl font-bold text-[var(--ed-accent)]">
              19
            </div>
            <div className="text-xl opacity-20">×</div>
            <div className="font-mono text-2xl md:text-4xl font-bold">142</div>
            <div className="text-xl opacity-20">=</div>
            <div className="font-mono text-2xl md:text-4xl font-bold">2,698</div>
          </div>

          <StatusBadge text={t('visualVerified2698')} icon={<Activity size={10} />} />
        </div>
      </section>

      {/* ─── Scene 6: Chapter 96 reel ─── */}
      <section
        ref={verseRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualSurah096')}
          sub={t('visualVerseCount')}
        />
        <SceneIndex i={5} t={t} />

        <div className="relative z-30 flex flex-col items-center gap-10 max-w-4xl w-full">
          <SceneTitle text={t('factChapter96Label')} />

          <div className="flex items-center gap-6">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">
              {t('visualVerse')}
            </div>
            <div
              ref={verseNumberRef}
              className="font-mono text-7xl md:text-8xl font-bold leading-none tabular-nums text-[var(--ed-accent)]"
            >
              01
            </div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">
              {t('visualOf19')}
            </div>
          </div>

          <div className="relative w-full h-32 flex items-center justify-center">
            <p
              ref={verseTextRef}
              className="font-arabic text-2xl md:text-4xl leading-relaxed text-center"
              dir="rtl"
              style={{ fontFamily: F.arabic }}
            >
              {ALAQ_VERSES[Math.max(0, Math.min(verseIndex - 1, 18))]}
            </p>
          </div>

          <div className="w-full max-w-md h-1.5 bg-[var(--ed-rule)]/20 overflow-hidden rounded-full">
            <div
              ref={verseProgressRef}
              className="h-full bg-[var(--ed-accent)] origin-left"
              style={{ transform: 'scaleX(0.05)' }}
            />
          </div>

          <StatusBadge text={t('visualVerified19Verses')} icon={<Activity size={10} />} />
        </div>
      </section>

      {/* ─── Scene 7: Discovery 1974 ─── */}
      <section
        ref={discoveryRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />
        <CornerMarkers
          label={t('visualTemporalAnalysis')}
          sub={t('visualYear1974')}
        />
        <SceneIndex i={6} t={t} />

        <div className="relative z-30 flex flex-col items-center gap-8 max-w-3xl w-full">
          <SceneTitle text={t('factDiscoveryLabel')} />

          <div className="flex flex-col items-center">
            <Binary size={24} className="text-[var(--ed-accent)] opacity-40 mb-2" />
            <div
              ref={discoveryYearRef}
              className="font-mono text-7xl md:text-9xl font-bold leading-none tracking-tighter tabular-nums text-[var(--ed-accent)]"
            >
              ----
            </div>
          </div>

          <div
            ref={discoveryLunarRef}
            className="flex items-center justify-center gap-4 md:gap-6 font-mono text-sm border border-[var(--ed-rule)]/50 bg-[var(--ed-surface)]/30 px-6 py-3 rounded-xl"
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-[var(--ed-fg-muted)]">13 BH</span>
              <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                {t('visualRevelationOfQuran')}
              </span>
            </div>
            <span className="text-[var(--ed-accent)] opacity-50">→</span>
            <div className="flex flex-col items-center text-center">
              <span className="text-[var(--ed-fg-muted)]">1974 CE</span>
              <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                {t('visualMiracleDiscovered')}
              </span>
            </div>
            <span className="text-[var(--ed-accent)] opacity-50">=</span>
            <div className="flex flex-col items-center text-center">
              <span className="font-bold text-[var(--ed-fg)] text-base">1406</span>
              <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                {t('visualLunarYears')}
              </span>
            </div>
          </div>

          <div
            ref={discoveryFactorRef}
            className="flex items-center gap-4 md:gap-6 bg-[var(--ed-surface)]/80 px-8 py-4 rounded-2xl border border-[var(--ed-rule)] shadow-[0_0_30px_var(--ed-surface)]"
          >
            <div className="font-mono text-3xl md:text-4xl text-[var(--ed-fg-muted)]">
              1406
            </div>
            <div className="text-[var(--ed-accent)] opacity-50 text-2xl">=</div>
            <div className="flex items-center gap-3 font-mono text-3xl md:text-4xl font-bold text-[var(--ed-accent)]">
              <span>19</span>
              <span className="text-xl md:text-2xl opacity-40 text-[var(--ed-fg)]">×</span>
              <span>74</span>
            </div>
          </div>

          <div
            ref={discoveryAnchorRef}
            className="flex flex-col items-center gap-3 pt-4 border-t border-[var(--ed-rule)]/50"
          >
            <div className="px-3 py-1 rounded border border-[var(--ed-accent)]/30 font-mono text-[9px] tracking-widest text-[var(--ed-accent)] bg-[var(--ed-accent)]/5 uppercase">
              {t('visualSurah7430')}
            </div>
            <div
              className="font-arabic text-3xl md:text-4xl"
              dir="rtl"
              style={{ fontFamily: F.arabic }}
            >
              عَلَيْهَا تِسْعَةَ عَشَرَ
            </div>
            <div className="font-serif italic text-base md:text-lg text-[var(--ed-fg-muted)] opacity-90">
              {t('visualOverItIsNineteen')}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Scene 8: Convergence finale ─── */}
      <section
        ref={finaleRef}
        className="relative h-screen overflow-hidden border-b border-[var(--ed-rule)] flex flex-col items-center justify-center px-6"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <ForensicScanlines />
        <Vignette />

        <div className="absolute inset-0 z-20 pointer-events-none">
          {[
            { x: '10%', y: '15%' },
            { x: '85%', y: '20%' },
            { x: '15%', y: '75%' },
            { x: '80%', y: '70%' },
            { x: '50%', y: '10%' },
            { x: '50%', y: '85%' },
          ].map((pos, i) => (
            <span
              key={`finale-${i}`}
              ref={(el) => {
                finaleNumbersRef.current[i] = el
              }}
              className="absolute font-mono text-5xl md:text-7xl font-bold text-[var(--ed-accent)] opacity-60"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              19
            </span>
          ))}
        </div>

        <div className="relative z-30 flex flex-col items-center gap-12 max-w-4xl">
          <div
            ref={finaleCenterRef}
            className="flex flex-col items-center gap-4"
          >
            <span
              className="font-arabic text-[10rem] md:text-[14rem] leading-none text-[var(--ed-accent)]"
              style={{
                fontFamily: F.arabic,
                textShadow:
                  '0 0 80px var(--ed-accent-soft), 0 0 160px var(--ed-accent-soft)',
              }}
            >
              ١٩
            </span>
            <p
              className="text-center max-w-xl"
              style={{
                fontFamily: F.serif,
                fontSize: 'clamp(18px, 4vw, 22px)',
                color: 'var(--ed-fg-muted)',
              }}
            >
              {t('visualOverItIsNineteen')}
            </p>
          </div>

          <div
            ref={finaleCardsRef}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full"
          >
            {[
              { num: '19', label: t('factBismillahLabel') },
              { num: '114', label: t('factChaptersLabel') },
              { num: '19', label: t('factRevelationLabel') },
              { num: '2,698', label: t('factGodLabel') },
              { num: '19', label: t('factChapter96Label') },
              { num: '1974', label: t('factDiscoveryLabel') },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 px-4 py-3 bg-[var(--ed-surface)]/40 border border-[var(--ed-rule)] rounded-xl"
              >
                <div
                  className="font-mono font-bold text-[var(--ed-accent)]"
                  style={{ fontSize: 'clamp(18px, 4vw, 24px)' }}
                >
                  {item.num}
                </div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-[var(--ed-fg-muted)] opacity-60 text-center">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Static narrative + appendix CTA ─── */}
      <section className="min-h-screen py-24 border-t border-[var(--ed-rule)] bg-[var(--ed-surface)]/20" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-4 text-[var(--ed-accent)]">
                <Cpu size={24} strokeWidth={1.5} />
                <h2
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('narrativeLabel')}
                </h2>
              </div>

              <div
                className="space-y-6 text-lg leading-relaxed"
                style={{ fontFamily: F.serif }}
              >
                <p>
                  {t('intro1Before')}{' '}
                  <Link
                    href="/quran/74?verse=30"
                    className="text-[var(--ed-accent)] hover:underline underline-offset-4 decoration-[var(--ed-accent)]/30 font-medium"
                  >
                    74:30
                  </Link>{' '}
                  {t('intro1After')}
                </p>
                <p className="opacity-90">{t('intro2')}</p>
                <p className="opacity-90">{t('intro3')}</p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <a
                href="https://youtu.be/4TUYIuxkAmQ?si=KqAL8Ra2c_Y4C2xf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block p-8 rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-bg)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaYoutube size={80} />
                </div>

                <div className="relative z-10 flex flex-col h-full gap-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 border border-red-500/10">
                    <FaYoutube size={24} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontFamily: F.mono,
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--ed-fg-muted)',
                        marginBottom: 8,
                      }}
                    >
                      {t('youtubeLabel')}
                    </div>
                    <h3
                      style={{
                        fontFamily: F.display,
                        fontSize: 24,
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      {t('youtubeTitle')}
                    </h3>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-[var(--ed-accent)] group-hover:gap-4 transition-all">
                    {t('youtubeWatch')}
                    <ArrowRight size={16} />
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center space-y-10">
            <div className="inline-flex p-4 rounded-3xl bg-[var(--ed-bg)] border border-[var(--ed-rule)] shadow-sm">
              <Database size={32} className="text-[var(--ed-accent)]" strokeWidth={1} />
            </div>

            <div className="space-y-4">
              <h2
                style={{
                  fontFamily: F.display,
                  fontSize: 32,
                  fontWeight: 500,
                }}
              >
                {t('readFullAnalysis')}
              </h2>
              <p
                className="text-[var(--ed-fg-muted)] text-lg max-w-xl mx-auto leading-relaxed"
                style={{ fontFamily: F.serif }}
              >
                {t('appendixDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <a
                href="https://cdn.wikisubmission.org/books/quran-the-final-testament-appendix-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all group shadow-lg"
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {t('appendixButton')}
                </span>
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/appendices/1"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-bg)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] transition-all group"
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {t('appendixButtonDigital')}
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`inline-block ${className ?? ''}`}
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </>
  )
}

function SceneIndex({ i, t }: { i: number; t: (k: string) => string }) {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
      <div className="px-2 py-1 rounded bg-[var(--ed-surface)] border border-[var(--ed-rule)] font-mono text-[9px] tracking-widest uppercase text-[var(--ed-accent)]">
        0{i + 1}
      </div>
      <div className="h-px w-8 bg-[var(--ed-rule)]" />
      <span className="font-mono text-[9px] uppercase opacity-40 tracking-widest">
        {t('visualSystemRecord')}
      </span>
    </div>
  )
}

function SceneTitle({ text }: { text: string }) {
  return (
    <h2
      className="text-2xl md:text-4xl font-medium leading-tight max-w-2xl text-center"
      style={{ fontFamily: F.serif }}
    >
      {text}
    </h2>
  )
}

function StatusBadge({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[0.3em] uppercase flex items-center gap-2 text-[var(--ed-accent)] font-bold">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function ScrollHint({ label }: { label: string }) {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-30">
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase">{label}</div>
      <div className="h-8 w-px bg-[var(--ed-fg-muted)] animate-pulse" />
    </div>
  )
}
