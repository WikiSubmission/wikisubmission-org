'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import PrayerTimesClient from './prayer-times-client'
import RamadanClient from './ramadan-client'
import { ZakatCalculator } from '@/components/zakat-calculator'

// ── Astronomical Hijri calendar (Julian Day Number method) ──────────────────
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const Y = date.getFullYear(), M = date.getMonth() + 1, D = date.getDate()
  const JD =
    Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4) +
    D - 32075
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
  return { year, month, day }
}

/** Days until the next Ramadan (month 9, day 1). Returns 0 if today is Ramadan. */
function daysUntilNextRamadan(): number {
  const today = new Date()
  const hijri = gregorianToHijri(today)
  // Already in Ramadan
  if (hijri.month === 9) return 0
  // Walk forward day-by-day until Hijri month 9, day 1 (max ~354 iterations)
  const probe = new Date(today)
  for (let i = 1; i <= 355; i++) {
    probe.setDate(probe.getDate() + 1)
    const h = gregorianToHijri(probe)
    if (h.month === 9 && h.day === 1) return i
  }
  return 356
}

const DAYS_UNTIL_RAMADAN = daysUntilNextRamadan()
const SHOW_RAMADAN_TAB = DAYS_UNTIL_RAMADAN <= 15

const ALL_TABS = [
  { id: 'prayer' as const, label: 'Prayer Times', badge: null },
  {
    id: 'ramadan' as const,
    label: 'Ramadan',
    badge:
      DAYS_UNTIL_RAMADAN > 0
        ? `in ${DAYS_UNTIL_RAMADAN}d`
        : null,
  },
  { id: 'zakat' as const, label: 'Zakat', badge: null },
]

const TABS = SHOW_RAMADAN_TAB ? ALL_TABS : ALL_TABS.filter((t) => t.id !== 'ramadan')

type TabId = 'prayer' | 'ramadan' | 'zakat'

const PLACEHOLDER_CARDS = [
  {
    title: 'Understanding Salat',
    description: 'The meaning, times, and postures of the five daily prayers.',
    slug: 'understanding-salat',
  },
  {
    title: 'Zakat Guide',
    description: 'Who owes Zakat, how to calculate it, and who to give it to.',
    slug: 'zakat-guide',
  },
  {
    title: 'Ramadan & Fasting',
    description: 'The purpose of fasting and how to observe Ramadan correctly.',
    slug: 'ramadan-fasting',
  },
  {
    title: 'Hajj Overview',
    description: 'The pilgrimage to Mecca — its rites and spiritual significance.',
    slug: 'hajj-overview',
  },
]

export default function PracticesClient() {
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS[0].id
  )

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            Practices
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Islamic Practices
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Prayer times, Ramadan schedule, and Zakat calculator — tools to
            support your daily worship.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 border-b border-border/40 pb-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === 'prayer' && <PrayerTimesClient />}
        {activeTab === 'ramadan' && <RamadanClient />}
        {activeTab === 'zakat' && (
          <div className="py-8">
            <ZakatCalculator />
          </div>
        )}
      </div>

      {/* Placeholder educational cards */}
      <section className="border-t border-border/40 bg-muted/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-headline text-2xl font-bold">Learn More</h2>
            <div className="h-px grow mx-6 bg-border/60" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Coming Soon
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLACEHOLDER_CARDS.map((card) => (
              <div
                key={card.slug}
                className="group relative bg-background rounded-xl p-6 editorial-shadow border border-border/40 transition-all hover:-translate-y-0.5"
              >
                <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
                  Coming Soon
                </span>
                <h3 className="font-headline font-bold text-base mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
