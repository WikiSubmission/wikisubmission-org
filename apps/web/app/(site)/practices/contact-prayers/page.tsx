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
    <div className="grid gap-5 border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-5 transition-colors hover:border-[var(--ed-accent)] hover:bg-[var(--ed-surface)] sm:p-7 md:grid-cols-[74px_1fr_auto] md:items-center">
      <div
        className="text-4xl font-medium tabular-nums text-[var(--ed-accent)]"
        style={{ fontFamily: F.display }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="space-y-2">
        <h3
          className="text-2xl font-medium text-[var(--ed-fg)] md:text-3xl"
          style={{ fontFamily: F.display }}
        >
          {prayer.name}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="text-xl text-[var(--ed-accent)]"
            style={{ fontFamily: F.arabic }}
          >
            {prayer.arabic}
          </span>
          <span className="h-1 w-1 bg-[var(--ed-rule)]" />
          <span
            className="text-[15px] italic text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.serif }}
          >
            {prayer.time}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-[var(--ed-rule)] pt-5 md:border-t-0 md:pt-0">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            Units
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-xl leading-none text-[var(--ed-fg)]">
            {prayer.units}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            Quran
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

      <section className="mx-auto max-w-6xl space-y-16 px-5 py-14 sm:px-6 md:space-y-20 md:py-20 lg:py-24">
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

          <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3 border-b border-[var(--ed-rule)] pb-4">
              <AlertTriangle className="text-[var(--ed-accent)]" size={22} />
              <h3 className="text-xl font-medium text-[var(--ed-fg)]">
                Keep the prayer for God alone
              </h3>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-[var(--ed-fg-muted)]">
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

        <section className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-4">
            <SectionLabel>Specified times</SectionLabel>
            <h2
              className="text-balance text-3xl font-medium tracking-tight md:text-4xl"
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

        <section className="space-y-12">
          <div className="space-y-8">
            <h2
              className="text-center text-balance text-4xl font-medium tracking-tight md:text-5xl underline underline-offset-8 decoration-[var(--ed-accent)]"
              style={{ fontFamily: F.display }}
            >
              The Pre-Prayer Rituals
            </h2>
            <div className="border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-4 md:p-8">
              <AblutionSlideshow />
            </div>
            <div className="border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-4 md:p-8">
              <AzaanCard />
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="space-y-8">
            <h2
              className="text-center text-balance text-4xl font-medium tracking-tight md:text-5xl underline underline-offset-8 decoration-[var(--ed-accent)]"
              style={{ fontFamily: F.display }}
            >
              The Contact Prayer (Salat)
            </h2>
            <div className="border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-4 md:p-8">
              <PrayerDemos />
            </div>
          </div>
          <div className="py-2 md:py-6">
            <FatihaAudio />
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 pt-12 border-t border-[var(--ed-rule)]">
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/practices"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              &larr; {t("practicesHub")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/practices/zakat"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("zakatNav")}
            </Link>
            <Link
              href="/practices/ramadan"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("ramadanNav")}
            </Link>
            <Link
              href="/practices/hajj"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("hajjNav")} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
