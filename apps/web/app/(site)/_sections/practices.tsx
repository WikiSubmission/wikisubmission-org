'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

function PracticeVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px]">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        className="w-full h-full object-contain filter drop-shadow-xl select-none"
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
      tabLabel: 'Contact Prayers',
      sublabel: 'Salah',
      kicker: 'FIVE DAILY ASTRONOMICAL CONTACTS',
      title: 'The Contact Prayers',
      titleAlt: '· Salah',
      desc: t('prayerDesc'),
      meta: 'Prescribed at precise solar times (4:103) · Continuous remembrance of God',
      imageSrc: '/prostrating-figure.png',
      imageAlt: 'Contact Prayer - Prostrating Figure',
      glowColor: 'rgba(212, 163, 115, 0.2)',
      href: '/practices',
      ctaLabel: 'Explore Salah Guidelines',
      schedule: [
        { label: 'FAJR', value: 'Dawn' },
        { label: 'DHUHR', value: 'Noon' },
        { label: 'ASR', value: 'Afternoon' },
        { label: 'MAGHRIB', value: 'Sunset' },
        { label: 'ISHA', value: 'Night' },
      ],
      topics: [
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
      imageSrc: '/zakat-symbol.png',
      imageAlt: 'Obligatory Charity - Zakat Symbol',
      glowColor: 'rgba(52, 211, 153, 0.18)',
      href: '/practices',
      ctaLabel: 'Calculate & Understand Zakat',
      schedule: [
        { label: 'RATE', value: '2.5%' },
        { label: 'TIMING', value: 'On Receipt' },
        { label: 'THRESHOLD', value: 'No Minimum' },
        { label: 'SCRIPTURE', value: 'Sura 6:141' },
      ],
      topics: [
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
      imageSrc: '/ramadan.png',
      imageAlt: 'Ramadan Fasting - Crescent Moon',
      glowColor: 'rgba(96, 165, 250, 0.18)',
      href: '/practices',
      ctaLabel: 'Fasting Commandments & Rules',
      schedule: [
        { label: 'MONTH', value: 'Ramadan' },
        { label: 'WINDOW', value: 'Dawn to Sunset' },
        { label: 'PURPOSE', value: 'Salvation' },
        { label: 'EXEMPTIONS', value: 'Illness & Travel' },
      ],
      topics: [
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
      imageSrc: '/Kaba.png',
      imageAlt: 'The Hajj Pilgrimage - Sanctuary',
      glowColor: 'rgba(244, 114, 182, 0.18)',
      href: '/practices',
      ctaLabel: 'Pilgrimage Guidelines',
      schedule: [
        { label: 'WINDOW', value: '4 Sacred Months' },
        { label: 'ORIGIN', value: 'Abraham' },
        { label: 'FREQUENCY', value: 'Once in Life' },
        { label: 'SCRIPTURE', value: 'Sura 22:27' },
      ],
      topics: [
        { label: 'The 4 Sacred Months', href: '/practices#months' },
        { label: 'Pilgrimage Rites', href: '/practices#rites' },
        { label: 'Prohibitions during Hajj', href: '/practices#rules' },
      ],
    },
  ]

  const current = PRACTICES[activeTab]

  return (
    <section
      id="practices"
      className="relative overflow-hidden border-b border-[var(--ed-rule)]"
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

        {/* ── Refined Horizontal Practice Navigation ── */}
        <div
          role="tablist"
          aria-label={t('dividerTitle')}
          className="flex items-center gap-1 sm:gap-2 pb-6 mb-8 border-b border-[var(--ed-rule)] overflow-x-auto no-scrollbar"
        >
          {PRACTICES.map((p, idx) => {
            const isSelected = activeTab === idx
            return (
              <button
                key={p.id}
                role="tab"
                id={`practice-tab-${p.id}`}
                aria-selected={isSelected}
                aria-controls={`practice-panel-${p.id}`}
                onClick={() => setActiveTab(idx)}
                type="button"
                className="relative group px-3.5 sm:px-4 py-2 text-left cursor-pointer transition-colors shrink-0"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    style={{ fontFamily: F.mono }}
                    className={`text-[10px] font-semibold tracking-wider transition-colors ${
                      isSelected ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-fg-muted)] opacity-60'
                    }`}
                  >
                    {p.num}.
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className={`text-xs font-semibold tracking-[0.14em] uppercase transition-colors ${
                      isSelected
                        ? 'text-[var(--ed-fg)]'
                        : 'text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-fg)]'
                    }`}
                  >
                    {p.tabLabel}
                  </span>
                  <span
                    style={{ fontFamily: F.serif }}
                    className="text-xs italic text-[var(--ed-fg-muted)] opacity-60 hidden md:inline"
                  >
                    ({p.sublabel})
                  </span>
                </div>

                {/* Active Indicator Rule */}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[2px] transition-all duration-300 ${
                    isSelected
                      ? 'bg-[var(--ed-accent)] opacity-100 scale-x-100'
                      : 'bg-transparent opacity-0 scale-x-50 group-hover:opacity-40 group-hover:bg-[var(--ed-rule)]'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* ── Practice Exhibition Stage (NO rounded-3xl container) ── */}
        <div
          id={`practice-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`practice-tab-${current.id}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* Left Column: Practice Rationale, Schedule & Action */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]"
                  aria-hidden
                />
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--ed-accent)]"
                >
                  PILLAR {current.num} · {current.kicker}
                </span>
              </div>

              <Link href={current.href} className="group/title block no-underline">
                <h3
                  style={{
                    fontFamily: F.display,
                    fontSize: 'clamp(32px, 4.2vw, 46px)',
                    fontWeight: 500,
                    lineHeight: 1.1,
                    letterSpacing: '-0.025em',
                    color: 'var(--ed-fg)',
                  }}
                  className="m-0 transition-colors group-hover/title:text-[var(--ed-accent)]"
                >
                  {current.title}
                  <span
                    style={{ color: 'var(--ed-fg-muted)', fontWeight: 400 }}
                    className="ml-2.5 font-normal italic"
                  >
                    {current.titleAlt}
                  </span>
                </h3>
              </Link>

              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: '16px',
                  lineHeight: 1.72,
                  color: 'var(--ed-fg-muted)',
                  maxWidth: '54ch',
                }}
                className="mt-4 mb-2"
              >
                {current.desc}
              </p>

              <div
                style={{ fontFamily: F.mono }}
                className="text-xs text-[var(--ed-accent)] tracking-wide font-medium"
              >
                {current.meta}
              </div>
            </div>

            {/* Structured Schedule / Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-3 border-t border-[var(--ed-rule)]">
              {current.schedule.map((item, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 border border-[var(--ed-rule)] bg-[var(--ed-surface)]"
                  style={{ borderRadius: 0 }}
                >
                  <span
                    style={{ fontFamily: F.mono }}
                    className="text-[9px] uppercase tracking-wider text-[var(--ed-fg-muted)] block"
                  >
                    {item.label}
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-xs sm:text-[13px] font-bold text-[var(--ed-fg)] mt-1 block"
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Topics & Primary Action */}
            <div className="space-y-4 pt-4 border-t border-[var(--ed-rule)]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  style={{ fontFamily: F.mono }}
                  className="text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)] mr-1.5"
                >
                  Index:
                </span>
                {current.topics.map((topic, tIdx) => (
                  <Link
                    key={tIdx}
                    href={topic.href}
                    className="px-2.5 py-1 text-xs text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 hover:border-[var(--ed-accent)] transition-all rounded-[2px]"
                    style={{ fontFamily: F.serif }}
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={current.href}
                  className="ed-btn-primary group"
                  style={{
                    fontFamily: F.serif,
                    padding: '11px 22px',
                    fontSize: '14px',
                  }}
                >
                  <span>{current.ctaLabel}</span>
                  <Arrow size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/practices"
                  style={{ fontFamily: F.mono }}
                  className="text-xs text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>All Practices</span>
                  <Arrow size={10} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Heroic Visual Object Stage */}
          <div className="lg:col-span-5 flex items-center justify-center select-none py-6">
            <div className="relative flex items-center justify-center p-6 sm:p-8">
              {/* Subtle Halo */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity duration-700"
                style={{ background: current.glowColor }}
              />

              <div className="relative z-10">
                <PracticeVisual src={current.imageSrc} alt={current.imageAlt} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
