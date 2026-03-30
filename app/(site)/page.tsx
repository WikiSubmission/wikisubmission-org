import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '@/constants/metadata'
import { HeroCardDeck } from '@/components/hero-card-deck'

export const metadata = buildPageMetadata({
  title: 'WikiSubmission',
  description: 'WikiSubmission is a faith-based nonprofit providing free and open-source tools for the Final Testament (Quran), Bible, and religious education.',
  url: '/',
})
import { FaApple, FaAndroid, FaDiscord, FaYoutube } from 'react-icons/fa'
import { DownloadIcon, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-baseline justify-between mb-12">
      <h2 className="font-headline text-3xl font-bold">{title}</h2>
      <div className="h-px flex-grow mx-6 bg-border/40" />
      {subtitle && (
        <span className="text-on-surface-variant text-sm uppercase tracking-widest shrink-0">
          {subtitle}
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const t = await getTranslations('home')

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Text column */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wider">
                Open Source · Free · Multilingual
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
                {t('hero.headline')}
              </h1>
              <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-xl">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/quran"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-headline font-bold text-base shadow-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 group"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/practices"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface-container text-foreground font-headline font-bold text-base hover:bg-surface-container-high transition-all hover:-translate-y-0.5 border border-border/40"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Image column */}
          <div className="md:col-span-5 relative flex justify-center md:justify-end pb-6">
            <HeroCardDeck />
          </div>
        </div>
      </section>

      {/* ── Scripture ────────────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title={t('scripture.title')}
            subtitle={t('scripture.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Final Testament — featured (2 cols) */}
            <Link
              href="/quran"
              className="md:col-span-2 group relative bg-background p-8 rounded-2xl editorial-shadow overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(99,14,212,0.10)]"
            >
              <div className="relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {t('scripture.badge')}
                </span>
                <h3 className="font-headline text-3xl font-extrabold">
                  {t('services.finalTestament')}
                </h3>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  {t('services.finalTestamentDesc')}
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm pt-2 group-hover:gap-3 transition-all">
                  {t('scripture.readNow')} <ArrowRight size={16} />
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                <Image
                  src="/brand-assets/logo-transparent.png"
                  alt=""
                  width={180}
                  height={180}
                  className="rounded-full"
                  aria-hidden
                />
              </div>
            </Link>

            {/* The Bible — secondary (1 col, disabled) */}
            <div className="group bg-background p-8 rounded-2xl editorial-shadow opacity-50 grayscale pointer-events-none space-y-4">
              <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center">
                <Image
                  src="/brand-assets/logo-transparent.png"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </div>
              <h3 className="font-headline text-2xl font-bold">
                {t('services.bible')}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {t('services.bibleDesc')}
              </p>
              <span className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border border-border/50 px-3 py-1 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Miracle ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title={t('miracle.title')}
            subtitle={t('miracle.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main description card (2 cols) */}
            <div className="md:col-span-2 bg-surface-container-low p-8 rounded-2xl editorial-shadow space-y-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                {t('miracle.badge')}
              </span>
              <h3 className="font-headline text-2xl font-extrabold">
                {t('miracle.cardHeading')}
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                {t('miracle.cardDescription')}
              </p>
              <Link
                href="/miracle"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
              >
                {t('miracle.readMore')} <ArrowRight size={16} />
              </Link>
            </div>

            {/* YouTube card (1 col) */}
            <a
              href="https://youtu.be/4TUYIuxkAmQ?si=KqAL8Ra2c_Y4C2xf"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface-container-low p-8 rounded-2xl editorial-shadow border border-transparent hover:border-border/40 transition-all hover:-translate-y-1 flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
                <FaYoutube size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">
                  {t('miracle.youtubeTitle')}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {t('miracle.youtubeDesc')}
                </p>
              </div>
              <span className="mt-auto text-xs font-mono text-muted-foreground uppercase tracking-widest">
                {t('miracle.youtubeFooter')}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Platforms & Tools ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t('platformsAndTools')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: t('tools.iosApp'),
                desc: t('tools.iosAppDesc'),
                href: 'https://apps.apple.com/app/id6444260632',
                icon: <FaApple size={24} />,
              },
              {
                title: t('tools.androidApp'),
                desc: t('tools.androidAppDesc'),
                href: 'https://play.google.com/store/apps/details?id=com.kuransonahit.app',
                icon: <FaAndroid size={24} />,
              },
              {
                title: t('tools.downloads'),
                desc: t('tools.downloadsDesc'),
                href: '/downloads',
                icon: <DownloadIcon size={24} />,
              },
              {
                title: t('tools.discordBot'),
                desc: t('tools.discordBotDesc'),
                href: 'https://discord.com/...',
                icon: <FaDiscord size={24} />,
              },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group bg-surface-container-low p-8 rounded-2xl transition-all hover:-translate-y-1 hover:bg-surface-container border border-transparent hover:border-border/40"
              >
                <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center mb-6 text-muted-foreground group-hover:text-primary transition-colors">
                  {tool.icon}
                </div>
                <h3 className="font-headline font-bold text-lg mb-2">
                  {tool.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
