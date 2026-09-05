'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  ExternalLink,
  ArrowRight,
  Copy,
  Check,
  Languages,
  Smartphone,
  Binary,
  Fingerprint,
  Send,
  ChevronDown,
} from 'lucide-react'
import { FaDiscord, FaGithub, FaYoutube, FaXTwitter } from 'react-icons/fa6'
import { About } from '@/constants/about'

interface ChannelItem {
  id: string
  title: string
  handle: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external: boolean
  cardClasses: string
  iconBoxClasses: string
  arrowClasses: string
}

const CHANNELS: ChannelItem[] = [
  {
    id: 'youtube',
    title: 'YouTube',
    handle: '@wikisubmission',
    href: About.social.youtube,
    icon: FaYoutube,
    external: true,
    cardClasses:
      'border-border/50 bg-card/60 hover:bg-[#FF0000]/[0.05] hover:border-[#FF0000]/60 hover:shadow-md hover:shadow-[#FF0000]/10',
    iconBoxClasses:
      'bg-[#FF0000] text-white shadow-sm shadow-[#FF0000]/40 group-hover:scale-105',
    arrowClasses: 'group-hover:text-[#FF0000]',
  },
  {
    id: 'discord',
    title: 'Discord',
    handle: 'discord.gg/wikisubmission',
    href: About.social.discord,
    icon: FaDiscord,
    external: true,
    cardClasses:
      'border-border/50 bg-card/60 hover:bg-[#5865F2]/[0.05] hover:border-[#5865F2]/60 hover:shadow-md hover:shadow-[#5865F2]/10',
    iconBoxClasses:
      'bg-[#5865F2] text-white shadow-sm shadow-[#5865F2]/40 group-hover:scale-105',
    arrowClasses: 'group-hover:text-[#5865F2]',
  },
  {
    id: 'github',
    title: 'GitHub',
    handle: 'github.com/wikisubmission',
    href: About.social.github,
    icon: FaGithub,
    external: true,
    cardClasses:
      'border-border/50 bg-card/60 hover:bg-muted/60 hover:border-foreground/40 hover:shadow-md',
    iconBoxClasses:
      'bg-[#24292E] dark:bg-white text-white dark:text-[#24292E] shadow-sm group-hover:scale-105',
    arrowClasses: 'group-hover:text-foreground',
  },
  {
    id: 'twitter',
    title: 'X / Twitter',
    handle: '@wikisubmission',
    href: About.social.twitter,
    icon: FaXTwitter,
    external: true,
    cardClasses:
      'border-border/50 bg-card/60 hover:bg-muted/60 hover:border-foreground/40 hover:shadow-md',
    iconBoxClasses:
      'bg-black dark:bg-white text-white dark:text-black shadow-sm group-hover:scale-105',
    arrowClasses: 'group-hover:text-foreground',
  },
  {
    id: 'email',
    title: 'Direct Email',
    handle: About.email,
    href: `mailto:${About.email}`,
    icon: Mail,
    external: false,
    cardClasses:
      'border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] hover:border-primary/80 hover:shadow-md hover:shadow-primary/10',
    iconBoxClasses:
      'bg-primary text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-105',
    arrowClasses: 'group-hover:text-primary',
  },
]

const ROUTING_TOPICS = [
  {
    title: 'Report a Typo or Translation Issue',
    icon: Languages,
    desc: 'Found a discrepancy in a verse or appendix? Let us know so our editorial review team can verify and fix it.',
    subject: '[Correction] Typo / Translation Discrepancy',
    action: 'Send Correction',
  },
  {
    title: 'Mobile App or Sync Support',
    icon: Smartphone,
    desc: 'Having trouble syncing bookmarks, streaks, or notes across your devices? We are here to help resolve it.',
    subject: '[Support] Mobile App / Account Sync Help',
    action: 'Get App Help',
  },
  {
    title: 'Scripture Study & Research',
    icon: Binary,
    desc: 'Questions about the Quranic mathematical structure, Arabic root cross-referencing, or study tools.',
    subject: '[Research] Scripture Study Inquiry',
    action: 'Ask Research Team',
  },
  {
    title: 'Privacy & Data Protection',
    icon: Fingerprint,
    desc: 'Questions regarding data handling or requests to export/delete account records.',
    subject: '[Privacy] Data Inquiries & Rights',
    action: 'Contact Privacy',
  },
]

const FAQS = [
  {
    q: 'How do I report an error or typo in the Quran text or translation?',
    a: 'You can email us directly at contact@wikisubmission.org with the chapter and verse numbers, or open an issue on our open-source GitHub repository. Our editorial review team verifies every submission against historical authorized manuscripts and Dr. Rashad Khalifa’s original prints.',
  },
  {
    q: 'Is WikiSubmission free and open-source?',
    a: 'Yes. WikiSubmission is 100% free, nonprofit, and open-source. We do not sell ads, monetize user data, or gate scripture behind paywalls.',
  },
  {
    q: 'How can I contribute as a developer, researcher, or translator?',
    a: 'Check out our GitHub organization (github.com/wikisubmission) where our web apps, mobile apps, and datasets are hosted. You can also join our Discord community to collaborate with translators and developers.',
  },
  {
    q: 'How do I request account deletion or data export?',
    a: 'You can delete your synced bookmarks, notes, and reading progress directly within the mobile app settings under Data Management, or by sending an email request to contact@wikisubmission.org.',
  },
]

export function ContactClient({
  heading,
  description,
}: {
  heading: string
  description: string
}) {
  const [copied, setCopied] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const words = (heading || 'Get in Touch').split(' ')
  const firstPart = words.slice(0, -1).join(' ')
  const lastWord = words[words.length - 1]

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(About.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // fallback
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-primary uppercase mb-4">
            <Mail className="h-3.5 w-3.5" />
            <span>COMMUNICATION · WIKISUBMISSION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-14 items-end">
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
                {firstPart ? `${firstPart} ` : ''}
                <span className="italic text-muted-foreground font-light">{lastWord}</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(15px, 3.6vw, 17px)',
                  lineHeight: 1.65,
                }}
                className="text-muted-foreground max-w-[64ch] mt-6 leading-relaxed"
              >
                {description}
              </p>
            </div>

            {/* Quick Email Pill & Copy */}
            <div className="p-4 sm:p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Direct Contact</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 font-mono text-xs text-foreground">
                <span className="truncate">{About.email}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Copy email address"
                  title="Copy email address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-serif">
                <span>Typical response time:</span>
                <span className="font-mono font-medium text-foreground text-[10px]">24–48 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-14">
        {/* Minimized Official Channels Grid */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">01</div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-primary uppercase">OFFICIAL CHANNELS</p>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold">Connect With Us</h2>
            </div>
            <div className="h-px flex-1 bg-border/60 ml-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon
              return (
                <a
                  key={ch.id}
                  href={ch.href}
                  {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 backdrop-blur-sm ${ch.cardClasses}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${ch.iconBoxClasses}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-headline font-bold text-sm text-foreground truncate leading-tight">
                        {ch.title}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        {ch.handle}
                      </div>
                    </div>
                  </div>

                  <div className="pl-2 shrink-0">
                    {ch.external ? (
                      <ExternalLink
                        className={`h-3.5 w-3.5 text-muted-foreground/50 transition-colors duration-200 ${ch.arrowClasses}`}
                      />
                    ) : (
                      <ArrowRight
                        className={`h-3.5 w-3.5 text-muted-foreground/50 transition-colors duration-200 ${ch.arrowClasses}`}
                      />
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* Quick Topic Routing */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">02</div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-primary uppercase">ROUTING &amp; TOPICS</p>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold">What Can We Help With?</h2>
            </div>
            <div className="h-px flex-1 bg-border/60 ml-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROUTING_TOPICS.map((topic, i) => {
              const Icon = topic.icon
              const mailHref = `mailto:${About.email}?subject=${encodeURIComponent(topic.subject)}`
              return (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-muted border border-border/50 text-foreground shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-foreground mb-1">
                        {topic.title}
                      </h3>
                      <p className="font-serif text-xs text-muted-foreground leading-relaxed">
                        {topic.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/30 flex justify-end">
                    <a
                      href={mailHref}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-mono font-medium text-primary transition-all"
                    >
                      <Send className="h-3 w-3" />
                      <span>{topic.action}</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">03</div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-primary uppercase">HELP &amp; CLARIFICATION</p>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="h-px flex-1 bg-border/60 ml-4" />
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm divide-y divide-border/40 overflow-hidden">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className="transition-colors hover:bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-headline font-semibold text-base sm:text-lg text-foreground">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 font-serif text-sm text-muted-foreground leading-relaxed border-t border-border/20 pt-3.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Legal & Policy Links Card */}
        <section className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-gradient-to-b from-card/80 to-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-headline text-xl font-bold text-foreground mb-1">
              Legal, Terms &amp; Privacy Policies
            </h3>
            <p className="font-serif text-sm text-muted-foreground max-w-xl leading-relaxed">
              Review our terms of use, fair usage guidelines, and strict zero-tracking privacy commitments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs shrink-0">
            <Link
              href="/legal/terms-of-use"
              className="px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              Terms of Use
            </Link>
            <Link
              href="/legal/privacy-policy"
              className="px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
