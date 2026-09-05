import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { About } from '@/constants/about'
import { LegalMarkdown } from '@/components/legal-markdown'
import { buildPageMetadata } from '@/constants/metadata'
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileText,
  Mail,
  ArrowRight,
  Compass,
} from 'lucide-react'

export const metadata = buildPageMetadata({
  title: 'Privacy Policy — WikiSubmission',
  description: 'Privacy Policy and data protection guarantees for the WikiSubmission website and mobile app.',
  url: '/legal/privacy-policy',
})

const TOC_ITEMS = [
  { id: 'information-we-collect', label: 'Information We Collect', num: '01' },
  { id: 'how-we-use-your-information', label: 'How We Use Information', num: '02' },
  { id: 'what-we-do-not-do', label: 'What We Do Not Do', num: '03' },
  { id: 'session-tokens-and-storage', label: 'Session Tokens & Storage', num: '04' },
  { id: 'data-transmission-security', label: 'Data Transmission Security', num: '05' },
  { id: 'third-party-sign-in-providers', label: 'Third-Party Sign-In', num: '06' },
  { id: 'childrens-privacy', label: "Children's Privacy", num: '07' },
  { id: 'your-rights-and-choices', label: 'Your Rights & Choices', num: '08' },
  { id: 'links-to-third-party-websites', label: 'Third-Party Links', num: '09' },
  { id: 'changes-to-this-privacy-policy', label: 'Policy Changes', num: '10' },
  { id: 'contact-information', label: 'Contact Information', num: '11' },
]

export default function PrivacyPolicy() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/legal/en/privacy-policy.md'),
    'utf8'
  )

  return (
    <div className="min-h-screen pb-20">
      {/* Editorial Hero Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-primary uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PRIVACY &amp; SECURITY</span>
              <span>·</span>
              <span>WIKISUBMISSION</span>
            </div>

            {/* Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/50 shadow-sm font-mono text-[10px] tracking-wider uppercase">
              <Link
                href="/legal/terms-of-use"
                className="px-3.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                Terms of Use
              </Link>
              <Link
                href="/legal/privacy-policy"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-all"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-14 items-end">
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
                Privacy <span className="italic text-muted-foreground font-light">Policy</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(15px, 3.6vw, 17px)',
                  lineHeight: 1.65,
                }}
                className="text-muted-foreground max-w-[64ch] mt-6 leading-relaxed"
              >
                WikiSubmission is built to be private by design: no ads, no trackers, no profiling, and complete user ownership over your data.
              </p>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-8 flex flex-col gap-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Effective Date</span>
                <span className="font-semibold text-foreground">July 5, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Tracking SDKs</span>
                <span className="text-emerald-500 font-semibold">0 Detected (None)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Advertising</span>
                <span className="text-emerald-500 font-semibold">Strictly Zero</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantees Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-border/40">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <EyeOff className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">No Advertising or Trackers</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">Zero analytics SDKs, advertising IDs, or cross-site tracking.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">End-to-End Transit Security</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">All communication is strictly encrypted via HTTPS.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <Server className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">Direct Data Control</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">Export or delete your synced bookmarks and notes anytime.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-24 space-y-6">
            <div className="p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-primary uppercase mb-4 pb-3 border-b border-border/40">
                <Compass className="h-3.5 w-3.5" />
                <span>TABLE OF CONTENTS</span>
              </div>
              <nav aria-label="Privacy Policy Table of Contents" className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {TOC_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
                  >
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0 ml-2">
                      {item.num}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Contact Card */}
            <div className="p-5 rounded-2xl border border-border/40 bg-gradient-to-b from-card to-muted/20 shadow-sm">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-primary uppercase mb-2">
                <Mail className="h-3.5 w-3.5" />
                <span>PRIVACY QUESTIONS</span>
              </div>
              <p className="font-serif text-xs text-muted-foreground leading-relaxed mb-4">
                Have questions or requests regarding your data and privacy?
              </p>
              <a
                href={`mailto:${About.email}`}
                className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-xs font-mono font-medium text-primary transition-all"
              >
                <span>{About.email}</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </aside>

          {/* Article Body */}
          <main className="min-w-0">
            <article className="p-7 sm:p-10 md:p-12 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
              <LegalMarkdown content={content} />

              {/* Contact Section */}
              <div id="contact-information" className="scroll-mt-24 pt-10 mt-10 border-t border-border/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <h2 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Contact Information
                  </h2>
                </div>
                <p className="font-serif text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-6">
                  For any questions, concerns, or requests regarding this Privacy Policy or your data, please email us at{' '}
                  <a href={`mailto:${About.email}`} className="text-primary font-semibold underline underline-offset-4 decoration-primary/40 hover:decoration-primary">
                    {About.email}
                  </a>
                  .
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 font-mono text-xs">
                  <Link
                    href="/legal/terms-of-use"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>View Terms of Use</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                  >
                    <span>Return to Home</span>
                  </Link>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  )
}
