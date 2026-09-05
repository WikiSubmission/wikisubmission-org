'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

// ─── Minimalist Bespoke Practice Symbols ───

function PrayerSymbol({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center p-2 ${className ?? 'w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80'}`}>
      <Image
        src="/prostrating-figure.png"
        alt="Contact Prayer - Prostrating Figure"
        width={360}
        height={360}
        className="w-full h-full object-contain filter drop-shadow-md"
        priority
      />
    </div>
  )
}

function ZakatSymbol({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center p-2 ${className ?? 'w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80'}`}>
      <Image
        src="/zakat-symbol.png"
        alt="Obligatory Charity - Zakat Symbol"
        width={360}
        height={360}
        className="w-full h-full object-contain filter drop-shadow-md"
        priority
      />
    </div>
  )
}

function FastingSymbol({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center p-2 ${className ?? 'w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80'}`}>
      <Image
        src="/ramadan.png"
        alt="Ramadan Fasting - Crescent Moon"
        width={360}
        height={360}
        className="w-full h-full object-contain filter drop-shadow-md"
        priority
      />
    </div>
  )
}

function HajjSymbol({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center p-2 ${className ?? 'w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80'}`}>
      <Image
        src="/Kaba.png"
        alt="The Hajj Pilgrimage - The Holy Kaaba Sanctuary"
        width={360}
        height={360}
        className="w-full h-full object-contain filter drop-shadow-md"
        priority
      />
    </div>
  )
}

export function PracticesSection() {
  const t = useTranslations('homePage.practices')
  const [activeTab, setActiveTab] = useState<number>(0)

  const PRACTICES = [
    {
      id: 'salah',
      num: 'I',
      tabLabel: 'The Contact Prayers',
      sublabel: 'Salah',
      kicker: 'FIVE DAILY ASTRONOMICAL CONTACTS',
      title: 'The Contact Prayers',
      titleAlt: '· Salah',
      desc: t('prayerDesc'),
      meta: 'Prescribed at proper solar times (4:103) · Continuous remembrance of God',
      symbol: <PrayerSymbol className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80" />,
      glowColor: 'rgba(212, 163, 115, 0.25)',
      href: '/practices',
      ctaLabel: 'Explore Salah Guidelines',
      details: [
        { label: 'FAJR', value: 'Dawn' },
        { label: 'DHUHR', value: 'Noon' },
        { label: 'ASR', value: 'Afternoon' },
        { label: 'MAGHRIB', value: 'Sunset' },
        { label: 'ISHA', value: 'Night' },
      ],
      quickLinks: [
        { label: 'Ablution Steps (Wudu)', href: '/practices#wudu' },
        { label: 'Astronomical Times', href: '/practices#times' },
        { label: 'Friday Congregational Prayer', href: '/practices#friday' },
      ],
    },
    {
      id: 'zakat',
      num: 'II',
      tabLabel: 'Obligatory Charity',
      sublabel: 'Zakat',
      kicker: '2.5% ON NET INCOME · PAID ON RECEIPT',
      title: 'The Obligatory Charity',
      titleAlt: '· Zakat',
      desc: t('zakatDesc'),
      meta: 'Given directly to parents, relatives, orphans, the poor, and traveling aliens (2:215, 6:141)',
      symbol: <ZakatSymbol className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 text-primary" />,
      glowColor: 'rgba(52, 211, 153, 0.22)',
      href: '/practices',
      ctaLabel: 'Calculate & Understand Zakat',
      details: [
        { label: 'RATE', value: '2.5%' },
        { label: 'TIMING', value: 'On Receipt' },
        { label: 'THRESHOLD', value: 'No Minimum' },
        { label: 'SCRIPTURE', value: 'Sura 6:141' },
      ],
      quickLinks: [
        { label: 'Zakat Calculator', href: '/practices#zakat-calculator' },
        { label: 'Recipients in Scripture', href: '/practices#recipients' },
        { label: 'Zakat vs Voluntary Charity', href: '/practices#charity' },
      ],
    },
    {
      id: 'siyam',
      num: 'III',
      tabLabel: 'Ramadan Fasting',
      sublabel: 'Siyam',
      kicker: 'SACRED MONTH OF FASTING · 2:183-187',
      title: 'Ramadan Fasting',
      titleAlt: '· Siyam',
      desc: t('ramadanDesc'),
      meta: 'Abstaining from food, drink, and intercourse from the first thread of dawn until sunset',
      symbol: <FastingSymbol className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 text-primary" />,
      glowColor: 'rgba(96, 165, 250, 0.22)',
      href: '/practices',
      ctaLabel: 'Fasting Commandments & Rules',
      details: [
        { label: 'MONTH', value: 'Ramadan' },
        { label: 'WINDOW', value: 'Dawn to Sunset' },
        { label: 'PURPOSE', value: 'Attaining Salvation' },
        { label: 'EXEMPTIONS', value: 'Illness & Travel' },
      ],
      quickLinks: [
        { label: 'Astronomical Dawn (Fajr)', href: '/practices#dawn' },
        { label: 'Exemptions & Substitution Days', href: '/practices#exemptions' },
        { label: 'Night of Destiny (Qadr)', href: '/practices#qadr' },
      ],
    },
    {
      id: 'hajj',
      num: 'IV',
      tabLabel: 'The Pilgrimage',
      sublabel: 'Hajj',
      kicker: 'COMMEMORATING ABRAHAM · 4 SACRED MONTHS',
      title: 'The Pilgrimage',
      titleAlt: '· Hajj',
      desc: t('hajjDesc'),
      meta: 'Observed once in a lifetime during the four Sacred Months: Zul-Hijjah, Muharram, Safar, and Rabi\' I',
      symbol: <HajjSymbol className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 text-primary" />,
      glowColor: 'rgba(244, 114, 182, 0.22)',
      href: '/practices',
      ctaLabel: 'Pilgrimage Guidelines',
      details: [
        { label: 'WINDOW', value: '4 Sacred Months' },
        { label: 'ORIGIN', value: 'Abraham' },
        { label: 'FREQUENCY', value: 'Once in Life' },
        { label: 'SCRIPTURE', value: 'Sura 22:27' },
      ],
      quickLinks: [
        { label: 'The 4 Sacred Months', href: '/practices#months' },
        { label: 'Pilgrimage Rites', href: '/practices#rites' },
        { label: 'Prohibitions during Hajj', href: '/practices#rules' },
      ],
    },
  ]

  const current = PRACTICES[activeTab]

  return (
    <section
      className="relative overflow-hidden border-b border-border/40"
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        padding: 'clamp(64px, 8vw, 100px) 0',
      }}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div
        className="relative px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1280, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ─── Minimalist Segmented Practice Selector ─── */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 mb-8 sm:mb-10 gap-2 sm:gap-3 select-none">
          {PRACTICES.map((p, idx) => {
            const isSelected = activeTab === idx
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-card text-foreground border-primary/50 shadow-lg scale-[1.02]'
                    : 'bg-card/40 text-muted-foreground border-border/40 hover:bg-card/70 hover:text-foreground'
                }`}
              >
                <span
                  style={{ fontFamily: F.display }}
                  className={`text-sm italic ${
                    isSelected ? 'text-primary font-bold' : 'text-muted-foreground/60'
                  }`}
                >
                  {p.num}
                </span>
                <span className="text-xs font-semibold tracking-wide">
                  {p.tabLabel}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70 hidden sm:inline">
                  ({p.sublabel})
                </span>
              </button>
            )
          })}
        </div>

        {/* ─── Unified Focus Exhibition Stage ─── */}
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/90 via-card/70 to-muted/20 backdrop-blur-md transition-all duration-500 hover:border-primary/40 hover:shadow-2xl">
          
          {/* Radial Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-40 blur-3xl transition-opacity duration-700 group-hover:opacity-75"
            style={{
              background: `radial-gradient(circle, ${current.glowColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative p-6 sm:p-10 lg:p-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Editorial Content */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-7">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                    <span className="font-mono text-[10px] tracking-widest text-primary font-bold uppercase">
                      PILLAR {current.num} · {current.kicker}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider uppercase">
                      PRACTICES
                    </span>
                  </div>

                  <div>
                    <Link href={current.href} className="group/title block">
                      <h3
                        style={{
                          fontFamily: F.display,
                          fontSize: 'clamp(32px, 4.5vw, 44px)',
                          fontWeight: 500,
                          lineHeight: 1.05,
                          letterSpacing: '-0.025em',
                          color: 'var(--ed-fg)',
                        }}
                        className="transition-colors group-hover/title:text-primary"
                      >
                        {current.title}
                        <span
                          style={{ color: 'var(--ed-fg-muted)', fontStyle: 'italic', fontWeight: 400 }}
                        >
                          {' '}
                          {current.titleAlt}
                        </span>
                      </h3>
                    </Link>

                    <p
                      style={{
                        fontFamily: F.serif,
                        fontSize: '15.5px',
                        color: 'var(--ed-fg-muted)',
                        lineHeight: 1.7,
                      }}
                      className="mt-3.5 leading-relaxed max-w-xl"
                    >
                      {current.desc}
                    </p>

                    <div className="mt-3.5 font-mono text-xs text-primary/90 tracking-wide">
                      {current.meta}
                    </div>
                  </div>
                </div>

                {/* Details / Astronomical Schedule Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                  {current.details.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-2.5 rounded-2xl bg-muted/40 border border-border/40 text-center flex flex-col justify-center"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {d.label}
                      </span>
                      <span className="font-headline font-bold text-xs sm:text-sm text-foreground mt-0.5">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Topics & Primary Action */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 mr-1">
                      Topics:
                    </span>
                    {current.quickLinks.map((ql, qIdx) => (
                      <Link
                        key={qIdx}
                        href={ql.href}
                        className="px-3 py-1.5 rounded-xl border border-border/40 bg-muted/40 hover:bg-muted hover:border-primary/40 text-xs font-medium text-foreground transition-all"
                      >
                        {ql.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={current.href}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs tracking-wider uppercase shadow-md hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>{current.ctaLabel}</span>
                      <Arrow size={12} className="transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href={current.href}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      <span>All Practices</span>
                      <Arrow size={10} />
                    </Link>
                  </div>
                </div>

              </div>

              {/* Right Column: Serene Minimalist Symbol Stage */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center py-4 select-none">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[340px] lg:h-[340px] rounded-3xl border border-border/40 bg-muted/20 backdrop-blur-xs flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-105 p-4">
                  
                  {/* Subtle Ambient Halo */}
                  <div
                    className="absolute inset-4 rounded-full blur-3xl pointer-events-none opacity-50"
                    style={{ background: current.glowColor }}
                  />
                  
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    {current.symbol}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
