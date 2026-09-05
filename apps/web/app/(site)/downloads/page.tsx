import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'
import { DownloadsBookShowcase } from './downloads-book-showcase'
import { MobileAppsSection } from './mobile-apps-section'

export const metadata = buildPageMetadata({
  title: 'Downloads | WikiSubmission',
  description: 'Download the Quran, books, research papers, and apps from WikiSubmission.',
  url: '/downloads',
})

const DownloadLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium group"
  >
    <span>{label}</span>
    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
  </a>
)

export default async function Downloads() {
  const t = await getTranslations('downloads')

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section with Editorial Index */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-primary uppercase mb-4">
            <span>DOWNLOADS</span>
            <span>·</span>
            <span>WIKISUBMISSION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-14 items-end">
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(48px, 9vw, 88px)',
                  fontWeight: 400,
                  lineHeight: 0.95,
                  letterSpacing: '-0.035em',
                }}
                className="text-foreground"
              >
                {t('heading')}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(15px, 3.6vw, 17px)',
                  lineHeight: 1.65,
                }}
                className="text-muted-foreground max-w-[64ch] mt-6 leading-relaxed"
              >
                {t('description')}
              </p>
            </div>

            <nav
              aria-label="Downloads index"
              className="border-t lg:border-t-0 lg:border-l border-border/60 pt-5 lg:pt-0 lg:pl-8 flex flex-col gap-3"
            >
              <div className="font-mono text-[10px] tracking-widest text-primary uppercase mb-1">
                INDEX / SECTIONS
              </div>
              <a
                href="#mobile-apps"
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform">Mobile Apps</span>
                <span className="text-primary font-bold text-[11px]">01</span>
              </a>
              <a
                href="#books-publications"
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform">Books &amp; Publications</span>
                <span className="text-primary font-bold text-[11px]">02</span>
              </a>
              <a
                href="#other-resources"
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform">Community Resources</span>
                <span className="text-primary font-bold text-[11px]">03</span>
              </a>
            </nav>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        {/* 01: Mobile Apps */}
        <MobileAppsSection />

        {/* 02: Interactive Books Showcase (Three.js 3D Book & 4-Book Swapper) */}
        <DownloadsBookShowcase />

        {/* 03: Community Resources */}
        <section className="py-12 border-t border-border/40" id="other-resources">
          <div className="flex items-center gap-3 mb-8">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">03</div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-primary uppercase">FURTHER RESEARCH</p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold">Community Resources</h2>
            </div>
            <div className="h-px flex-1 bg-border/60 ml-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                num: '01',
                title: "Beyond Probability – God's Message in Mathematics",
                author: 'Abdula Arik',
                links: [
                  { label: 'Download PDF (Series I)', file: 'beyond-probability' },
                  { label: 'Download PDF (Series II)', file: 'beyond-probability-series-2' },
                ],
              },
              {
                num: '02',
                title: 'The Math Miracle — Intended or Coincidence',
                author: 'Mike J.',
                links: [{ label: 'Download PDF', file: 'math-miracle-intended-or-coincidence' }],
              },
              {
                num: '03',
                title: 'Al-Quran The Ultimate Miracle',
                author: 'Ahmed Deedat',
                links: [{ label: 'Download PDF', file: 'ultimate-miracle-of-the-quran' }],
              },
              {
                num: '04',
                title: "Nineteen: God's Signature in Nature and Scripture",
                author: 'Edip Yuksel',
                links: [
                  {
                    label: 'Download PDF',
                    file: 'nineteen-gods-signature-in-nature-and-scripture',
                  },
                ],
              },
            ].map((book, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/40 p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
                      {book.author}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">{book.num}</span>
                  </div>
                  <h3 className="font-headline font-bold text-base leading-snug">
                    {book.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {book.links.map((link, j) => (
                    <DownloadLink
                      key={j}
                      href={`https://library.wikisubmission.org/file/${link.file}`}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
