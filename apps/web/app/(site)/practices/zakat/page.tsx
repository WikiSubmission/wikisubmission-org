import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  AlertTriangle,
  Banknote,
  ReceiptText,
  UsersRound,
  Wheat,
} from 'lucide-react'
import { buildPageMetadata } from '@/constants/metadata'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import { FadeUp } from '@/lib/motion'
import { OriginVersesSlideshow } from '../contact-prayers/origin-verses-slideshow'
import {
  FactGrid,
  NumberedPanel,
  PracticeHero,
  PracticeHeroPanel,
  QuoteCallout,
  ReadingSection,
  SectionLabel,
  VerseGrid,
} from '../_components/practice-page'

export const metadata: Metadata = buildPageMetadata({
  title: 'Zakat: The Obligatory Charity',
  description:
    'A practical guide to Zakat: the required 2.5% on net income, who receives it, timing, designation, and Quranic purpose.',
  url: '/practices/zakat',
})

const ZAKAT_VERSES = [
  {
    vk: '7:156',
    tx: 'My mercy encompasses all things. However, I will specify it for those who lead a righteous life, give the obligatory charity (Zakat), and believe in our revelations.',
  },
  {
    vk: '6:141',
    tx: 'Eat from their fruits, and give the due alms on the day of harvest, and do not waste anything. He does not love the wasters.',
  },
  {
    vk: '2:215',
    tx: 'They ask you about giving: say, "The charity you give shall go to the parents, the relatives, the orphans, the poor, and the traveling alien." Any good you do, GOD is fully aware thereof.',
  },
  {
    vk: '30:38',
    tx: "Therefore, you shall give the relatives their rightful share, as well as the poor, and the traveling alien. This is better for those who sincerely seek GOD's pleasure; they are the winners.",
  },
  {
    vk: '2:267',
    tx: 'O you who believe, you shall give to charity from the good things you earn, and from what we have produced for you from the earth.',
  },
  {
    vk: '2:219',
    tx: 'They ask you about intoxicants and gambling... And they ask you what to give to charity: say, "The excess." GOD thus clarifies the revelations for you, that you may reflect.',
  },
  {
    vk: '28:77',
    tx: '"Use the provisions bestowed upon you by GOD to seek the abode of the Hereafter, without neglecting your share in this world. And be charitable, as GOD has been charitable towards you. Do not keep on corrupting the earth. GOD does not love the corruptors."',
  },
  {
    vk: '2:195',
    tx: 'You shall spend in the cause of GOD; do not throw yourselves with your own hands into destruction. You shall be charitable; GOD loves the charitable.',
  },
  {
    vk: '17:27',
    tx: 'The extravagant are brethren of the devils, and the devil is unappreciative of his Lord.',
  },
  {
    vk: '21:73',
    tx: 'We made them imams who guided in accordance with our commandments, and we taught them how to work righteousness, and how to observe the Contact Prayers (Salat) and the obligatory charity (Zakat). To us, they were devoted worshipers.',
  },
]

const recipients = [
  'Parents',
  'Relatives',
  'Orphans',
  'The poor',
  'The traveling alien',
]

const zakatFacts = [
  {
    icon: Banknote,
    title: 'Rate',
    body: 'The required amount is 2.5% of net income. More can be given as voluntary charity.',
    refs: ['2:267', '2:219'],
  },
  {
    icon: Wheat,
    title: 'Timing',
    body: 'For regular income, the day of harvest is the day income is received.',
    refs: ['6:141'],
  },
  {
    icon: UsersRound,
    title: 'Recipients',
    body: 'The Quran names real people first: parents, relatives, orphans, the poor, and the traveling alien.',
    refs: ['2:215', '30:38'],
  },
]

export default function ZakatPage() {
  const t = useTranslations('practiceComponents')
  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)] overflow-x-clip">
      <PracticeHero
        active="zakat"
        eyebrow="Obligatory charity"
        title="Zakat"
        description="A practical guide to the obligatory charity: its origin, calculation, timing, recipients, designation, and spiritual importance."
      >
        <PracticeHeroPanel
          icon={ReceiptText}
          kicker="Core calculation"
          value="2.5%"
          meta="Net income on receipt"
          items={[
            'Calculate from net income after government taxes.',
            'Assign it when income is received.',
            'Direct it to the Quranic recipients.',
            'Designate it clearly when giving through an organization.',
          ]}
        />
      </PracticeHero>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24 lg:py-28">
        <div className="space-y-20 md:space-y-28">
          {/* ── Origin ─────────────────────────────────────────────── */}
          <ReadingSection
            label="Origin"
            title="Zakat belongs to the religion of Abraham"
          >
            <div className="space-y-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              <p>
                The Quran presents Submission as the religion of Abraham, and
                Muhammad is commanded to follow Abraham&apos;s way. The core
                religious practices, including the Contact Prayers, Zakat, fasting,
                and Hajj, are preserved through Abraham rather than invented later.
              </p>
              <p>
                Zakat is not a later institutional tax or a cultural donation
                custom. It is one of the foundational practices of Submission: a
                recurring act of obedience through which the believer gives from
                what God has provided.
              </p>
            </div>

            <OriginVersesSlideshow
              refs={['2:135', '3:95', '4:125', '6:161', '16:123', '21:73']}
            />

            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              The Quran connects the righteous community with those who establish
              the Contact Prayers and give Zakat. Abraham and his descendants were
              commanded in worship, righteousness, and charitable obligation.
            </p>
          </ReadingSection>

          {/* ── Obligation ─────────────────────────────────────────── */}
          <ReadingSection label="Obligation" title="Zakat is tied to God's mercy">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] lg:items-start">
              {/* Left: Featured quote */}
              <div className="space-y-8">
                <QuoteCallout reference="7:156">
                  My mercy encompasses all things. However, I will specify it
                  for those who lead a righteous life, give the obligatory
                  charity (Zakat), and believe in our revelations.
                </QuoteCallout>
                <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
                  Zakat is not optional charity. The Quran places it among the
                  defining traits of those who receive God&apos;s specified mercy.
                </p>
              </div>

              {/* Right: Three conditions */}
              <div className="space-y-3">
                {[
                  {
                    num: '01',
                    title: 'Righteous life',
                    desc: 'Upright conduct and reverence in daily affairs',
                  },
                  {
                    num: '02',
                    title: 'Obligatory charity',
                    desc: 'The 2.5% due on net income when received',
                  },
                  {
                    num: '03',
                    title: 'Belief in revelations',
                    desc: 'Acceptance of the Quranic signs and guidance',
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="group flex items-start gap-4 sm:gap-5 border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-4 sm:p-5 transition-all duration-300 hover:border-[var(--ed-accent)]/50"
                  >
                    <span
                      className="text-2xl sm:text-3xl font-medium text-[var(--ed-fg-muted)]/15 transition-colors duration-300 group-hover:text-[var(--ed-accent)]/25"
                      style={{ fontFamily: F.display }}
                    >
                      {item.num}
                    </span>
                    <div className="pt-1">
                      <p
                        className="text-base font-medium text-[var(--ed-fg)]"
                        style={{ fontFamily: F.serif }}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--ed-fg-muted)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ReadingSection>

          {/* ── Calculation ────────────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-4">
              <SectionLabel>Calculation</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
                style={{ fontFamily: F.display }}
              >
                The required amount is 2.5% of net income
              </h2>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-stretch">
              {/* Left: Formula */}
              <div
                className="relative flex flex-col justify-center overflow-hidden rounded-2xl border p-6 sm:p-8 md:p-10 shadow-sm"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--ed-accent)]" />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]"
                  style={{ fontFamily: F.glacial }}
                >
                  Formula
                </p>

                <div className="my-8 sm:my-10 space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 sm:gap-x-4 gap-y-2">
                    <span
                      className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.mono }}
                    >
                      Net income
                    </span>
                    <span
                      className="text-xl sm:text-2xl md:text-3xl text-[var(--ed-accent)]"
                      style={{ fontFamily: F.mono }}
                    >
                      &times;
                    </span>
                    <span
                      className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.mono }}
                    >
                      0.025
                    </span>
                  </div>

                  <div className="h-px w-full" style={{ backgroundColor: 'var(--ed-rule)' }} />

                  <p
                    className="text-2xl sm:text-3xl md:text-4xl font-medium text-[var(--ed-accent)]"
                    style={{ fontFamily: F.mono }}
                  >
                    = Zakat due
                  </p>
                </div>

                <div className="mt-auto border-t pt-5 sm:pt-6" style={{ borderColor: 'var(--ed-rule)' }}>
                  <p className="text-sm leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                    Example:{' '}
                    <span className="font-semibold text-[var(--ed-fg)]">
                      $1,000
                    </span>{' '}
                    net income &times; 0.025 ={' '}
                    <span className="font-semibold text-[var(--ed-accent)]">$25</span>{' '}
                    Zakat.
                  </p>
                </div>
              </div>

              {/* Right: Steps */}
              <div
                className="flex flex-col rounded-2xl border p-6 sm:p-8 md:p-10 shadow-sm"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-fg-muted)] mb-6 sm:mb-8"
                  style={{ fontFamily: F.glacial }}
                >
                  How to apply
                </p>
                <div className="flex-1 space-y-5 sm:space-y-6">
                  {[
                    'Remove government taxes from gross income first.',
                    'Do not deduct personal expenses from the Zakat base.',
                    'Calculate the obligation when income is received, not when saved.',
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4">
                      <span
                        className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-bold text-[var(--ed-accent)] bg-[var(--ed-bg)]"
                        style={{ borderColor: 'var(--ed-rule)', fontFamily: F.mono }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="pt-1 text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* ── Timing & Recipients ────────────────────────────────── */}
          <FadeUp as="section" distance={16} className="space-y-8 md:space-y-10">
            <div className="mx-auto max-w-4xl space-y-4">
              <SectionLabel>Timing and recipients</SectionLabel>
              <h2
                className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl text-[var(--ed-fg)]"
                style={{ fontFamily: F.display }}
              >
                Give on the day of harvest to the people God specifies
              </h2>
            </div>
            <FactGrid items={zakatFacts} />
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
              <div
                className="space-y-5 text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                <QuoteCallout reference="2:215">
                  The charity you give shall go to the parents, the relatives, the
                  orphans, the poor, and the traveling alien.
                </QuoteCallout>
                <p>
                  Zakat begins with real human need, especially those closest to
                  us, before moving outward.
                </p>
              </div>
              <NumberedPanel items={recipients} />
            </div>
          </FadeUp>

          {/* ── Balance ────────────────────────────────────────────── */}
          <ReadingSection
            label="Balance"
            title="Zakat is the minimum; charity can go beyond it"
          >
            <p className="text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              A person may give more, and extra giving is encouraged when one is
              able, but the extra should be understood as voluntary charity.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  '28:77',
                  'Seek the Hereafter without neglecting your share in this world.',
                ],
                [
                  '2:195',
                  'Spend in the cause of God, but do not throw yourselves into destruction.',
                ],
                ['17:27', 'The extravagant are brethren of the devils.'],
                ['2:219', 'Give from the excess.'],
              ].map(([ref, text]) => (
                <div
                  key={ref}
                  className="group rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:border-[var(--ed-accent)] shadow-sm"
                  style={{
                    borderColor: 'var(--ed-rule)',
                    backgroundColor: 'var(--ed-surface)',
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--ed-rule)' }}>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-accent)]"
                      style={{ fontFamily: F.glacial }}
                    >
                      Sura {ref}
                    </span>
                    <QuranRef reference={ref} />
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </ReadingSection>

          {/* ── Designation ────────────────────────────────────────── */}
          <ReadingSection
            label="Designation"
            title="A general donation is not automatically Zakat"
          >
            <div
              className="rounded-2xl border p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-sm"
              style={{
                borderColor: 'var(--ed-rule)',
                borderLeftWidth: 4,
                borderLeftColor: 'var(--ed-accent)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              <div className="mb-5 flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--ed-rule)' }}>
                <AlertTriangle className="shrink-0 text-[var(--ed-accent)]" size={20} strokeWidth={1.7} />
                <h3
                  className="text-lg sm:text-xl font-medium text-[var(--ed-fg)]"
                  style={{ fontFamily: F.display }}
                >
                  Distinct purpose required
                </h3>
              </div>
              <div className="space-y-4 text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                <p>
                  If Zakat is given through a mosque, charity, relief fund, or
                  organization, it must be designated for the needy recipients
                  identified by the Quran.
                </p>
                <p>
                  A general gift to a mosque, hospital, building fund, or
                  organization may be good charity, but it is not automatically
                  Zakat. The designation matters because Zakat has a defined
                  purpose.
                </p>
              </div>
            </div>
          </ReadingSection>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 pb-16">
        <VerseGrid
          label="Scriptural reference"
          title="Zakat in the Quran"
          description="The verses below anchor the origin, obligation, calculation, timing, recipient emphasis, and spiritual importance of the obligatory charity."
          verses={ZAKAT_VERSES}
        />
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 pb-20 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-12 border-t" style={{ borderColor: 'var(--ed-rule)' }}>
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/practices"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] w-full sm:w-auto justify-center"
              style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
            >
              &larr; {t("practicesHub")}
            </Link>
            <Link
              href="/practices/contact-prayers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
              style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)', fontFamily: F.mono }}
            >
              {t("contactPrayersNav")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
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
      </div>
    </main>
  )
}
