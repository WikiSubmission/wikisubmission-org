import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  AlertTriangle,
} from 'lucide-react'
import { buildPageMetadata } from '@/constants/metadata'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import {
  AblutionSlideshow,
  AzaanCard,
  FatihaAudio,
  MiniPrayerTimes,
  PrayerDemos,
} from './contact-prayers-islands'
import {
  ReadingSection,
  RefList,
  SectionLabel,
  PracticeHero,
  QuoteCallout,
} from '../_components/practice-page'

export const metadata: Metadata = buildPageMetadata({
  title: 'The Contact Prayers (Salat)',
  description:
    'A step-by-step guide to the Contact Prayers: origin, Quranic times, azaan, preparation, units, movements, and recitations.',
  url: '/practices/contact-prayers',
})

const prayerTimes = [
  {
    name: 'Dawn',
    arabic: 'Fajr',
    time: 'Before sunrise',
    units: '2',
    refs: ['24:58'],
  },
  {
    name: 'Noon',
    arabic: 'Zuhr',
    time: 'When the sun declines',
    units: '4',
    refs: ['17:78'],
  },
  {
    name: 'Afternoon',
    arabic: 'Asr',
    time: 'Midway between noon and sunset',
    units: '4',
    refs: ['2:238'],
  },
  {
    name: 'Sunset',
    arabic: 'Maghrib',
    time: 'Immediately after sunset',
    units: '3',
    refs: ['11:114'],
  },
  {
    name: 'Night',
    arabic: 'Isha',
    time: 'After twilight',
    units: '4',
    refs: ['11:114', '24:58'],
  },
]

function PrayerTimeRow({
  prayer,
  index,
}: {
  prayer: (typeof prayerTimes)[number]
  index: number
}) {
  return (
    <div
      className="grid gap-5 rounded-2xl border p-6 sm:p-7 transition-all duration-300 hover:border-[var(--ed-accent)] md:grid-cols-[72px_1fr_auto] md:items-center shadow-sm"
      style={{
        borderColor: 'var(--ed-rule)',
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      <div
        className="text-3xl sm:text-4xl font-mono font-bold text-[var(--ed-accent)]"
        style={{ fontFamily: F.mono }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h3
            className="text-2xl font-medium text-[var(--ed-fg)]"
            style={{ fontFamily: F.display }}
          >
            {prayer.name}
          </h3>
          <span
            dir="rtl"
            className="text-xl text-[var(--ed-accent)] opacity-80"
            style={{ fontFamily: 'var(--font-amiri), "Amiri", serif' }}
          >
            {prayer.arabic}
          </span>
        </div>
        <p
          className="text-sm italic text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          {prayer.time}
        </p>
      </div>
      <div className="flex flex-wrap gap-5 border-t md:border-t-0 pt-4 md:pt-0" style={{ borderColor: 'var(--ed-rule)' }}>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            Units:
          </span>
          <span
            className="px-2.5 py-0.5 rounded-lg border font-mono text-xs font-bold text-[var(--ed-fg)] bg-[var(--ed-bg)]"
            style={{ borderColor: 'var(--ed-rule)', fontFamily: F.mono }}
          >
            {prayer.units} Rakat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            Quran:
          </span>
          <RefList refs={prayer.refs} />
        </div>
      </div>
    </div>
  )
}

export default function ContactPrayersPage() {
  const t = useTranslations('practiceComponents')
  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)]">
      <PracticeHero
        active="contact-prayers"
        eyebrow="Prayer guide"
        title="The Contact Prayers (Salat)"
        description="A practical guide to the five daily contacts with God: where they come from, when they are observed, how to prepare, and how to perform each unit."
      >
        <MiniPrayerTimes />
      </PracticeHero>

      <section className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6 md:px-10 py-16 sm:py-24">
        <ReadingSection
          label="Origin"
          title="The original source of the Contact Prayers"
        >
          <p>
            The Quran presents Submission as the religion of Abraham, and
            Muhammad is commanded to follow Abraham&apos;s way. The core
            religious practices, including Salat, Zakat, fasting, and Hajj, are
            preserved from Abraham rather than introduced later.
          </p>
          <p>
            The Contact Prayers and obligatory charity are connected to
            Abraham&apos;s legacy. The Quran also shows prayer positions such as
            standing, bowing, and prostrating.
          </p>

          <QuoteCallout reference="14:40">
            Our Lord, make me one who consistently observes the Contact Prayers
            (Salat), and also my children. Our Lord, please answer my prayers.
          </QuoteCallout>

          <p>
            The religious duties instituted by God nourish the soul. Belief in
            God does not by itself guarantee redemption; the soul must grow
            through worship, righteousness, and obedience (
            <QuranRef reference="6:158" />, <QuranRef reference="10:90-92" />
            ).
          </p>
          <p>
            Each contact prayer is valid from the time it becomes due until the
            next prayer becomes due. Once missed, a prayer is a missed
            opportunity. One can repent and ask forgiveness, but the lost
            appointment cannot be recreated.
          </p>

          <div
            className="rounded-2xl border p-6 sm:p-8 space-y-4 shadow-sm"
            style={{
              borderColor: 'var(--ed-rule)',
              borderLeftWidth: 4,
              borderLeftColor: 'var(--ed-accent)',
              backgroundColor: 'var(--ed-surface)',
            }}
          >
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--ed-rule)' }}>
              <AlertTriangle className="shrink-0 text-[var(--ed-accent)]" size={20} strokeWidth={1.7} />
              <h3
                className="text-xl font-medium text-[var(--ed-fg)]"
                style={{ fontFamily: F.display }}
              >
                Keep the prayer for God alone
              </h3>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
              <p>
                The proof that Salat was already established through Abraham is
                found in <RefList refs={['8:35', '9:54', '16:123', '21:73']} />.
                The Quran commands that contact prayers be devoted to God alone.
              </p>
              <p>
                Commemorating Muhammad, Abraham, or their families during the
                prayer redirects a rite that belongs to God (
                <QuranRef reference="20:14" />, <QuranRef reference="39:3" />,{' '}
                <QuranRef reference="39:45" />
                ).
              </p>
            </div>
          </div>
        </ReadingSection>

        <section className="space-y-8">
          <div className="space-y-3">
            <SectionLabel>Specified times</SectionLabel>
            <h2
              className="text-balance text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
              style={{ fontFamily: F.display }}
            >
              The five times are specified in the Quran
            </h2>
          </div>
          <div className="grid gap-4">
            {prayerTimes.map((prayer, index) => (
              <PrayerTimeRow key={prayer.name} prayer={prayer} index={index} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3">
            <SectionLabel>Preparation</SectionLabel>
            <h2
              className="text-balance text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
              style={{ fontFamily: F.display }}
            >
              The Pre-Prayer Rituals
            </h2>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border overflow-hidden p-6 sm:p-8 shadow-sm" style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}>
              <AblutionSlideshow />
            </div>
            <div className="rounded-2xl border overflow-hidden p-6 sm:p-8 shadow-sm" style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}>
              <AzaanCard />
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3">
            <SectionLabel>Performance</SectionLabel>
            <h2
              className="text-balance text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
              style={{ fontFamily: F.display }}
            >
              The Contact Prayer (Salat)
            </h2>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border overflow-hidden p-6 sm:p-8 shadow-sm" style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}>
              <PrayerDemos />
            </div>
            <div className="rounded-2xl border overflow-hidden p-6 sm:p-8 shadow-sm" style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}>
              <FatihaAudio />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-12 border-t" style={{ borderColor: 'var(--ed-rule)' }}>
          <Link
            href="/practices"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] w-full sm:w-auto justify-center"
            style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
          >
            &larr; {t("practicesHub")}
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/practices/zakat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
              style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
            >
              {t("zakatNav")}
            </Link>
            <Link
              href="/practices/ramadan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
              style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
            >
              {t("ramadanNav")}
            </Link>
            <Link
              href="/practices/hajj"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
              style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
            >
              {t("hajjNav")} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
