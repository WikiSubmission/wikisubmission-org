import PrayerTimesClient from './prayer-times-client'
import RamadanClient from './ramadan-client'
import { ZakatCalculator } from '@/components/zakat-calculator'
import Link from 'next/link'
import type { components } from '@/src/api/types.gen'
import { getTranslations } from 'next-intl/server'

type VerseData = components['schemas']['VerseData']

// ── Astronomical Hijri calendar (Julian Day Number method) ──────────────────
function gregorianToHijri(date: Date): {
  year: number
  month: number
  day: number
} {
  const Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate()
  const JD =
    Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4
    ) +
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

const DAYS_UNTIL_RAMADAN = daysUntilNextRamadan()
const SHOW_RAMADAN_SECTION = DAYS_UNTIL_RAMADAN <= 15

// ── Stylish verse quote card ─────────────────────────────────────────────────
function VerseQuoteCard({
  verseKey,
  href,
  text,
}: {
  verseKey: string
  href: string
  text: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/5 to-transparent p-6 space-y-4">
      {/* Decorative large quote mark */}
      <span className="absolute top-1 right-4 text-8xl leading-none text-primary/8 font-serif select-none pointer-events-none">
        &ldquo;
      </span>
      {/* Verse ref badge */}
      <Link
        href={href}
        className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
      >
        {verseKey}
      </Link>
      {/* Text */}
      <p className="text-sm leading-relaxed text-foreground/90 italic">
        {text}
      </p>
    </div>
  )
}

export default async function PracticesClient({
  zakatVerse,
  prayerVerse,
}: {
  zakatVerse: VerseData | null
  prayerVerse: VerseData | null
}) {
  const t = await getTranslations('practices')

  const zakatText = zakatVerse?.tr?.['en']?.tx
  const prayerText = prayerVerse?.tr?.['en']?.tx

  const PLACEHOLDER_CARDS = [
    { title: t('card1Title'), description: t('card1Desc'), slug: 'understanding-salat' },
    { title: t('card2Title'), description: t('card2Desc'), slug: 'zakat-guide' },
    { title: t('card3Title'), description: t('card3Desc'), slug: 'ramadan-fasting' },
    { title: t('card4Title'), description: t('card4Desc'), slug: 'hajj-overview' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('heading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Prayer Times */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-headline text-2xl font-bold">{t('prayerTimes')}</h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3">
            <PrayerTimesClient />
          </div>
          {prayerText && (
            <div className="md:col-span-2">
              <VerseQuoteCard
                verseKey="4:103"
                href="/quran/4?verse=103"
                text={prayerText}
              />
            </div>
          )}
        </div>
      </section>

      {/* Zakat */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-headline text-2xl font-bold">{t('zakat')}</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            {/* Calculator */}
            <div className="md:col-span-3">
              <ZakatCalculator />
            </div>
            {/* Verse 9:60 */}
            {zakatText && (
              <div className="md:col-span-2">
                <VerseQuoteCard
                  verseKey="9:60"
                  href="/quran/9?verse=60"
                  text={zakatText}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ramadan — only shown within 15 days of start or during */}
      {SHOW_RAMADAN_SECTION && (
        <section className="border-t border-border/40">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-headline text-2xl font-bold">{t('ramadan')}</h2>
              {DAYS_UNTIL_RAMADAN > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary leading-none">
                  in {DAYS_UNTIL_RAMADAN}d
                </span>
              )}
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <RamadanClient />
          </div>
        </section>
      )}

      {/* Placeholder educational cards */}
      <section className="border-t border-border/40 bg-muted/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-headline text-2xl font-bold">{t('learnMore')}</h2>
            <div className="h-px grow mx-6 bg-border/60" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('comingSoon')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLACEHOLDER_CARDS.map((card) => (
              <div
                key={card.slug}
                className="group relative bg-background rounded-xl p-6 editorial-shadow border border-border/40 transition-all hover:-translate-y-0.5"
              >
                <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
                  {t('comingSoon')}
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
