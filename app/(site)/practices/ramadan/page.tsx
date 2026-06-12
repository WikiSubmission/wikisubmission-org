import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { CalendarDays, Moon, Plane, Sunrise } from 'lucide-react'
import { buildPageMetadata } from '@/constants/metadata'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import { FadeUp } from '@/lib/motion'
import { OriginVersesSlideshow } from '../contact-prayers/origin-verses-slideshow'
import {
  FactGrid,
  PracticeHero,
  PracticeHeroPanel,
  ReadingSection,
  SectionLabel,
  VerseGrid,
} from '../_components/practice-page'

export const metadata: Metadata = buildPageMetadata({
  title: 'Ramadan & Fasting',
  description:
    'A Quran-based guide to Ramadan fasting: obligation, daily timing, exemptions, night permissions, and the full fasting passage in 2:183-187.',
  url: '/practices/ramadan',
})

const RAMADAN_VERSES = [
  {
    vk: '2:183',
    label: 'The obligation',
    tx: 'O you who believe, fasting is decreed for you, as it was decreed for those before you, that you may attain salvation.',
  },
  {
    vk: '2:184',
    label: 'Specific days',
    tx: 'Specific days (are designated for fasting); if one is ill or traveling, an equal number of other days may be substituted. Those who can fast, but with great difficulty, may substitute feeding one poor person for each day of breaking the fast. If one volunteers (more righteous works), it is better. But fasting is the best for you, if you only knew.',
  },
  {
    vk: '2:185',
    label: 'The month of Quran',
    tx: 'Ramadan is the month during which the Quran was revealed, providing guidance for the people, clear teachings, and the statute book. Those of you who witness this month shall fast therein. Those who are ill or traveling may substitute the same number of other days. GOD wishes for you convenience, not hardship, that you may fulfill your obligations, and to glorify GOD for guiding you, and to express your appreciation.',
  },
  {
    vk: '2:186',
    label: 'God is near',
    tx: 'When My servants ask you about Me, I am always near. I answer their prayers when they pray to Me. The people shall respond to Me and believe in Me, in order to be guided.',
  },
  {
    vk: '2:187',
    label: 'The daily window',
    tx: "Permitted for you is sexual intercourse with your wives during the nights of fasting. You may eat and drink until the white thread of light becomes distinguishable from the dark thread of night at dawn. Then, you shall fast until sunset. Sexual intercourse is prohibited if you decide to retreat to the masjid. These are GOD's laws; you shall not transgress them.",
  },
]

const fastingRules = [
  {
    icon: Sunrise,
    title: 'Dawn to sunset',
    body: 'The daily fast begins when the white thread of dawn is distinguishable and ends at sunset.',
    refs: ['2:187'],
  },
  {
    icon: Moon,
    title: 'Nights are permitted',
    body: 'Eating, drinking, and marital relations are permitted during the nights of Ramadan.',
    refs: ['2:187'],
  },
  {
    icon: Plane,
    title: 'Substitute days',
    body: 'Illness and travel allow the same number of days to be substituted later.',
    refs: ['2:184', '2:185'],
  },
]

export default function RamadanPage() {
  const t = useTranslations('practiceComponents')
  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)] overflow-x-clip">
      <PracticeHero
        active="ramadan"
        eyebrow="The month of fasting"
        title="Ramadan"
        description="A practical guide to the obligatory fast: when it begins, when it ends, who is exempt, and how God defines it in the Quran."
      >
        <PracticeHeroPanel
          icon={CalendarDays}
          kicker="Full details"
          value="2:183-187"
          meta="One continuous Quranic passage defines the fast."
          items={[
            'Fast during the month of Ramadan.',
            'Fast from dawn until sunset.',
            'Eat, drink, and marital relations are permitted at night.',
            'Illness, travel, and great difficulty have Quranic substitutions.',
          ]}
        />
      </PracticeHero>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24 lg:py-28">
        <div className="space-y-20 md:space-y-28">
          {/* ── Origin and Obligation ──────────────────────────────── */}
          <ReadingSection
            label="Origin and obligation"
            title="Fasting belongs to the religion of Abraham"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                The Quran presents Submission as the religion of Abraham, and
                Muhammad is commanded to follow Abraham&apos;s way. The core
                religious practices, including the Contact Prayers, Zakat, fasting,
                and Hajj, are preserved through Abraham rather than introduced
                later.
              </p>
              <p>
                The Quran confirms this regarding fasting. It connects believers to
                those who came before them.
              </p>
            </div>

            <div className="relative border-l-[3px] border-[var(--ed-accent)] bg-[var(--ed-surface)]/30 p-6 sm:p-8 md:p-10">
              <p
                className="text-lg sm:text-xl md:text-2xl font-medium leading-[1.5] text-[var(--ed-fg)] italic"
                style={{ fontFamily: F.serif }}
              >
                &ldquo;O you who believe, fasting is decreed for you, as it was
                decreed for those before you, that you may attain salvation.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--ed-accent)]" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
                  style={{ fontFamily: F.glacial }}
                >
                  2:183
                </span>
              </div>
            </div>

            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              Ramadan commemorates the revelation of the Quran and reinforces the
              monotheistic legacy of Abraham. The believers fast during this month
              to observe what God decreed and to grow in restraint, gratitude, and
              obedience.
            </p>

            <OriginVersesSlideshow
              refs={['2:135', '3:95', '4:125', '6:161', '16:123', '21:73']}
            />
          </ReadingSection>

          {/* ── The Fasting Rules ──────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-4">
              <SectionLabel>The fasting rules</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
                style={{ fontFamily: F.serif }}
              >
                God provides complete details for the fast
              </h2>
            </div>
            <FactGrid items={fastingRules} />
          </FadeUp>

          {/* ── Daily Window ───────────────────────────────────────── */}
          <ReadingSection
            label="Daily window"
            title="The fasting day is dawn to sunset"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                The Quran gives the precise timing for each fasting day. A fasting
                day begins at dawn and ends at sunset. God provides a visible sign
                for the start of the fast: the white thread of dawn.
              </p>
            </div>

            <div className="relative border-l-[3px] border-[var(--ed-accent)] bg-[var(--ed-surface)]/30 p-6 sm:p-8 md:p-10">
              <p
                className="text-lg sm:text-xl md:text-2xl font-medium leading-[1.5] text-[var(--ed-fg)] italic"
                style={{ fontFamily: F.serif }}
              >
                &ldquo;You may eat and drink until the white thread of light
                becomes distinguishable from the dark thread of night at dawn.
                Then, you shall fast until sunset.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--ed-accent)]" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
                  style={{ fontFamily: F.glacial }}
                >
                  2:187
                </span>
              </div>
            </div>

            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              From dawn until sunset, the believer abstains from food, drink, and
              intimate relations, dedicating the day to restraint and remembrance.
            </p>
          </ReadingSection>

          {/* ── Exemptions ───────────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-4">
              <SectionLabel>Exemptions</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
                style={{ fontFamily: F.serif }}
              >
                God wishes convenience, not hardship
              </h2>
              <p
                className="text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                The purpose of fasting is spiritual growth, not physical
                suffering. The Quran gives merciful substitutions for those who
                cannot fast.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="relative border border-[var(--ed-rule)] bg-[var(--ed-accent-soft)]/30 p-6 sm:p-8 md:p-10">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ed-accent)]" />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] mb-6 sm:mb-8"
                  style={{ fontFamily: F.glacial }}
                >
                  The principle
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-medium leading-[1.4] text-[var(--ed-fg)]"
                  style={{ fontFamily: F.serif }}
                >
                  &ldquo;GOD wishes for you convenience, not hardship, that you
                  may fulfill your obligations.&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-[var(--ed-accent)]" />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    2:185
                  </span>
                </div>
              </div>

              <div className="flex flex-col border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-6 sm:p-8 md:p-10">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] mb-6 sm:mb-8"
                  style={{ fontFamily: F.glacial }}
                >
                  Substitutions
                </p>
                <div className="flex-1 space-y-5 sm:space-y-6">
                  {[
                    {
                      text: 'Illness or travel: substitute the same number of days later.',
                      ref: '2:184',
                    },
                    {
                      text: 'Great difficulty: feed one poor person for each day of breaking the fast.',
                      ref: '2:184',
                    },
                    {
                      text: 'Voluntary good beyond the required substitution is better.',
                      ref: '2:184',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4">
                      <span
                        className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center border border-[var(--ed-rule)] text-[10px] font-bold text-[var(--ed-accent)]"
                        style={{ fontFamily: F.glacial }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="pt-1 space-y-1">
                        <p className="text-sm sm:text-base leading-[1.6] text-[var(--ed-fg-muted)]">
                          {item.text}
                        </p>
                        <QuranRef reference={item.ref} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── Night Permissions ──────────────────────────────────── */}
          <ReadingSection
            label="Night permissions"
            title="The nights of Ramadan are permitted"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                God&apos;s laws are clear and designed for human nature. The Quran
                permits eating, drinking, and marital relations during the nights
                of Ramadan.
              </p>
            </div>

            <div className="relative border-l-[3px] border-[var(--ed-accent)] bg-[var(--ed-surface)]/30 p-6 sm:p-8 md:p-10">
              <p
                className="text-lg sm:text-xl md:text-2xl font-medium leading-[1.5] text-[var(--ed-fg)] italic"
                style={{ fontFamily: F.serif }}
              >
                &ldquo;Permitted for you is sexual intercourse with your wives
                during the nights of fasting.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[var(--ed-accent)]" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
                  style={{ fontFamily: F.glacial }}
                >
                  2:187
                </span>
              </div>
            </div>

            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              By returning to these permitted bounties after sunset, the believer
              acknowledges that God alone sets the limits.
            </p>
          </ReadingSection>
        </div>
      </section>

      <VerseGrid
        label="Scriptural reference"
        title="Ramadan in the Quran"
        description="The Quran gives the fasting rules in one continuous passage: the obligation, the month, the timing, the exemptions, the night permissions, and the limits."
        verses={RAMADAN_VERSES}
      />

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 pb-16 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 pt-12 border-t border-[var(--ed-rule)]">
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/practices"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              &larr; {t("previous")}
            </Link>
            <Link
              href="/practices/contact-prayers"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("contactPrayersNav")}
            </Link>
            <Link
              href="/practices/zakat"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("zakatNav")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/practices/hajj"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("hajjNav")} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
