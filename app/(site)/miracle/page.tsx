import Link from 'next/link'
import { ArrowRight, ExternalLink, ShieldCheck, Cpu, Database, Binary } from 'lucide-react'
import { FaYoutube } from 'react-icons/fa'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'
import { MiracleVisualizer } from './miracle-visualizer'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('miracle')
  return buildPageMetadata({
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    url: '/miracle',
  })
}

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
}

export default async function MiraclePage() {
  const t = await getTranslations('miracle')

  const facts = [
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
    <div className="min-h-screen bg-[var(--ed-bg)] selection:bg-[var(--ed-accent-soft)]">
      {/* ── Compact Hero Section ── */}
      <section
        className="relative overflow-hidden border-b border-[var(--ed-rule)]"
        style={{ padding: 'clamp(60px, 10vw, 120px) 0' }}
      >
        {/* Background Grid & Calligraphy */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]" aria-hidden="true">
        </div>

        {/* Fixed Background Calligraphy (Stylized 19) */}
        <div
          className="absolute right-[2%] top-[10%] pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: 'clamp(250px, 35vw, 500px)',
            lineHeight: 1,
            transform: 'rotate(-5deg)',
            color: 'var(--ed-fg)'
          }}
        >
          ١٩
        </div>

        <div className="container relative z-10 mx-auto px-6 max-w-6xl">
          <div className="flex flex-col items-center text-center">

            <h1
              className="animate-fade-up max-w-4xl"
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(42px, 8vw, 84px)',
                lineHeight: 0.95,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                marginBottom: 24,
                color: 'var(--ed-fg)',
                animationDelay: '100ms'
              }}
            >
              {t('heroHeadingLine1')} <br className="hidden md:block" />
              <span className="opacity-50">{t('heroHeadingLine2')}</span>
            </h1>

            <p
              className="max-w-2xl text-lg md:text-xl text-[var(--ed-fg-muted)] leading-relaxed mb-12 animate-fade-up"
              style={{ fontFamily: F.serif, animationDelay: '200ms' }}
            >
              {t('description')}
            </p>

            {/* Code 19 Display Box */}
            <div
              className="relative p-1 rounded-2xl bg-gradient-to-br from-[var(--ed-rule)] to-transparent animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="px-12 py-8 rounded-[14px] bg-[var(--ed-bg)] border border-[var(--ed-rule)] flex flex-col items-center gap-2 shadow-2xl">
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.4em', color: 'var(--ed-accent)', textTransform: 'uppercase', opacity: 0.6 }}>
                  {t('proofLabel')}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 72, fontWeight: 700, lineHeight: 1, color: 'var(--ed-fg)' }}>
                  19
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Binary size={12} />
                    <span style={{ fontFamily: F.mono, fontSize: 9 }}>{t('proofVerified')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-40">
                    <ShieldCheck size={12} />
                    <span style={{ fontFamily: F.mono, fontSize: 9 }}>{t('proofTamperProof')}</span>
                  </div>
                </div>
              </div>

              {/* Scanning Line Decoration */}
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--ed-accent)] to-transparent opacity-20 pointer-events-none animate-[scan_4s_linear_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Narrative Section ── */}
      <section className="py-24 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)]/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-4 text-[var(--ed-accent)]">
                <Cpu size={24} strokeWidth={1.5} />
                <h2 style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {t('narrativeLabel')}
                </h2>
              </div>

              <div className="space-y-6 text-lg leading-relaxed text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                <p>
                  {t('intro1Before')}{' '}
                  <Link
                    href="/quran/74?verse=30"
                    className="text-[var(--ed-accent)] hover:underline underline-offset-4 decoration-[var(--ed-accent)]/30 font-medium"
                  >
                    74:30
                  </Link>{' '}
                  {t('intro1After')}
                </p>
                <p className="opacity-90">{t('intro2')}</p>
                <p className="opacity-90">{t('intro3')}</p>
              </div>
            </div>

            <div className="lg:col-span-5">
              {/* YouTube Card Redesign */}
              <a
                href="https://youtu.be/4TUYIuxkAmQ?si=KqAL8Ra2c_Y4C2xf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block p-8 rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-bg)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaYoutube size={80} />
                </div>

                <div className="relative z-10 flex flex-col h-full gap-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 border border-red-500/10">
                    <FaYoutube size={24} />
                  </div>

                  <div>
                    <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ed-fg-muted)', marginBottom: 8 }}>
                      {t('youtubeLabel')}
                    </div>
                    <h3 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 500, lineHeight: 1.3, color: 'var(--ed-fg)' }}>
                      {t('youtubeTitle')}
                    </h3>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-[var(--ed-accent)] group-hover:gap-4 transition-all">
                    {t('youtubeWatch')}
                    <ArrowRight size={16} />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Facts Grid ── */}
      <section className="py-24 bg-[var(--ed-bg)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col gap-12 mb-16">
            <div className="flex items-center gap-4">
              <Database size={24} strokeWidth={1.5} className="text-[var(--ed-accent)]" />
              <h2 style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ed-fg)' }}>
                {t('keyFacts')}
              </h2>
              <div className="h-px flex-1 bg-[var(--ed-rule)] opacity-40" />
            </div>
          </div>

          <MiracleVisualizer facts={facts} />
        </div>
      </section>

      {/* ── Footer / Appendix ── */}
      <section className="py-24 border-t border-[var(--ed-rule)] bg-[var(--ed-surface)]/20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center space-y-10">
            <div className="inline-flex p-4 rounded-3xl bg-[var(--ed-bg)] border border-[var(--ed-rule)] shadow-sm">
              <Database size={32} className="text-[var(--ed-accent)]" strokeWidth={1} />
            </div>

            <div className="space-y-4">
              <h2 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 500, color: 'var(--ed-fg)' }}>
                {t('readFullAnalysis')}
              </h2>
              <p className="text-[var(--ed-fg-muted)] text-lg max-w-xl mx-auto leading-relaxed" style={{ fontFamily: F.serif }}>
                {t('appendixDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <a
                href="https://cdn.wikisubmission.org/books/quran-the-final-testament-appendix-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all group shadow-lg"
              >
                <span style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {t('appendixButton')}
                </span>
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/appendices/1"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-fg)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] transition-all group"
              >
                <span style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {t('appendixButtonDigital')}
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}} />
    </div>
  )
}
