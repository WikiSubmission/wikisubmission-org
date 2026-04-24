'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import PrayerTimesClient from './prayer-times-client'
import RamadanClient from './ramadan-client'
import { ZakatCalculator } from '@/components/zakat-calculator'
import type { components } from '@/src/api/types.gen'
import { useTranslations } from 'next-intl'
import { 
  BookOpen, 
  MapPin, 
  Calendar,
  Compass,
  ArrowUpRight,
  Sun,
  Moon,
  Wallet
} from 'lucide-react'

type VerseData = components['schemas']['VerseData']

// ── UTILS ─────────────────────────────────────────────────────────────

function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const Y = date.getFullYear(), M = date.getMonth() + 1, D = date.getDate()
  const JD = Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
             Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
             Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4) +
             D - 32075
  const Z = JD - 1948438 + 10632
  const N = Math.floor(Z / 10631)
  const AA = Z - 10631 * N + 354
  const K = Math.floor((10985 - AA) / 5316) * Math.floor((50 * AA) / 17719) + Math.floor(AA / 5670) * Math.floor((43 * AA) / 15238)
  const AL = AA - Math.floor((30 - K) / 15) * Math.floor((17719 * K) / 50) - Math.floor(K / 16) * Math.floor((15238 * K) / 43) + 29
  const month = Math.floor((24 * AL) / 709)
  const day = AL - Math.floor((709 * month) / 24)
  const year = 30 * N + K - 29
  return { year, month, day }
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

// ── SHARED UI ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px w-8 bg-[var(--ed-accent)]/40" />
      <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--ed-accent)] opacity-60">
        {children}
      </span>
    </div>
  )
}

function VerseQuote({ verseKey, text }: { verseKey: string; text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="block p-6 border-l-2 border-[var(--ed-accent)]/20 bg-[var(--ed-surface)]/10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={12} className="text-[var(--ed-accent)] opacity-40" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--ed-accent)] opacity-50">
            {verseKey}
          </span>
        </div>
        <p className="text-sm md:text-base text-[var(--ed-fg-muted)] italic font-serif leading-relaxed opacity-70">
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </motion.div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────

export default function PracticesClient({
  zakatVerse,
  prayerVerse,
}: {
  zakatVerse: VerseData | null
  prayerVerse: VerseData | null
}) {
  const t = useTranslations('practices')
  
  const daysUntilRamadan = useMemo(() => daysUntilNextRamadan(), [])
  const showRamadan = daysUntilRamadan <= 15

  const zakatText = zakatVerse?.tr?.['en']?.tx
  const prayerText = prayerVerse?.tr?.['en']?.tx

  const LEARNING_CARDS = [
    { title: t('card1Title'), description: t('card1Desc'), icon: Compass },
    { title: t('card2Title'), description: t('card2Desc'), icon: Wallet },
    { title: t('card3Title'), description: t('card3Desc'), icon: Calendar },
    { title: t('card4Title'), description: t('card4Desc'), icon: MapPin },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Minimalist Hero ─────────────────────────────────────────── */}
      <section className="relative border-b border-[var(--ed-rule)] overflow-hidden">
        {/* Subtle Background HUD Grid */}
        <div className="absolute inset-0 z-0 bg-grid opacity-[0.02]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-[var(--ed-accent)]/30" />
                <div className="flex items-center gap-2 opacity-30">
                  <Sun size={12} className="text-[var(--ed-accent)]" />
                  <Moon size={12} className="text-[var(--ed-fg-muted)]" />
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-serif font-medium text-[var(--ed-fg)] leading-[0.95] tracking-tight">
                {t('heading')}
              </h1>
              <p className="text-lg md:text-xl text-[var(--ed-fg-muted)] leading-relaxed opacity-60">
                {t('description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Prayer Times ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-10">
            <div>
              <SectionLabel>Geospatial // Salah</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-[var(--ed-fg)] mb-6">
                {t('prayerTimes')}
              </h2>
              <p className="text-sm text-[var(--ed-fg-muted)] leading-relaxed opacity-60">
                Calculated via high-precision astronomical ephemeris. The algorithm dynamically adjusts for atmospheric refraction and elevation to ensure sub-minute accuracy.
              </p>
            </div>

            {prayerText && (
              <VerseQuote
                verseKey="4:103"
                text={prayerText}
              />
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="p-1 rounded-[32px] bg-gradient-to-br from-[var(--ed-rule)] to-transparent">
              <div className="bg-[var(--ed-bg)] rounded-[31px] p-6 md:p-10 border border-[var(--ed-rule)]/50">
                <PrayerTimesClient />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zakat ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 bg-[var(--ed-surface)]/10 border-y border-[var(--ed-rule)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="p-1 rounded-[32px] bg-gradient-to-br from-[var(--ed-rule)] to-transparent shadow-2xl">
                <div className="bg-[var(--ed-bg)] rounded-[31px] p-6 md:p-10 border border-[var(--ed-rule)]/50">
                  <ZakatCalculator />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-10">
              <div>
                <SectionLabel>Distribution // Alm</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-[var(--ed-fg)] mb-6">
                  {t('zakat')}
                </h2>
                <p className="text-sm text-[var(--ed-fg-muted)] leading-relaxed opacity-60">
                  A mandatory charity of 2.5% on all liquid assets. The Quranic mandate (6:141) emphasizes immediate distribution at the point of receipt, ensuring constant flow of capital to those in need.
                </p>
              </div>

              {zakatText && (
                <VerseQuote
                  verseKey="2:215"
                  text={zakatText}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ramadan ───────────────────────────────────────────────────── */}
      {showRamadan && (
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="mb-12">
            <SectionLabel>Lunar Cycle // Fasting</SectionLabel>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-[var(--ed-fg)]">
                {t('ramadan')}
              </h2>
              {daysUntilRamadan > 0 && (
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ed-accent)] opacity-50 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)] animate-pulse" />
                  T-minus {daysUntilRamadan} days
                </div>
              )}
            </div>
          </div>
          <div className="p-1 rounded-[32px] bg-gradient-to-br from-[var(--ed-rule)] to-transparent">
            <div className="bg-[var(--ed-bg)] rounded-[31px] p-6 md:p-10 border border-[var(--ed-rule)]/50">
              <RamadanClient />
            </div>
          </div>
        </section>
      )}

      {/* ── Knowledge Base ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex-1">
            <SectionLabel>Knowledge Base</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[var(--ed-fg)]">
              {t('learnMore')}
            </h2>
          </div>
          <div className="h-px hidden md:block flex-1 mx-12 bg-[var(--ed-rule)]/30" />
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--ed-fg-muted)] opacity-30">
            {t('comingSoon')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--ed-rule)] border border-[var(--ed-rule)] rounded-[24px] overflow-hidden">
          {LEARNING_CARDS.map((card, i) => (
            <div
              key={i}
              className="group bg-[var(--ed-bg)] p-10 hover:bg-[var(--ed-surface)]/40 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-12">
                <div className="p-3 rounded-xl bg-[var(--ed-surface)] border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] group-hover:border-[var(--ed-accent)]/30 transition-all">
                  <card.icon size={22} />
                </div>
                <ArrowUpRight size={16} className="text-[var(--ed-fg-muted)] opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[var(--ed-fg)] mb-3">{card.title}</h3>
              <p className="text-xs text-[var(--ed-fg-muted)] leading-relaxed opacity-50 group-hover:opacity-70 transition-opacity">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
