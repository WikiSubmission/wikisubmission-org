import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { About } from '@/constants/about'
import { LegalMarkdown } from '@/components/legal-markdown'
import { buildPageMetadata } from '@/constants/metadata'
import {
  Scale,
  ShieldCheck,
  FileText,
  Mail,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react'

export const metadata = buildPageMetadata({
  title: 'Terms of Use — WikiSubmission',
  description: 'Terms of Use, fair usage policies, and legal framework for WikiSubmission.',
  url: '/legal/terms-of-use',
})

const TOC_ITEMS = [
  { id: 'accepting-these-terms', label: 'Accepting these Terms', num: '01' },
  { id: 'changes-to-these-terms', label: 'Changes to these Terms', num: '02' },
  { id: 'privacy-policy', label: 'Privacy Policy', num: '03' },
  { id: 'third-party-services', label: 'Third-Party Services', num: '04' },
  { id: 'creating-accounts', label: 'Creating Accounts', num: '05' },
  { id: 'your-content-conduct', label: 'Your Content & Conduct', num: '06' },
  { id: 'materials', label: 'Materials & Copyright', num: '07' },
  { id: 'hyperlinks-and-third-party-content', label: 'Hyperlinks & Third Parties', num: '08' },
  { id: 'unavoidable-legal-stuff', label: 'Unavoidable Legal Stuff', num: '09' },
  { id: 'copyright-complaints', label: 'Copyright & DMCA', num: '10' },
  { id: 'governing-law', label: 'Governing Law', num: '11' },
  { id: 'jurisdiction', label: 'Jurisdiction', num: '12' },
  { id: 'termination', label: 'Termination', num: '13' },
  { id: 'entire-agreement', label: 'Entire Agreement', num: '14' },
  { id: 'feedback', label: 'Feedback', num: '15' },
  { id: 'questions-contact', label: 'Questions & Contact', num: '16' },
]

export default function TermsOfService() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/legal/en/terms-of-use.md'),
    'utf8'
  )

  return (
    <div className="min-h-screen pb-20">
      {/* Editorial Hero Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-primary uppercase">
              <Scale className="h-3.5 w-3.5" />
              <span>LEGAL &amp; COMPLIANCE</span>
              <span>·</span>
              <span>WIKISUBMISSION</span>
            </div>

            {/* Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/50 shadow-sm font-mono text-[10px] tracking-wider uppercase">
              <Link
                href="/legal/terms-of-use"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-all"
              >
                Terms of Use
              </Link>
              <Link
                href="/legal/privacy-policy"
                className="px-3.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
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
                Terms of <span className="italic text-muted-foreground font-light">Use</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(15px, 3.6vw, 17px)',
                  lineHeight: 1.65,
                }}
                className="text-muted-foreground max-w-[64ch] mt-6 leading-relaxed"
              >
                The guidelines, terms, and fair use commitments governing the WikiSubmission website, downloads, and mobile applications.
              </p>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-8 flex flex-col gap-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Effective Date</span>
                <span className="font-semibold text-foreground">July 5, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Jurisdiction</span>
                <span className="font-semibold text-foreground">Utah, USA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Classification</span>
                <span className="text-primary font-semibold">Nonprofit / Open</span>
              </div>
            </div>
          </div>

          {/* Key Principles Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 pt-8 border-t border-border/40">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">Nonprofit &amp; Free</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">Free, open-source scripture tools with zero paywalls.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">You Own Your Content</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">Your bookmarks, notes, and research belong entirely to you.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-headline font-semibold text-sm">Respectful Conduct</div>
                <div className="font-serif text-xs text-muted-foreground mt-0.5">Community standards prioritizing scholarly integrity.</div>
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
              <nav aria-label="Terms of Use Table of Contents" className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
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
                <span>LEGAL INQUIRIES</span>
              </div>
              <p className="font-serif text-xs text-muted-foreground leading-relaxed mb-4">
                Have questions or need clarification regarding these terms?
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

              {/* Questions & Contact Section */}
              <div id="questions-contact" className="scroll-mt-24 pt-10 mt-10 border-t border-border/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <h2 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Questions &amp; Contact Information
                  </h2>
                </div>
                <p className="font-serif text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-6">
                  Questions or comments about the Service or these Terms may be directed to us at{' '}
                  <a href={`mailto:${About.email}`} className="text-primary font-semibold underline underline-offset-4 decoration-primary/40 hover:decoration-primary">
                    {About.email}
                  </a>
                  .
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 font-mono text-xs">
                  <Link
                    href="/legal/privacy-policy"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>View Privacy Policy</span>
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
