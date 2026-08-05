import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { QuranRef } from '@/components/quran-ref'
import { F } from '../../_sections/shared/server'
import { FadeUp } from '@/lib/motion'

type PracticeSlug = 'contact-prayers' | 'zakat' | 'ramadan' | 'hajj'

const PRACTICE_LINKS_DATA: { href: string; slug?: PracticeSlug; translationKey: string }[] = [
  { href: '/practices', translationKey: 'practicesHub' },
  {
    href: '/practices/contact-prayers',
    slug: 'contact-prayers',
    translationKey: 'contactPrayersNav',
  },
  { href: '/practices/zakat', slug: 'zakat', translationKey: 'zakatNav' },
  { href: '/practices/ramadan', slug: 'ramadan', translationKey: 'ramadanNav' },
  { href: '/practices/hajj', slug: 'hajj', translationKey: 'hajjNav' },
]

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="h-px w-10 bg-[var(--ed-accent)]" />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ed-accent)]"
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
      className="flex flex-wrap items-center gap-2 sm:gap-3 border-t border-[var(--ed-rule)] pt-6 sm:pt-8"
      aria-label="Practice pages"
    >
      {PRACTICE_LINKS_DATA.map((link) => {
        const isActive = link.slug === active
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex min-h-11 items-center gap-2 border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ease-out active:translate-y-px',
              isActive
                ? 'border-[var(--ed-accent)] bg-[var(--ed-accent)] text-[var(--ed-bg)]'
                : 'border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-fg-muted)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)]',
            ].join(' ')}
            style={{ fontFamily: F.glacial }}
          >
            {link.href === '/practices' && (
              <ArrowLeft size={13} strokeWidth={1.8} />
            )}
            {t(link.translationKey)}
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
    <section className="relative isolate overflow-hidden border-b border-[var(--ed-rule)]">
      <div className="absolute inset-0 -z-10 opacity-50 [background:radial-gradient(circle_at_15%_20%,var(--ed-accent-soft),transparent_40%),radial-gradient(circle_at_85%_80%,color-mix(in_oklab,var(--ed-surface),transparent_60%),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-rule)]" />
      
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-20 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] md:pb-24 md:pt-28 lg:gap-16">
        <FadeUp distance={16} duration={0.65} className="max-w-3xl space-y-8">
          <SectionLabel>{eyebrow}</SectionLabel>
          <div className="space-y-6">
            <h1
              className="max-w-4xl text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: F.display }}
            >
              {title}
            </h1>
            <p
              className="max-w-2xl text-pretty text-base leading-[1.7] text-[var(--ed-fg-muted)] sm:text-lg md:text-xl"
              style={{ fontFamily: F.serif }}
            >
              {description}
            </p>
          </div>
          <PracticeNav active={active} />
        </FadeUp>
        <FadeUp distance={16} duration={0.65} delay={0.12} className="md:mt-4">
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
    <aside className="border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-2 md:p-2.5">
      <div className="flex h-full flex-col border border-[var(--ed-rule)] bg-[var(--ed-bg)]">
        <div className="flex items-start justify-between gap-6 border-b border-[var(--ed-rule)] bg-[var(--ed-accent-soft)] p-6 sm:p-7 md:p-8">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[var(--ed-accent)]" />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.glacial }}
              >
                {kicker}
              </p>
            </div>
            <p
              className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
              style={{ fontFamily: F.display }}
            >
              {value}
            </p>
            {meta && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--ed-fg-muted)]">
                {meta}
              </p>
            )}
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-accent)]">
            <Icon size={20} strokeWidth={1.6} />
          </div>
        </div>

        <div className="flex flex-1 flex-col divide-y divide-[var(--ed-rule)]">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[44px_1fr] sm:grid-cols-[48px_1fr] transition-colors hover:bg-[var(--ed-surface)]"
            >
              <div
                className="flex items-center justify-center border-r border-[var(--ed-rule)] text-[10px] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.mono }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="p-4 sm:p-5 text-[15px] leading-relaxed text-[var(--ed-fg-muted)]">
                {item}
              </div>
            </div>
          ))}
        </div>
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
      <article className={`mx-auto max-w-4xl space-y-8 md:space-y-10 ${className}`}>
        <div className="space-y-5">
          <SectionLabel>{label}</SectionLabel>
          <h2
            className="text-balance text-2xl sm:text-3xl font-medium tracking-tight md:text-4xl"
            style={{ fontFamily: F.display }}
          >
            {title}
          </h2>
        </div>
        <div
          className="space-y-6 text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
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
    <figure className="relative border-l-[3px] border-[var(--ed-accent)] bg-[var(--ed-surface)]/30 p-6 sm:p-8 md:p-10">
      <blockquote
        className="text-pretty text-lg sm:text-xl md:text-2xl font-medium italic leading-[1.5] text-[var(--ed-fg)]"
        style={{ fontFamily: F.serif }}
      >
        &ldquo;{children}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex flex-wrap items-center gap-3">
        <span className="h-px w-8 bg-[var(--ed-accent)]" />
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
      className={`group h-full border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-5 sm:p-6 transition-all duration-300 ease-out hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-surface)]/40 ${className}`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <span
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ed-accent)]"
          style={{ fontFamily: F.glacial }}
        >
          <BookOpen size={14} strokeWidth={1.8} />
          {verseKey}
        </span>
        <QuranRef reference={verseKey} />
      </div>
      {label && (
        <h3
          className="mb-3 text-lg sm:text-xl font-medium text-[var(--ed-fg)]"
          style={{ fontFamily: F.display }}
        >
          {label}
        </h3>
      )}
      <p
        className="text-pretty text-base leading-[1.7] text-[var(--ed-fg-muted)] sm:text-lg"
        style={{ fontFamily: F.serif }}
      >
        &quot;{text}&quot;
      </p>
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
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24 lg:py-28">
      <FadeUp distance={16} className="mb-10 sm:mb-12 max-w-3xl space-y-5 sm:space-y-6">
        <SectionLabel>{label}</SectionLabel>
        <h2
          className="text-balance text-3xl sm:text-4xl font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: F.display }}
        >
          {title}
        </h2>
        <p
          className="text-pretty text-base sm:text-lg leading-[1.7] text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          {description}
        </p>
      </FadeUp>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
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
    <div className="grid gap-px border border-[var(--ed-rule)] bg-[var(--ed-rule)] md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <FadeUp key={item.title} distance={14} delay={index * 0.04}>
          <article className="group h-full bg-[var(--ed-bg)] p-6 transition-all duration-300 hover:bg-[var(--ed-surface)] sm:p-7">
            <item.icon
              size={22}
              className="mb-6 text-[var(--ed-accent)] transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1.7}
            />
            <h3
              className="text-xl sm:text-2xl font-medium"
              style={{ fontFamily: F.display }}
            >
              {item.title}
            </h3>
            <div className="mt-4 text-sm sm:text-base leading-[1.7] text-[var(--ed-fg-muted)]">
              {item.body}
            </div>
            <div className="mt-5">
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
    <ol className="divide-y divide-[var(--ed-rule)] border border-[var(--ed-rule)] bg-[var(--ed-bg)]">
      {items.map((item, index) => (
        <li
          key={index}
          className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] transition-colors hover:bg-[var(--ed-surface)]"
        >
          <span
            className="flex min-h-14 sm:min-h-16 items-center justify-center border-r border-[var(--ed-rule)] text-sm font-bold tabular-nums text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="px-4 sm:px-5 py-4 text-sm sm:text-base leading-[1.7] text-[var(--ed-fg-muted)]">
            {item}
          </div>
        </li>
      ))}
    </ol>
  )
}
