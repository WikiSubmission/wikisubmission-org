import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, BookOpen, Compass, Landmark, Moon, Wallet } from 'lucide-react'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import { FadeUp } from '@/lib/motion'

type PracticeSlug = 'contact-prayers' | 'zakat' | 'ramadan' | 'hajj'

const PRACTICE_LINKS_DATA: {
  href: string
  slug?: PracticeSlug
  translationKey: string
  icon?: LucideIcon
}[] = [
  { href: '/practices', translationKey: 'practicesHub', icon: ArrowLeft },
  {
    href: '/practices/contact-prayers',
    slug: 'contact-prayers',
    translationKey: 'contactPrayersNav',
    icon: Compass,
  },
  {
    href: '/practices/zakat',
    slug: 'zakat',
    translationKey: 'zakatNav',
    icon: Wallet,
  },
  {
    href: '/practices/ramadan',
    slug: 'ramadan',
    translationKey: 'ramadanNav',
    icon: Moon,
  },
  {
    href: '/practices/hajj',
    slug: 'hajj',
    translationKey: 'hajjNav',
    icon: Landmark,
  },
]

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-2 h-2 rounded-full bg-[var(--ed-accent)]" />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ed-accent)]"
        style={{ fontFamily: F.glacial }}
      >
        {children}
      </span>
    </div>
  )
}

export function PracticeNav({ active }: { active: PracticeSlug }) {
  const t = useTranslations('practiceComponents')
  return (
    <nav
      className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-6 border-t"
      style={{ borderColor: 'var(--ed-rule)' }}
      aria-label="Practice pages"
    >
      {PRACTICE_LINKS_DATA.map((link) => {
        const isActive = link.slug === active
        const Icon = link.icon

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono border transition-all duration-300 active:translate-y-px"
            style={{
              borderColor: isActive ? 'var(--ed-accent)' : 'var(--ed-rule)',
              backgroundColor: isActive ? 'var(--ed-accent)' : 'var(--ed-surface)',
              color: isActive ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
              fontFamily: F.mono,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {Icon && <Icon size={13} className={isActive ? 'text-[var(--ed-bg)]' : 'text-[var(--ed-accent)]'} />}
            <span>{t(link.translationKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function RefList({ refs }: { refs?: string[] }) {
  if (!refs?.length) return null

  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {refs.map((ref) => (
        <QuranRef key={ref} reference={ref} />
      ))}
    </span>
  )
}

export function HeroGradient() {
  return (
    <>
      <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(circle_at_15%_20%,var(--ed-accent-soft),transparent_40%),radial-gradient(circle_at_85%_80%,color-mix(in_oklab,var(--ed-surface),transparent_60%),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-rule)]" />
    </>
  )
}

export function PracticeHero({
  active,
  eyebrow,
  title,
  description,
  children,
}: {
  active: PracticeSlug
  eyebrow: ReactNode
  title: ReactNode
  description: ReactNode
  children: ReactNode
}) {
  return (
    <section
      className="px-4 sm:px-6 md:px-10 border-b relative isolate overflow-hidden"
      style={{
        borderColor: 'var(--ed-rule)',
      }}
    >
      <HeroGradient />

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(56px, 10vw, 96px)',
          paddingBottom: 'clamp(32px, 6vw, 56px)',
        }}
      >
        <FadeUp distance={16} duration={0.65} className="lg:col-span-7 space-y-6">
          <SectionLabel>{eyebrow}</SectionLabel>
          <div className="space-y-4">
            <h1
              className="text-balance text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.02] tracking-tight text-[var(--ed-fg)]"
              style={{
                fontFamily: F.display,
                letterSpacing: '-0.035em',
              }}
            >
              {title}
            </h1>
            <p
              className="text-pretty text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)] max-w-2xl"
              style={{ fontFamily: F.serif }}
            >
              {description}
            </p>
          </div>
          <PracticeNav active={active} />
        </FadeUp>

        <FadeUp distance={16} duration={0.65} delay={0.12} className="lg:col-span-5">
          {children}
        </FadeUp>
      </div>
    </section>
  )
}

export function PracticeHeroPanel({
  icon: Icon,
  kicker,
  value,
  meta,
  items,
}: {
  icon: LucideIcon
  kicker: string
  value: ReactNode
  meta?: ReactNode
  items: ReactNode[]
}) {
  return (
    <aside
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{
        borderColor: 'var(--ed-rule)',
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      <div className="p-6 sm:p-7 border-b flex items-start justify-between gap-5 relative overflow-hidden" style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-bg)' }}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--ed-accent)]" />
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]" />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.glacial }}
            >
              {kicker}
            </p>
          </div>
          <p
            className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ed-fg)]"
            style={{ fontFamily: F.display }}
          >
            {value}
          </p>
          {meta && (
            <p className="text-xs text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
              {meta}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex shrink-0 items-center justify-center border text-[var(--ed-accent)]"
          style={{ borderColor: 'var(--ed-rule)', backgroundColor: 'var(--ed-surface)' }}
        >
          <Icon size={18} strokeWidth={1.7} />
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--ed-rule)' }}>
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[44px_1fr] sm:grid-cols-[48px_1fr] transition-colors hover:bg-[var(--ed-bg-alt)]"
          >
            <div
              className="flex items-center justify-center border-r text-[10px] font-mono text-[var(--ed-accent)] font-semibold"
              style={{ borderColor: 'var(--ed-rule)', fontFamily: F.mono }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="p-4 sm:p-4.5 text-xs sm:text-sm leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
              {item}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export function ReadingSection({
  label,
  title,
  children,
  className = '',
}: {
  label: ReactNode
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <FadeUp distance={16}>
      <article className={`space-y-6 sm:space-y-8 ${className}`}>
        <div className="space-y-3">
          <SectionLabel>{label}</SectionLabel>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
            style={{ fontFamily: F.display }}
          >
            {title}
          </h2>
        </div>
        <div
          className="space-y-5 text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          {children}
        </div>
      </article>
    </FadeUp>
  )
}

export function QuoteCallout({
  reference,
  children,
}: {
  reference: string
  children: ReactNode
}) {
  const t = useTranslations('practiceComponents')
  return (
    <figure
      className="rounded-2xl border p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-sm"
      style={{
        borderColor: 'var(--ed-rule)',
        borderLeftWidth: 4,
        borderLeftColor: 'var(--ed-accent)',
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      <blockquote
        className="text-base sm:text-lg md:text-xl font-medium italic leading-relaxed text-[var(--ed-fg)]"
        style={{ fontFamily: F.serif }}
      >
        <span className="text-[var(--ed-accent)] font-semibold mr-1">&ldquo;</span>
        {children}
        <span className="text-[var(--ed-accent)] font-semibold ml-0.5">&rdquo;</span>
      </blockquote>
      <figcaption className="flex flex-wrap items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--ed-rule)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--ed-accent)]" />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
          style={{ fontFamily: F.glacial }}
        >
          {t('sura')} {reference}
        </span>
        <QuranRef reference={reference} />
      </figcaption>
    </figure>
  )
}

export function VerseQuote({
  verseKey,
  label,
  text,
  className = '',
}: {
  verseKey: string
  label?: string
  text: string
  className?: string
}) {
  return (
    <article
      className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:border-[var(--ed-accent)] group shadow-sm ${className}`}
      style={{
        borderColor: 'var(--ed-rule)',
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--ed-rule)' }}>
          <span
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            <BookOpen size={13} strokeWidth={1.8} />
            {verseKey}
          </span>
          <QuranRef reference={verseKey} />
        </div>
        {label && (
          <h3
            className="text-lg sm:text-xl font-medium text-[var(--ed-fg)]"
            style={{ fontFamily: F.display }}
          >
            {label}
          </h3>
        )}
        <p
          className="text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </article>
  )
}

export function VerseGrid({
  label,
  title,
  description,
  verses,
}: {
  label: ReactNode
  title: ReactNode
  description: ReactNode
  verses: { vk: string; label?: string; tx: string }[]
}) {
  return (
    <section className="space-y-8">
      <FadeUp distance={16} className="space-y-3 max-w-3xl">
        <SectionLabel>{label}</SectionLabel>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          style={{ fontFamily: F.display }}
        >
          {title}
        </h2>
        <p
          className="text-base sm:text-lg leading-relaxed text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          {description}
        </p>
      </FadeUp>

      <div className="grid gap-5 md:grid-cols-2">
        {verses.map((verse, index) => (
          <FadeUp
            key={verse.vk}
            distance={14}
            delay={index * 0.04}
            className="h-full"
          >
            <VerseQuote
              verseKey={verse.vk}
              label={verse.label}
              text={verse.tx}
            />
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

export function FactGrid({
  items,
}: {
  items: {
    icon: LucideIcon
    title: string
    body: ReactNode
    refs?: string[]
  }[]
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <FadeUp key={item.title} distance={14} delay={index * 0.04}>
          <article
            className="rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[var(--ed-accent)] group shadow-sm h-full"
            style={{
              borderColor: 'var(--ed-rule)',
              backgroundColor: 'var(--ed-surface)',
            }}
          >
            <div className="space-y-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border text-[var(--ed-accent)] group-hover:bg-[var(--ed-accent)] group-hover:text-[var(--ed-bg)] transition-colors"
                style={{
                  borderColor: 'var(--ed-rule)',
                  backgroundColor: 'var(--ed-bg)',
                }}
              >
                <item.icon size={18} strokeWidth={1.7} />
              </div>
              <h3
                className="text-xl sm:text-2xl font-medium text-[var(--ed-fg)]"
                style={{ fontFamily: F.display }}
              >
                {item.title}
              </h3>
              <div className="text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                {item.body}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--ed-rule)' }}>
              <RefList refs={item.refs} />
            </div>
          </article>
        </FadeUp>
      ))}
    </div>
  )
}

export function NumberedPanel({ items }: { items: ReactNode[] }) {
  return (
    <ol
      className="rounded-2xl border overflow-hidden shadow-sm divide-y"
      style={{
        borderColor: 'var(--ed-rule)',
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className="grid grid-cols-[52px_1fr] sm:grid-cols-[64px_1fr] transition-colors hover:bg-[var(--ed-bg-alt)]"
        >
          <span
            className="flex items-center justify-center border-r text-xs font-mono font-bold text-[var(--ed-accent)]"
            style={{ borderColor: 'var(--ed-rule)', fontFamily: F.mono }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
            {item}
          </div>
        </li>
      ))}
    </ol>
  )
}
