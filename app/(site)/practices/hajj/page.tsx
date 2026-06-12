import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { buildPageMetadata } from '@/constants/metadata'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import { FadeUp } from '@/lib/motion'
import {
  PracticeHero,
  PracticeHeroPanel,
  QuoteCallout,
  ReadingSection,
  RefList,
  SectionLabel,
  VerseGrid,
} from '../_components/practice-page'

export const metadata: Metadata = buildPageMetadata({
  title: 'Hajj',
  description:
    'A Quran-based overview of Hajj: obligation, timing, sacred months, rites, conduct, and purpose.',
  url: '/practices/hajj',
})

const HAJJ_VERSES = [
  {
    vk: '3:97',
    tx: 'In it are clear signs: the station of Abraham. Anyone who enters it shall be granted safe passage. The people owe it to GOD that they shall observe Hajj to this shrine, when they can afford it. As for those who disbelieve, GOD does not need anyone.',
  },
  {
    vk: '2:196',
    tx: 'You shall observe the complete rites of Hajj and `Umrah for GOD. If you are prevented, you shall send an offering, and do not resume cutting your hair until your offering has reached its destination...',
  },
  {
    vk: '2:197',
    tx: 'Hajj shall be observed in the specified months. Whoever sets out to observe Hajj shall refrain from sexual intercourse, misconduct, and arguments throughout Hajj.',
  },
  {
    vk: '2:158',
    tx: 'The knolls of Safa and Marwah are among the rites decreed by GOD. Anyone who observes Hajj or `Umrah commits no error by traversing the distance between them.',
  },
  {
    vk: '2:198',
    tx: 'When you file from `Arafat, you shall commemorate GOD at the Sacred Location. You shall commemorate Him for guiding you; before this, you had gone astray.',
  },
  {
    vk: '22:27',
    tx: 'And proclaim that the people shall observe Hajj pilgrimage. They will come to you walking or riding on various exhausted means of transportation. They will come from the farthest locations.',
  },
]

const steps = [
  {
    title: 'Sanctity (Ihraam)',
    body: <p>The pilgrimage begins with a bath or shower, followed by a state of sanctity called &quot;Ihraam,&quot; where the male pilgrim wears seamless sheets of material, and the woman wears a modest dress.</p>,
    refs: ['2:196'],
  },
  {
    title: 'Conduct & Hygiene',
    body: <p>Throughout Hajj, the pilgrim abstains from sexual intercourse, vanities such as shaving and cutting the hair, arguments, misconduct, and bad language. Cleanliness, bathing, and regular hygiene practices are encouraged.</p>,
    refs: ['2:197'],
  },
  {
    title: 'Circling the Ka`bah',
    body: (
      <div className="space-y-3">
        <p>Upon arrival at the Sacred Mosque in Mecca, the pilgrim walks around the Ka`bah seven times, while glorifying and praising God. The common formula is:</p>
        <ul className="space-y-2 pl-4">
          <li><strong>A.</strong> &quot;Labbayka Allaahumma Labbayk&quot; (My God, I have responded to You).</li>
          <li><strong>B.</strong> &quot;Labbayka Laa Shareeka Laka Labbayk&quot; (I have responded to You, and I proclaim that there is no other god besides You; I have responded to You).</li>
        </ul>
      </div>
    ),
    refs: ['2:125', '22:26-29'],
  },
  {
    title: 'Safa and Marwah',
    body: <p>The next step is to walk the half-mile distance between the knolls of Safa and Marwah seven times, with occasional trotting.</p>,
    refs: ['2:158'],
  },
  {
    title: '`Arafat',
    body: <p>The pilgrim then goes to `Arafat to spend a day of worship, meditation, and glorification of God, from dawn to sunset.</p>,
    refs: ['2:198'],
  },
  {
    title: 'Muzdalifah',
    body: (
      <div className="space-y-3">
        <p>After sunset, the pilgrim goes to Muzdalifah where the Night Prayer is observed, and 21 pebbles are picked up for the symbolic stoning of Satan at Mina. From Muzdalifah, the pilgrim goes to Mina to spend two or three days:</p>
        <ul className="space-y-2 pl-4">
          <li><strong>A.</strong> On the first morning at Mina, the pilgrim offers an animal sacrifice to feed the poor and to commemorate God&apos;s intervention to save Ismail and Abraham from Satan&apos;s trick.</li>
          <li><strong>B.</strong> The stoning ceremonies symbolize rejection of Satan&apos;s polytheism and are done by throwing seven pebbles at each of three stations, while glorifying God.</li>
        </ul>
      </div>
    ),
    refs: ['2:203', '37:107', '15:34'],
  },
  {
    title: 'Farewell',
    body: <p>The pilgrim then returns to Mecca and observes a farewell circumvolution of the Ka`bah seven times.</p>,
    refs: [],
  },
]

export default function HajjPage() {
  const t = useTranslations('practiceComponents')
  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)] overflow-x-clip">
      <PracticeHero
        active="hajj"
        eyebrow="The pilgrimage"
        title="Hajj"
        description="A practical overview of the pilgrimage: the obligation, the sacred months, the state of Ihraam, and the rites centered on the Sacred Mosque."
      >
        <PracticeHeroPanel
          icon={MapPin}
          kicker="Requirement"
          value="Once in a lifetime"
          meta="For those with the means to make the journey."
          items={[
            'Hajj is owed to God by those who can afford it.',
            "The pilgrimage commemorates Abraham's submission to God.",
          ]}
        />
      </PracticeHero>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24 lg:py-28">
        <div className="space-y-20 md:space-y-28">
          {/* ── Origin and Obligation ──────────────────────────────── */}
          <ReadingSection
            label="Origin and obligation"
            title="An established practice from Abraham"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                Hajj is the pilgrimage to the Sacred Mosque, owed to God by those
                who are able to make the journey. Its rites are not later
                inventions, nor are they symbolic ceremonies created after the
                Quran.
              </p>
              <p>
                The Quran points back to the origin of these rites, describing
                Abraham and his son raising the foundations of the House and praying
                that God accept their work, make them submitters, and show them the
                rites of worship.
              </p>
            </div>

            <QuoteCallout reference="3:97">
              The people owe it to GOD that they shall observe Hajj to this
              shrine, when they can afford it.
            </QuoteCallout>

            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              Hajj commemorates Abraham&apos;s complete submission to God:
              entering sanctity, circling the Kaaba, moving through the sacred
              stations, remembering God, and offering sacrifice for the benefit of
              the poor.
            </p>
          </ReadingSection>

          {/* ── Obligation & Timing ────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-4">
              <SectionLabel>Obligation & Timing</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
                style={{ fontFamily: F.serif }}
              >
                A duty owed to God, observed during the specified months
              </h2>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-5">
                <div className="space-y-4">
                  <p
                    className="text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    Hajj is a required pilgrimage for those who have the means. It is
                    not tourism, heritage travel, or a cultural gathering. It is a
                    rite of Submission centered on God.
                  </p>
                  <p
                    className="text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    Hajj is observed during the specified months. The Quran speaks of appointed months, not only a narrow set of days.
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="relative border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ed-accent)]" />
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--ed-rule)] pb-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        size={18}
                        className="text-[var(--ed-accent)]"
                        strokeWidth={1.8}
                      />
                      <h3
                        className="font-medium text-[var(--ed-fg)]"
                        style={{ fontFamily: F.serif }}
                      >
                        The Sacred House
                      </h3>
                    </div>
                    <QuranRef reference="3:97" />
                  </div>
                  <p className="text-sm sm:text-base leading-[1.7] text-[var(--ed-fg-muted)]">
                    The obligation is tied to ability, means, and devotion to God
                    alone.
                  </p>
                </div>

                <div className="relative border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-8">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ed-accent)]" />
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--ed-rule)] pb-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={18}
                        className="text-[var(--ed-accent)]"
                        strokeWidth={1.8}
                      />
                      <h3
                        className="font-medium text-[var(--ed-fg)]"
                        style={{ fontFamily: F.serif }}
                      >
                        Specified Months
                      </h3>
                    </div>
                    <RefList refs={['2:197', '9:2', '9:36']} />
                  </div>
                  <p className="text-sm sm:text-base leading-[1.7] text-[var(--ed-fg-muted)]">
                    The sacred months are designated for pilgrimage and safe travel.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── Core Rites ─────────────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-5">
              <SectionLabel>Core rites</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
                style={{ fontFamily: F.serif }}
              >
                The Steps of Hajj
              </h2>
              <p
                className="text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                The rites of Hajj move the believer through sanctity,
                movement, sacrifice, gathering, and constant commemoration of God.
              </p>
            </div>

            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {steps.map((step, idx) => (
                <article
                  key={step.title}
                  className="group flex flex-col gap-5 sm:gap-6 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/20 p-5 sm:p-6 md:p-8 transition-all duration-300 hover:border-[var(--ed-accent)]/50"
                >
                  <span
                    className="text-4xl sm:text-5xl font-medium text-[var(--ed-accent)]/30 select-none sm:w-12 shrink-0 transition-colors duration-300 group-hover:text-[var(--ed-accent)]/40"
                    style={{ fontFamily: F.display }}
                  >
                    {idx + 1}
                  </span>
                  <div className="space-y-3 sm:space-y-4 flex-1">
                    <h3
                      className="text-xl sm:text-2xl font-medium"
                      style={{ fontFamily: F.serif }}
                    >
                      {step.title}
                    </h3>
                    <div className="text-sm sm:text-base leading-[1.7] text-[var(--ed-fg-muted)]">
                      {step.body}
                    </div>
                    {step.refs.length > 0 && (
                      <div className="pt-3 border-t border-[var(--ed-rule)]/50 mt-3 sm:mt-4">
                        <RefList refs={step.refs} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </FadeUp>

          {/* ── Warning ────────────────────────────────────────────── */}
          <ReadingSection
            label="Warning"
            title="Keep the pilgrimage centered on God alone"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                The Quran speaks of the Sacred Mosque and the rites dedicated to
                God. The pilgrimage should not be redirected toward tombs,
                personalities, or secondary sacred centers. Hajj is for God.
              </p>
              <p>
                The purpose of the journey is submission, commemoration, and
                purification, not the elevation of anyone besides God.
              </p>
            </div>
            <div className="pt-2">
              <RefList refs={['2:196', '72:18']} />
            </div>
          </ReadingSection>
        </div>
      </section>

      <VerseGrid
        label="Scriptural reference"
        title="Hajj in the Quran"
        description="The verses below outline the obligation, timing, conduct, rites, and God-centered purpose of the pilgrimage."
        verses={HAJJ_VERSES}
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
            <Link
              href="/practices/ramadan"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] hover:border-[var(--ed-accent)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("ramadanNav")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/practices"
              className="flex items-center justify-center gap-2 min-h-11 px-5 sm:px-6 py-3 border border-[var(--ed-accent)] bg-[var(--ed-accent)] text-[var(--ed-bg)] hover:bg-[var(--ed-fg)] hover:border-[var(--ed-fg)] transition-all duration-300 text-[12px] uppercase tracking-widest font-bold w-full sm:w-auto"
              style={{ fontFamily: F.glacial }}
            >
              {t("practicesHub")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
