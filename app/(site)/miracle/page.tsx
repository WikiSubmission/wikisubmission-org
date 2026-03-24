import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { FaYoutube } from 'react-icons/fa'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'The Mathematical Miracle | WikiSubmission',
  description:
    'Discover Code 19 — the mathematical miracle of the Quran, a built-in divine authentication discovered by Dr. Rashad Khalifa in 1974.',
}

export default async function MiraclePage() {
  const t = await getTranslations('miracle')

  const FACTS = [
    {
      id: 'bismillah',
      number: t('factBismillahNumber'),
      label: t('factBismillahLabel'),
      detail: t('factBismillahDetail'),
    },
    {
      id: 'chapters',
      number: t('factChaptersNumber'),
      label: t('factChaptersLabel'),
      detail: t('factChaptersDetail'),
    },
    {
      id: 'revelation',
      number: t('factRevelationNumber'),
      label: t('factRevelationLabel'),
      detail: t('factRevelationDetail'),
    },
    {
      id: 'god',
      number: t('factGodNumber'),
      label: t('factGodLabel'),
      detail: t('factGodDetail'),
    },
    {
      id: 'chapter96',
      number: t('factChapter96Number'),
      label: t('factChapter96Label'),
      detail: t('factChapter96Detail'),
    },
    {
      id: 'discovery',
      number: t('factDiscoveryNumber'),
      label: t('factDiscoveryLabel'),
      detail: t('factDiscoveryDetail'),
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            {t('badge')}
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('heading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4 text-base leading-relaxed text-foreground/90">
            <p>
              {t('intro1Before')}{' '}
              <Link href="/quran/74?verse=30" className="text-primary hover:underline">
                74:30
              </Link>{' '}
              {t('intro1After')}
            </p>
            <p>{t('intro2')}</p>
            <p>{t('intro3')}</p>
          </div>

          {/* YouTube card */}
          <a
            href="https://youtu.be/4TUYIuxkAmQ?si=KqAL8Ra2c_Y4C2xf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all"
          >
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
              <FaYoutube size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t('youtubeLabel')}
              </p>
              <h3 className="font-headline font-bold text-base leading-snug">
                {t('youtubeTitle')}
              </h3>
            </div>
            <span className="mt-auto flex items-center gap-1 text-xs text-primary font-semibold">
              {t('youtubeWatch')} <ExternalLink size={12} />
            </span>
          </a>
        </div>
      </section>

      {/* Key facts */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-headline text-2xl font-bold">{t('keyFacts')}</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FACTS.map((fact) => (
              <div
                key={fact.id}
                className="bg-background rounded-2xl p-6 border border-border/40 editorial-shadow space-y-2"
              >
                <span className="font-headline text-3xl font-extrabold text-primary">
                  {fact.number}
                </span>
                <p className="font-semibold text-sm">{fact.label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appendix link */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl border border-border/40 bg-muted/20">
          <div className="flex-1">
            <p className="font-semibold mb-1">{t('readFullAnalysis')}</p>
            <p className="text-sm text-muted-foreground">
              {t('appendixDesc')}
            </p>
          </div>
          <a
            href="https://cdn.wikisubmission.org/books/quran-the-final-testament-appendix-1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {t('appendixButton')} <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </div>
  )
}
