import React from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  ArrowUpRight,
  HeartHandshake,
  Server,
  Code2,
  Globe2,
  Sparkles,
  Mail,
  RefreshCw,
} from 'lucide-react'
import {
  FaApplePay,
  FaBitcoin,
  FaCcMastercard,
  FaCcVisa,
  FaPaypal,
  FaStripe,
  FaGooglePay,
} from 'react-icons/fa'
import { buildPageMetadata } from '@/constants/metadata'
import { About } from '@/constants/about'
import { SectionDivider, F } from '@/app/(site)/_sections/shared'

export const metadata = buildPageMetadata({
  title: 'Donate — WikiSubmission',
  description:
    'Support WikiSubmission, a registered 501(c)(3) nonprofit dedicated to keeping scripture open, free, and accessible to everyone worldwide.',
  url: '/donate',
})

const DONATE_LINKS = {
  stripeOneTime: 'https://donate.stripe.com/dRmeV6bVIeic9Xt9KfeAg00',
  stripeMonthly: 'https://donate.stripe.com/4gMeV69NAde86Lhe0veAg03',
  paypal: 'https://www.paypal.com/US/fundraiser/charity/5746449',
  gofundme: 'https://gofund.me/53fa3b5aa',
}

export default async function DonatePage() {
  const t = await getTranslations('donate')

  return (
    <div
      style={{
        backgroundColor: 'var(--ed-bg)',
        color: 'var(--ed-fg)',
        minHeight: '100vh',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6 text-xs font-semibold tracking-wider uppercase"
            style={{
              borderColor: 'var(--ed-rule)',
              backgroundColor: 'var(--ed-surface)',
              color: 'var(--ed-accent)',
              fontFamily: F.glacial,
            }}
          >
            <ShieldCheck size={14} className="text-[var(--ed-accent)]" />
            <span>{t('badgeNonprofit')} · EIN 39-4876245</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight mb-6"
            style={{ fontFamily: F.display, lineHeight: 1.05 }}
          >
            Support the{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--ed-accent)',
              }}
            >
              mission
            </em>
          </h1>

          <p
            className="text-lg sm:text-xl leading-relaxed mb-8 text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.serif }}
          >
            {t('subheading')}
          </p>

          {/* Trust Badges */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t"
            style={{ borderColor: 'var(--ed-rule)' }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--ed-fg-muted)]">
              <ShieldCheck size={15} className="text-[var(--ed-accent)] shrink-0" />
              <span>501(c)(3) Charity</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--ed-fg-muted)]">
              <CheckCircle2 size={15} className="text-[var(--ed-accent)] shrink-0" />
              <span>100% Tax Deductible</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--ed-fg-muted)]">
              <Lock size={15} className="text-[var(--ed-accent)] shrink-0" />
              <span>Zero Ads or Paywalls</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--ed-fg-muted)]">
              <FileText size={15} className="text-[var(--ed-accent)] shrink-0" />
              <span>Instant Receipts</span>
            </div>
          </div>
        </section>

        {/* Primary Giving Options */}
        <section className="mb-20 sm:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Monthly Sustainer (Featured) */}
            <div
              className="lg:col-span-7 rounded-2xl border-2 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all shadow-md"
              style={{
                borderColor: 'var(--ed-accent)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              {/* Top Accent Ribbon */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: 'var(--ed-accent)' }}
              />

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--ed-accent)',
                      color: 'var(--ed-bg)',
                      fontFamily: F.glacial,
                    }}
                  >
                    <Sparkles size={13} />
                    {t('monthlyBadge')}
                  </span>
                  <span
                    className="text-xs font-mono text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.mono }}
                  >
                    Stripe Secure
                  </span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-3"
                  style={{ fontFamily: F.display }}
                >
                  {t('monthly')}
                </h2>

                <p
                  className="text-base leading-relaxed text-[var(--ed-fg-muted)] mb-6"
                  style={{ fontFamily: F.serif }}
                >
                  {t('monthlyDesc')}
                </p>

                <div
                  className="p-4 rounded-xl border mb-8 flex items-center justify-between flex-wrap gap-3"
                  style={{
                    backgroundColor: 'var(--ed-bg)',
                    borderColor: 'var(--ed-rule)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs text-[var(--ed-fg-muted)]">
                    <FaStripe className="size-8 text-[#635BFF]" />
                    <span className="font-medium">Accepted Methods</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--ed-fg-muted)]">
                    <FaApplePay className="size-6 hover:text-[var(--ed-fg)] transition-colors" title="Apple Pay" />
                    <FaGooglePay className="size-6 hover:text-[var(--ed-fg)] transition-colors" title="Google Pay" />
                    <FaCcVisa className="size-6 hover:text-[var(--ed-fg)] transition-colors" title="Visa" />
                    <FaCcMastercard className="size-6 hover:text-[var(--ed-fg)] transition-colors" title="Mastercard" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={DONATE_LINKS.stripeMonthly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all shadow-sm group cursor-pointer"
                  style={{
                    backgroundColor: 'var(--ed-accent)',
                    color: 'var(--ed-bg)',
                    fontFamily: F.serif,
                  }}
                >
                  <span>{t('giveMonthlyCta')}</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <p className="text-center text-xs text-[var(--ed-fg-muted)]">
                  Cancel or update your monthly amount anytime in self-serve portal.
                </p>
              </div>
            </div>

            {/* One-Time Contribution */}
            <div
              className="lg:col-span-5 rounded-2xl border p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm"
              style={{
                borderColor: 'var(--ed-rule)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-[var(--ed-fg-muted)] border"
                    style={{
                      borderColor: 'var(--ed-rule)',
                      fontFamily: F.glacial,
                    }}
                  >
                    One-Time Gift
                  </span>
                  <span
                    className="text-xs font-mono text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.mono }}
                  >
                    Stripe Secure
                  </span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-3"
                  style={{ fontFamily: F.display }}
                >
                  {t('oneTime')}
                </h2>

                <p
                  className="text-base leading-relaxed text-[var(--ed-fg-muted)] mb-6"
                  style={{ fontFamily: F.serif }}
                >
                  {t('oneTimeDesc')}
                </p>

                <div
                  className="p-4 rounded-xl border mb-8 flex items-center justify-between flex-wrap gap-3"
                  style={{
                    backgroundColor: 'var(--ed-bg)',
                    borderColor: 'var(--ed-rule)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs text-[var(--ed-fg-muted)]">
                    <FaStripe className="size-8 text-[#635BFF]" />
                    <span className="font-medium">Cards & Crypto</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--ed-fg-muted)]">
                    <FaApplePay className="size-6" title="Apple Pay" />
                    <FaCcVisa className="size-6" title="Visa" />
                    <FaCcMastercard className="size-6" title="Mastercard" />
                    <FaBitcoin className="size-5" title="Bitcoin" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={DONATE_LINKS.stripeOneTime}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all border group cursor-pointer"
                  style={{
                    borderColor: 'var(--ed-rule)',
                    backgroundColor: 'var(--ed-bg-alt)',
                    color: 'var(--ed-fg)',
                    fontFamily: F.serif,
                  }}
                >
                  <span>{t('giveOneTimeCta')}</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[var(--ed-accent)]" />
                </a>
                <p className="text-center text-xs text-[var(--ed-fg-muted)]">
                  Instant tax receipt sent to your email.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Channels (PayPal Giving Fund & GoFundMe) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* PayPal Giving Fund */}
            <a
              href={DONATE_LINKS.paypal}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl border flex items-start gap-4 transition-all hover:border-[var(--ed-accent)] group"
              style={{
                borderColor: 'var(--ed-rule)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-bg)',
                }}
              >
                <FaPaypal className="size-6 text-[#003087]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-base text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors">
                    {t('paypal')}
                  </h3>
                  <ArrowUpRight size={16} className="text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p
                  className="text-sm text-[var(--ed-fg-muted)] leading-relaxed"
                  style={{ fontFamily: F.serif }}
                >
                  {t('paypalDesc')}
                </p>
              </div>
            </a>

            {/* GoFundMe Community Campaign */}
            <a
              href={DONATE_LINKS.gofundme}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl border flex items-start gap-4 transition-all hover:border-[var(--ed-accent)] group"
              style={{
                borderColor: 'var(--ed-rule)',
                backgroundColor: 'var(--ed-surface)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-bg)',
                }}
              >
                <HeartHandshake className="size-6 text-[#02a95c]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-base text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors">
                    {t('gofundme')}
                  </h3>
                  <ArrowUpRight size={16} className="text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p
                  className="text-sm text-[var(--ed-fg-muted)] leading-relaxed"
                  style={{ fontFamily: F.serif }}
                >
                  {t('gofundmeDesc')}
                </p>
              </div>
            </a>
          </div>

          {/* Manage Subscription Self-Service Banner */}
          <div
            className="mt-6 rounded-2xl border p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5"
            style={{
              borderColor: 'var(--ed-rule)',
              backgroundColor: 'var(--ed-bg-alt)',
            }}
          >
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--ed-accent)] mb-1">
                <RefreshCw size={14} />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--ed-fg)]"
                  style={{ fontFamily: F.glacial }}
                >
                  Manage Giving
                </span>
              </div>
              <h3
                className="text-lg sm:text-xl font-medium tracking-tight text-[var(--ed-fg)]"
                style={{ fontFamily: F.display }}
              >
                {t('manageBannerTitle')}
              </h3>
              <p
                className="text-xs sm:text-sm text-[var(--ed-fg-muted)] max-w-xl leading-relaxed"
                style={{ fontFamily: F.serif }}
              >
                {t('manageBannerDesc')}
              </p>
            </div>

            <Link
              href="/donate/manage"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-xs border transition-all shrink-0 hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]"
              style={{
                borderColor: 'var(--ed-rule)',
                backgroundColor: 'var(--ed-surface)',
                color: 'var(--ed-fg)',
                fontFamily: F.serif,
              }}
            >
              <span>{t('manageBannerCta')}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        {/* Illuminated Scripture Callout (Quran 2:261) */}
        <section className="mb-20 sm:mb-28">
          <div
            className="rounded-2xl border p-8 sm:p-12 relative overflow-hidden shadow-sm flex flex-col gap-8"
            style={{
              borderColor: 'var(--ed-rule)',
              backgroundColor: 'var(--ed-surface)',
            }}
          >
            {/* Header: Label and Reference */}
            <div
              className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: 'var(--ed-accent)',
                    color: 'var(--ed-bg)',
                    fontFamily: F.glacial,
                  }}
                >
                  Scripture
                </span>
                <span
                  className="text-xs font-mono font-semibold tracking-wider text-[var(--ed-fg-muted)] uppercase"
                  style={{ fontFamily: F.mono }}
                >
                  {t('scriptureRef')}
                </span>
              </div>
              <span
                className="text-xs font-mono text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.mono }}
              >
                2:261 · Chapter 2 (The Heifer)
              </span>
            </div>

            {/* Arabic text: strictly right-aligned with dir="rtl" */}
            <div
              dir="rtl"
              className="font-arabic text-right text-2xl sm:text-3xl md:text-4xl font-normal leading-[2.2] tracking-normal"
              style={{
                fontFamily: 'var(--font-amiri), var(--font-arabic), "Amiri", "Scheherazade New", serif',
                color: 'var(--ed-fg)',
                wordSpacing: '0.12em',
              }}
            >
              {t('scriptureArabic')}
            </div>

            {/* English translation: refined serif typography matching full width */}
            <div
              className="pt-6 border-t"
              style={{ borderColor: 'var(--ed-rule)' }}
            >
              <p
                className="w-full text-lg sm:text-xl md:text-2xl leading-relaxed text-[var(--ed-fg)]"
                style={{
                  fontFamily: F.serif,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color: 'var(--ed-accent)',
                    marginRight: 4,
                  }}
                >
                  &ldquo;
                </span>
                {t.rich('verse2261', {
                  highlight: (chunks) => (
                    <span
                      className="inline rounded px-1 py-0.5 font-medium"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--ed-accent) 14%, transparent)',
                        color: 'var(--ed-fg)',
                        borderBottom: '1.5px solid var(--ed-accent)',
                      }}
                    >
                      {chunks}
                    </span>
                  ),
                })}
                <span
                  aria-hidden
                  style={{
                    color: 'var(--ed-accent)',
                    marginLeft: 2,
                  }}
                >
                  &rdquo;
                </span>
              </p>
              <p
                className="mt-3 text-xs font-mono text-[var(--ed-fg-muted)] tracking-wider uppercase"
                style={{ fontFamily: F.mono }}
              >
                Authorized English Translation · Rashad Khalifa, Ph.D.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency & Stewardship Allocation */}
        <section className="mb-24 sm:mb-32">
          <SectionDivider
            num="01"
            title={t('allocationHeading')}
            sub={t('allocationSub')}
          />

          <div className="divide-y" style={{ borderColor: 'var(--ed-rule)' }}>
            {/* Pillar 01 */}
            <div className="py-10 sm:py-14 first:pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold text-[var(--ed-accent)] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: 'var(--ed-rule)',
                        backgroundColor: 'var(--ed-surface)',
                        fontFamily: F.mono,
                      }}
                    >
                      01
                    </span>
                    <div className="flex items-center gap-1.5 text-[var(--ed-accent)]">
                      <Server size={14} />
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest text-[var(--ed-fg-muted)]"
                        style={{ fontFamily: F.glacial }}
                      >
                        Core Infrastructure
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                    style={{ fontFamily: F.display }}
                  >
                    {t('alloc1Title')}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Global Edge CDN', 'Zero Downtime', '24/7 Redundancy'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-mono border text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]"
                        style={{ borderColor: 'var(--ed-rule)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 lg:pt-2">
                  <p
                    className="text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t('alloc1Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="py-10 sm:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold text-[var(--ed-accent)] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: 'var(--ed-rule)',
                        backgroundColor: 'var(--ed-surface)',
                        fontFamily: F.mono,
                      }}
                    >
                      02
                    </span>
                    <div className="flex items-center gap-1.5 text-[var(--ed-accent)]">
                      <Code2 size={14} />
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest text-[var(--ed-fg-muted)]"
                        style={{ fontFamily: F.glacial }}
                      >
                        Tooling & Code
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                    style={{ fontFamily: F.display }}
                  >
                    {t('alloc2Title')}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Word Lab & Roots', 'Code 19 Engine', 'Open Concordance'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-mono border text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]"
                        style={{ borderColor: 'var(--ed-rule)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 lg:pt-2">
                  <p
                    className="text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t('alloc2Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="py-10 sm:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold text-[var(--ed-accent)] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: 'var(--ed-rule)',
                        backgroundColor: 'var(--ed-surface)',
                        fontFamily: F.mono,
                      }}
                    >
                      03
                    </span>
                    <div className="flex items-center gap-1.5 text-[var(--ed-accent)]">
                      <Globe2 size={14} />
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest text-[var(--ed-fg-muted)]"
                        style={{ fontFamily: F.glacial }}
                      >
                        Preservation
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                    style={{ fontFamily: F.display }}
                  >
                    {t('alloc3Title')}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Certified Editions', 'Audio Mastering', 'Recitation Archives'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-mono border text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]"
                        style={{ borderColor: 'var(--ed-rule)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 lg:pt-2">
                  <p
                    className="text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t('alloc3Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 04 */}
            <div className="py-10 sm:py-14 last:pb-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold text-[var(--ed-accent)] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: 'var(--ed-rule)',
                        backgroundColor: 'var(--ed-surface)',
                        fontFamily: F.mono,
                      }}
                    >
                      04
                    </span>
                    <div className="flex items-center gap-1.5 text-[var(--ed-accent)]">
                      <Lock size={14} />
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest text-[var(--ed-fg-muted)]"
                        style={{ fontFamily: F.glacial }}
                      >
                        Integrity & Charter
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                    style={{ fontFamily: F.display }}
                  >
                    {t('alloc4Title')}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['100% Free Forever', 'Zero Monetization', 'No Paywalls'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-mono border text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]"
                        style={{ borderColor: 'var(--ed-rule)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 lg:pt-2">
                  <p
                    className="text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t('alloc4Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="mb-20 sm:mb-28">
          <SectionDivider
            num="02"
            title={t('faqHeading')}
            sub="Essential Information & Stewardship"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            {/* Left sidebar: Context & Direct Contact */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
              <div className="space-y-2.5">
                <h3
                  className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--ed-fg)]"
                  style={{ fontFamily: F.display }}
                >
                  Clear answers for thoughtful donors.
                </h3>
                <p
                  className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                  style={{ fontFamily: F.serif }}
                >
                  WikiSubmission is stewarded with financial discipline and zero commercialization.
                </p>
              </div>

              <div
                className="p-5 rounded-xl border space-y-3"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-surface)',
                }}
              >
                <div className="flex items-center gap-2 text-[var(--ed-accent)]">
                  <Mail size={15} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider text-[var(--ed-fg)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    Direct Inquiries
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                  Have questions regarding tax receipts, corporate matching, or donor privacy?
                </p>
                <a
                  href={`mailto:${About.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--ed-accent)] hover:underline"
                >
                  <span>{About.email}</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>

            {/* Right column: Linear divided FAQ list */}
            <div className="lg:col-span-8 divide-y" style={{ borderColor: 'var(--ed-rule)' }}>
              {/* FAQ 1 */}
              <div className="py-6 first:pt-0 space-y-2">
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold text-[var(--ed-accent)] pt-1 shrink-0"
                    style={{ fontFamily: F.mono }}
                  >
                    01
                  </span>
                  <div className="space-y-2">
                    <h4
                      className="text-lg font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq1Q')}
                    </h4>
                    <p
                      className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq1A')}
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="py-6 space-y-2">
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold text-[var(--ed-accent)] pt-1 shrink-0"
                    style={{ fontFamily: F.mono }}
                  >
                    02
                  </span>
                  <div className="space-y-2">
                    <h4
                      className="text-lg font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq2Q')}
                    </h4>
                    <p
                      className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq2A')}{' '}
                      <Link
                        href="/donate/manage"
                        className="text-[var(--ed-accent)] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Access the manage portal</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="py-6 space-y-2">
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold text-[var(--ed-accent)] pt-1 shrink-0"
                    style={{ fontFamily: F.mono }}
                  >
                    03
                  </span>
                  <div className="space-y-2">
                    <h4
                      className="text-lg font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq3Q')}
                    </h4>
                    <p
                      className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq3A')}
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 4 */}
              <div className="py-6 last:pb-0 space-y-2">
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold text-[var(--ed-accent)] pt-1 shrink-0"
                    style={{ fontFamily: F.mono }}
                  >
                    04
                  </span>
                  <div className="space-y-2">
                    <h4
                      className="text-lg font-medium text-[var(--ed-fg)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq4Q')}
                    </h4>
                    <p
                      className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
                      style={{ fontFamily: F.serif }}
                    >
                      {t('faq4A')}{' '}
                      <a
                        href={`mailto:${About.email}`}
                        className="text-[var(--ed-accent)] hover:underline font-medium"
                      >
                        {About.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
