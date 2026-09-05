'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import {
  ArrowRight,
  Compass,
  Landmark,
  Moon,
  Wallet,
  Calendar,
  Clock,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'

import PrayerTimesClient from './prayer-times-client'
import RamadanClient from './ramadan-client'
import { ZakatCalculator } from '@/components/zakat-calculator'
import type { components } from '@/src/api/types.gen'
import { F, SectionDivider } from '../_sections/shared'
import { FadeUp } from '@/lib/motion'

type VerseData = components['schemas']['VerseData']

// ── HIJRI UTILS ─────────────────────────────────────────────────────────────

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabiʻ I',
  'Rabiʻ II',
  'Jumada I',
  'Jumada II',
  'Rajab',
  'Shaʻban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qiʻdah',
  'Dhu al-Hijjah',
]

function gregorianToHijri(date: Date): {
  year: number
  month: number
  day: number
  monthName: string
} {
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const JD =
    Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4) +
    D -
    32075
  const Z = JD - 1948438 + 10632
  const N = Math.floor(Z / 10631)
  const AA = Z - 10631 * N + 354
  const K =
    Math.floor((10985 - AA) / 5316) * Math.floor((50 * AA) / 17719) +
    Math.floor(AA / 5670) * Math.floor((43 * AA) / 15238)
  const AL =
    AA -
    Math.floor((30 - K) / 15) * Math.floor((17719 * K) / 50) -
    Math.floor(K / 16) * Math.floor((15238 * K) / 43) +
    29
  const month = Math.floor((24 * AL) / 709)
  const day = AL - Math.floor((709 * month) / 24)
  const year = 30 * N + K - 29
  const monthName = HIJRI_MONTHS[month - 1] || 'Ramadan'
  return { year, month, day, monthName }
}

function daysUntilNextRamadan(): number {
  const today = new Date()
  const hijri = gregorianToHijri(today)
  if (hijri.month === 9) return 0
  const probe = new Date(today)
  for (let i = 1; i <= 355; i++) {
    probe.setDate(probe.getDate() + 1)
    const h = gregorianToHijri(probe)
    if (h.month === 9 && h.day === 1) return i
  }
  return 356
}

// ── CORE RITES CONFIG ────────────────────────────────────────────────────────

type RiteCardData = {
  id: 'contactPrayers' | 'zakat' | 'ramadan' | 'hajj'
  href: string
  toolTab?: 'prayer' | 'zakat' | 'ramadan'
  toolLabel?: string
  icon: React.ElementType
  arabicTitle: string
  cadence: string
  quranChapter: string
  refs: string[]
  highlights: string[]
}

const RITE_CARDS: RiteCardData[] = [
  {
    id: 'contactPrayers',
    href: '/practices/contact-prayers',
    toolTab: 'prayer',
    toolLabel: 'Prayer Times Studio',
    icon: Compass,
    arabicTitle: 'الصَّلَاةُ',
    cadence: '5 Times Daily',
    quranChapter: 'Sura 4:103 · 11:114 · 17:78',
    refs: ['4:103', '11:114', '17:78', '24:58'],
    highlights: [
      '5 astronomical times daily (Fajr, Dhuhr, Asr, Maghrib, Isha)',
      'Ablution (Wudu) prescribed in 5:6 before prayer',
      'Facing the Sacred Mosque (Masjid Al-Haram)',
    ],
  },
  {
    id: 'zakat',
    href: '/practices/zakat',
    toolTab: 'zakat',
    toolLabel: 'Zakat Calculator (2.5%)',
    icon: Wallet,
    arabicTitle: 'الزَّكَاةُ',
    cadence: '2.5% On Day of Harvest/Receipt',
    quranChapter: 'Sura 6:141 · 2:215 · 30:38',
    refs: ['2:215', '2:267', '6:141', '30:38'],
    highlights: [
      'Paid on the day income is received (6:141)',
      '2.5% rate instituted through Abraham and confirmed in scripture',
      'Distributed to parents, relatives, orphans, and the poor',
    ],
  },
  {
    id: 'ramadan',
    href: '/practices/ramadan',
    toolTab: 'ramadan',
    toolLabel: 'Fasting Calendar',
    icon: Moon,
    arabicTitle: 'الصِّيَامُ',
    cadence: '9th Lunar Month · Dawn to Sunset',
    quranChapter: 'Sura 2:183-187 · 97:1-5',
    refs: ['2:183', '2:184', '2:185', '2:187'],
    highlights: [
      'Abstaining from food, drink, and sexual relations dawn to sunset',
      'The Quran was revealed in Ramadan (2:185)',
      'Exemptions for illness and travel with substitution days',
    ],
  },
  {
    id: 'hajj',
    href: '/practices/hajj',
    icon: Landmark,
    arabicTitle: 'الحَجُّ',
    cadence: 'Once in Lifetime (4 Sacred Months)',
    quranChapter: 'Sura 2:196-197 · 22:27 · 3:97',
    refs: ['2:158', '2:196', '2:197', '3:97', '22:27'],
    highlights: [
      'Four Sacred Months: Zul-Hijjah, Muharram, Safar, and Rabiʻ I',
      'Obligatory once in a lifetime for those who can afford it',
      'Purely Abrahamic rites of devotion and commemoration',
    ],
  },
]

export default function PracticesClient({
  prayerVerse,
}: {
  prayerVerse: VerseData | null
}) {
  const t = useTranslations('practices')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const hasQuery = !!searchParams.get('q')

  const [activeToolTab, setActiveToolTab] = useState<'prayer' | 'zakat' | 'ramadan'>('prayer')

  useEffect(() => {
    if (!hasQuery) return
    const el = document.getElementById('interactive-tools')
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hasQuery])

  const today = useMemo(() => new Date(), [])
  const hijri = useMemo(() => gregorianToHijri(today), [today])
  const daysUntilRamadan = useMemo(() => daysUntilNextRamadan(), [])
  const prayerText = prayerVerse?.tr?.[locale]?.tx ?? prayerVerse?.tr?.['en']?.tx

  const scrollToTools = (tab?: 'prayer' | 'zakat' | 'ramadan') => {
    if (tab) setActiveToolTab(tab)
    const el = document.getElementById('interactive-tools')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)]">
      {/* ── Editorial Hero Header ─────────────────────────────────────────── */}
      <section
        className="px-4 sm:px-6 md:px-10 border-b"
        style={{
          borderColor: 'var(--ed-rule)',
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(56px, 10vw, 96px)',
          paddingBottom: 'clamp(32px, 6vw, 56px)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--ed-accent)]" />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            {t('hub')} · Religious Rites
          </span>
        </div>

        <h1
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: 'var(--ed-fg)',
          }}
        >
          Life as a{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--ed-fg-muted)' }}>
            Submitter.
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mt-6">
          <div className="lg:col-span-8">
            <p
              style={{
                fontFamily: F.serif,
                fontSize: 'clamp(15px, 3.6vw, 17px)',
                lineHeight: 1.65,
                color: 'var(--ed-fg-muted)',
                maxWidth: '64ch',
              }}
            >
              {t('description')}
            </p>

            {/* Fast Jump Anchor Chips */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              <button
                type="button"
                onClick={() => scrollToTools('prayer')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] cursor-pointer"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                  fontFamily: F.mono,
                }}
              >
                <Clock size={14} className="text-[var(--ed-accent)]" />
                <span>Prayer Times Studio</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToTools('zakat')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] cursor-pointer"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                  fontFamily: F.mono,
                }}
              >
                <Calculator size={14} className="text-[var(--ed-accent)]" />
                <span>Zakat Calculator (2.5%)</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToTools('ramadan')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] cursor-pointer"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                  fontFamily: F.mono,
                }}
              >
                <Moon size={14} className="text-[var(--ed-accent)]" />
                <span>Ramadan Fasting</span>
              </button>
              <a
                href="#four-rites"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                  fontFamily: F.mono,
                }}
              >
                <BookOpen size={14} className="text-[var(--ed-accent)]" />
                <span>The 4 Core Rites</span>
              </a>
            </div>
          </div>

          {/* Right: Live Hijri & Ramadan Pill Card */}
          <div className="lg:col-span-4">
            <div
              className="rounded-2xl border p-5 space-y-3"
              style={{
                borderColor: 'var(--ed-rule)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--ed-accent)]" />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider text-[var(--ed-fg)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    Hijri Calendar
                  </span>
                </div>
                <span
                  className="text-xs font-mono font-bold text-[var(--ed-accent)] px-2 py-0.5 rounded-full border"
                  style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-bg)' }}
                >
                  {hijri.year} AH
                </span>
              </div>

              <div className="text-xl font-medium tracking-tight text-[var(--ed-fg)]" style={{ fontFamily: F.display }}>
                {hijri.day} {hijri.monthName} {hijri.year}
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--ed-fg-muted)] pt-2 border-t" style={{ borderColor: 'var(--ed-rule)', fontFamily: F.serif }}>
                <span className="flex items-center gap-1.5">
                  <Moon size={13} className="text-[var(--ed-accent)]" />
                  {hijri.month === 9 ? 'Ramadan active' : `${daysUntilRamadan} days to Ramadan`}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToTools('ramadan')}
                  className="font-mono text-[11px] text-[var(--ed-accent)] hover:underline cursor-pointer"
                >
                  Schedule →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 md:px-10 py-12 sm:py-20"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {/* ── SECTION 01: Interactive Utilities Studio (FIRST) ────────────── */}
        <section id="interactive-tools" className="mb-20 sm:mb-28 scroll-mt-24">
          <SectionDivider
            num="01"
            title="Interactive Religious Utilities"
            sub="Prayer Times · Zakat Calculator · Ramadan Tracker"
          />

          <div
            className="rounded-2xl border overflow-hidden shadow-xs bg-[var(--ed-surface)]"
            style={{ borderColor: 'var(--ed-rule)' }}
          >
            {/* Minimalist Segmented Tabs */}
            <div
              className="p-3 sm:p-4 border-b flex items-center justify-between gap-3 flex-wrap bg-[var(--ed-bg)]"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              {/* Serious, Enterprise Header Toolbar */}
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]" />
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--ed-fg)]"
                  style={{ fontFamily: F.glacial }}
                >
                  Practices Suite
                </span>
                <span className="text-[11px] font-mono text-[var(--ed-fg-muted)] hidden sm:inline">
                  · Daily Utilities
                </span>
              </div>

              {/* Tab Selector Buttons - Responsive full-width on mobile */}
              <div
                className="inline-flex w-full sm:w-auto rounded-xl border p-1 gap-1 bg-[var(--ed-surface)] overflow-x-auto"
                style={{ borderColor: 'var(--ed-rule)' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveToolTab('prayer')}
                  className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    backgroundColor: activeToolTab === 'prayer' ? 'var(--ed-accent)' : 'transparent',
                    color: activeToolTab === 'prayer' ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
                    fontFamily: F.glacial,
                  }}
                >
                  <Clock size={13} />
                  <span>Prayer Times</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveToolTab('zakat')}
                  className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    backgroundColor: activeToolTab === 'zakat' ? 'var(--ed-accent)' : 'transparent',
                    color: activeToolTab === 'zakat' ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
                    fontFamily: F.glacial,
                  }}
                >
                  <Calculator size={13} />
                  <span>Zakat (2.5%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveToolTab('ramadan')}
                  className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    backgroundColor: activeToolTab === 'ramadan' ? 'var(--ed-accent)' : 'transparent',
                    color: activeToolTab === 'ramadan' ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
                    fontFamily: F.glacial,
                  }}
                >
                  <Moon size={13} />
                  <span>Ramadan</span>
                </button>
              </div>
            </div>

            {/* Active Studio Content */}
            <div className="p-4 sm:p-8 md:p-10">
              {activeToolTab === 'prayer' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--ed-rule)]">
                    <div>
                      <h3
                        className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
                        style={{ fontFamily: F.display }}
                      >
                        {t('findTodaysPrayerTimes')}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--ed-fg-muted)] mt-0.5" style={{ fontFamily: F.serif }}>
                        Search any city worldwide for astronomical Fajr, Dhuhr, Asr, Maghrib, and Isha times.
                      </p>
                    </div>

                    <Link
                      href="/practices/contact-prayers"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[var(--ed-accent)] hover:underline shrink-0"
                    >
                      <span>Full Salat Guide</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>

                  {prayerText && (
                    <div
                      className="p-5 rounded-xl border space-y-2 bg-[var(--ed-bg)]"
                      style={{ borderColor: 'var(--ed-rule)' }}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[var(--ed-rule)]/60 pb-2">
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider text-[var(--ed-accent)] font-semibold"
                        >
                          Scriptural Mandate · Sura 4, Verse 103
                        </span>
                        <span className="text-[10px] font-mono text-[var(--ed-fg-muted)]">
                          The Contact Prayers (Salat)
                        </span>
                      </div>
                      <p
                        className="text-xs sm:text-sm leading-relaxed text-[var(--ed-fg)]"
                        style={{ fontFamily: F.serif }}
                      >
                        &ldquo;{prayerText.replace(/\s*±\s*/g, ' ')}&rdquo;
                      </p>
                    </div>
                  )}

                  <PrayerTimesClient />
                </div>
              )}

              {activeToolTab === 'zakat' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--ed-rule)]">
                    <div>
                      <h3
                        className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
                        style={{ fontFamily: F.display }}
                      >
                        {t('calculateZakatQuickly')}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--ed-fg-muted)] mt-0.5" style={{ fontFamily: F.serif }}>
                        Calculate the 2.5% obligatory charity due on the day you receive income (6:141).
                      </p>
                    </div>

                    <Link
                      href="/practices/zakat"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[var(--ed-accent)] hover:underline shrink-0"
                    >
                      <span>Full Zakat Guide</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>

                  <ZakatCalculator />
                </div>
              )}

              {activeToolTab === 'ramadan' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--ed-rule)]">
                    <div>
                      <h3
                        className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
                        style={{ fontFamily: F.display }}
                      >
                        {t('checkRamadanDates')}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--ed-fg-muted)] mt-0.5" style={{ fontFamily: F.serif }}>
                        Look up the lunar month of Ramadan and daily fasting intervals (dawn to sunset).
                      </p>
                    </div>

                    <Link
                      href="/practices/ramadan"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[var(--ed-accent)] hover:underline shrink-0"
                    >
                      <span>Full Fasting Guide</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>

                  <RamadanClient />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 02: The Four Core Rites Master Showcase ─────────────── */}
        <section id="four-rites" className="mb-20 sm:mb-28 scroll-mt-24">
          <SectionDivider
            num="02"
            title="The Four Core Rites"
            sub="Salat · Zakat · Siyam · Hajj"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RITE_CARDS.map((rite, index) => {
              const Icon = rite.icon
              const title = t(`rites.${rite.id}.title`)
              const eyebrow = t(`rites.${rite.id}.eyebrow`)
              const summary = t(`rites.${rite.id}.summary`)

              return (
                <FadeUp key={rite.id} distance={14} delay={index * 0.05}>
                  <article
                    className="h-full rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[var(--ed-accent)]/80 hover:shadow-md group relative overflow-hidden bg-[var(--ed-surface)]"
                    style={{
                      borderColor: 'var(--ed-rule)',
                    }}
                  >
                    <div className="space-y-5">
                      {/* Top Bar: Pillar Number, Icon, Arabic Calligraphy */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center border text-[var(--ed-accent)] bg-[var(--ed-bg)]"
                            style={{ borderColor: 'var(--ed-rule)' }}
                          >
                            <Icon size={17} />
                          </div>
                          <div>
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider text-[var(--ed-accent)] block"
                              style={{ fontFamily: F.glacial }}
                            >
                              Pillar 0{index + 1} · {eyebrow}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--ed-fg-muted)]">
                              {rite.cadence}
                            </span>
                          </div>
                        </div>

                        {/* Arabic Script */}
                        <span
                          dir="rtl"
                          className="text-2xl sm:text-3xl text-[var(--ed-accent)] opacity-85 group-hover:opacity-100 transition-opacity font-normal"
                          style={{ fontFamily: 'var(--font-amiri), "Amiri", serif' }}
                        >
                          {rite.arabicTitle}
                        </span>
                      </div>

                      {/* Main Title & Description */}
                      <div className="space-y-2">
                        <h2
                          className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ed-fg)]"
                          style={{ fontFamily: F.display }}
                        >
                          {title}
                        </h2>
                        <p
                          className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                          style={{ fontFamily: F.serif }}
                        >
                          {summary}
                        </p>
                      </div>

                      {/* Clean Minimalist Highlights */}
                      <ul className="space-y-2 pt-1 border-t border-[var(--ed-rule)]">
                        {rite.highlights.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-[var(--ed-fg-muted)]"
                            style={{ fontFamily: F.serif }}
                          >
                            <CheckCircle2 size={13} className="text-[var(--ed-accent)] shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Scriptural Anchors */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[var(--ed-fg-muted)] pt-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                          Scripture:
                        </span>
                        {rite.refs.map((ref) => (
                          <span
                            key={ref}
                            className="px-2 py-0.5 rounded-md text-[11px] font-mono border bg-[var(--ed-bg)]"
                            style={{ borderColor: 'var(--ed-rule)' }}
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-5 mt-5 border-t border-[var(--ed-rule)] flex items-center justify-between gap-3">
                      <Link
                        href={rite.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ed-accent)] hover:text-[var(--ed-fg)] transition-colors"
                        style={{ fontFamily: F.glacial }}
                      >
                        <span>Full Guide</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      {rite.toolTab && (
                        <button
                          type="button"
                          onClick={() => scrollToTools(rite.toolTab)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors cursor-pointer"
                          style={{ fontFamily: F.mono }}
                        >
                          <span>{rite.toolLabel}</span>
                          <ArrowUpRight size={12} />
                        </button>
                      )}
                    </div>
                  </article>
                </FadeUp>
              )
            })}
          </div>
        </section>

        {/* ── SECTION 03: Scriptural Lineage (Abraham) ────────────────────── */}
        <section className="mb-20 sm:mb-28">
          <FadeUp distance={12}>
            <div
              className="rounded-2xl border p-6 sm:p-10 space-y-5 bg-[var(--ed-surface)]/80"
              style={{
                borderColor: 'var(--ed-rule)',
              }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-[var(--ed-rule)]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]" />
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    The Abrahamic Foundation
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--ed-fg-muted)]">
                  Quran 22:78 · Sura Al-Hajj
                </span>
              </div>

              {/* Arabic Calligraphy (Full Verse Text) */}
              <div
                dir="rtl"
                className="font-arabic text-right text-lg sm:text-xl md:text-2xl leading-[2.2] text-[var(--ed-fg)]"
                style={{ fontFamily: 'var(--font-amiri), "Amiri", serif' }}
              >
                مِّلَّةَ أَبِيكُمْ إِبْرَٰهِيمَ ۚ هُوَ سَمَّىٰكُمُ ٱلْمُسْلِمِينَ مِن قَبْلُ وَفِى هَـٰذَا لِيَكُونَ ٱلرَّسُولُ شَهِيدًا عَلَيْكُمْ وَتَكُونُوا۟ شُهَدَآءَ عَلَى ٱلنَّاسِ ۚ فَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱعْتَصِمُوا۟ بِٱللَّهِ هُوَ مَوْلَىٰكُمْ ۖ فَنِعْمَ ٱلْمَوْلَىٰ وَنِعْمَ ٱلنَّصِيرُ
              </div>

              {/* English Translation */}
              <p
                className="text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)] pt-3 border-t border-[var(--ed-rule)]"
                style={{ fontFamily: F.serif }}
              >
                <span className="text-[var(--ed-accent)] font-semibold">&ldquo;</span>
                ...the religion of your father Abraham; he is the one who named you &lsquo;Submitters&rsquo; originally. Thus, the messenger shall serve as a witness among you, and you shall serve as witnesses among the people. Therefore, you shall observe the Contact Prayers (Salat) and give the obligatory charity (Zakat), and hold fast to GOD; He is your Lord, the best Lord and the best Supporter.
                <span className="text-[var(--ed-accent)] font-semibold">&rdquo;</span>
              </p>
            </div>
          </FadeUp>
        </section>

        {/* ── Closing Navigation Banner ──────────────────────────────────── */}
        <section>
          <FadeUp distance={12}>
            <div
              className="rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 bg-[var(--ed-surface)]"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              <div className="space-y-1 text-center sm:text-left">
                <h3
                  className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
                  style={{ fontFamily: F.display }}
                >
                  Start Your Daily Practice
                </h3>
                <p
                  className="text-xs sm:text-sm text-[var(--ed-fg-muted)] max-w-lg"
                  style={{ fontFamily: F.serif }}
                >
                  Begin with the five daily Contact Prayers, step-by-step ablution instructions, and Quranic recitations.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
                <Link
                  href="/practices/contact-prayers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all bg-[var(--ed-accent)] text-[var(--ed-bg)] hover:opacity-95 shadow-xs"
                  style={{ fontFamily: F.glacial }}
                >
                  <span>Learn Salat</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/practices/zakat"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs border border-[var(--ed-rule)] text-[var(--ed-fg)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] bg-[var(--ed-bg)] transition-colors"
                  style={{ fontFamily: F.glacial }}
                >
                  <span>Zakat Guide</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </FadeUp>
        </section>
      </div>
    </main>
  )
}


