'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowUpRight, BookOpen, Calendar, Clock } from 'lucide-react'
import { F, SectionDivider, Arrow } from './shared'
import { StaggerContainer } from '@/lib/motion'

type Article = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
  authorName?: string
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadingTime(excerpt?: string) {
  const words = excerpt ? excerpt.split(/\s+/).length * 16 : 700
  return `${Math.max(3, Math.ceil(words / 200))} min read`
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--ed-fg-muted)]"
      style={{ fontFamily: F.mono }}
    >
      {article.authorName && (
        <span className="text-[var(--ed-fg)] font-medium">{article.authorName}</span>
      )}
      {article.authorName && article.publishedAt && (
        <span aria-hidden className="opacity-40">
          ·
        </span>
      )}
      {article.publishedAt && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={11} className="text-[var(--ed-accent)]" />
          <span>{formatDate(article.publishedAt)}</span>
        </span>
      )}
      <span aria-hidden className="opacity-40">
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock size={11} className="text-[var(--ed-accent)]" />
        <span>{estimateReadingTime(article.excerpt)}</span>
      </span>
    </div>
  )
}

function ArticleLabel({ index, category }: { index: number; category?: string }) {
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="px-2 py-0.5 rounded-[3px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)] border border-[color-mix(in_oklab,var(--ed-accent),transparent_80%)] text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
        style={{ fontFamily: F.mono }}
      >
        Monograph {indexLabel}
      </span>

      {category && (
        <>
          <span aria-hidden className="h-3 w-px bg-[var(--ed-rule)]" />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            {category}
          </span>
        </>
      )}
    </div>
  )
}

function LeadArticle({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug?.current}`}
      className="group block min-w-0 no-underline"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-xs">
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--ed-surface)] text-[var(--ed-fg-muted)]">
            <BookOpen size={30} strokeWidth={1.4} />
            <span
              className="text-[9.5px] uppercase tracking-[0.16em]"
              style={{ fontFamily: F.mono }}
            >
              Monograph 01
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
      </div>

      <div className="pt-5 sm:pt-6">
        <ArticleLabel index={0} category={article.category} />

        <h3
          className="mt-3.5 max-w-[28ch] text-[var(--ed-fg)] transition-colors duration-300 group-hover:text-[var(--ed-accent)]"
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(26px, 3.2vw, 36px)',
            fontWeight: 500,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
          }}
        >
          {article.title}
        </h3>

        {article.excerpt && (
          <p
            className="mt-3 max-w-[56ch] text-[var(--ed-fg-muted)] line-clamp-3"
            style={{
              fontFamily: F.serif,
              fontSize: '14.5px',
              lineHeight: 1.7,
            }}
          >
            {article.excerpt}
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-[var(--ed-rule)] flex items-center justify-between gap-3">
          <ArticleMeta article={article} />
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ed-accent)] group-hover:translate-x-1 transition-transform shrink-0"
            style={{ fontFamily: F.mono }}
          >
            <span>Read Monograph</span>
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function SecondaryArticleItem({
  article,
  index,
}: {
  article: Article
  index: number
}) {
  return (
    <Link
      href={`/blog/${article.slug?.current}`}
      className="
        group flex flex-col sm:flex-row gap-4 sm:gap-5 items-start
        p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-[8px]
        border border-transparent
        transition-all duration-200
        hover:border-[var(--ed-rule)]
        hover:bg-[color-mix(in_oklab,var(--ed-surface),transparent_40%)]
        no-underline
      "
    >
      <div className="relative aspect-[16/10] w-full sm:w-36 shrink-0 overflow-hidden rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-xs">
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, 150px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--ed-surface)] text-[var(--ed-fg-muted)]">
            <BookOpen size={20} strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <ArticleLabel index={index} category={article.category} />

        <h4
          className="mt-2 text-[var(--ed-fg)] transition-colors duration-200 group-hover:text-[var(--ed-accent)] line-clamp-2"
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(16px, 1.5vw, 18.5px)',
            fontWeight: 500,
            lineHeight: 1.28,
            letterSpacing: '-0.015em',
          }}
        >
          {article.title}
        </h4>

        {article.excerpt && (
          <p
            className="mt-1.5 text-[var(--ed-fg-muted)] line-clamp-2"
            style={{
              fontFamily: F.serif,
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            {article.excerpt}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <ArticleMeta article={article} />
          <ArrowUpRight
            size={13}
            className="text-[var(--ed-fg-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
          />
        </div>
      </div>
    </Link>
  )
}

export function JournalSection({ articles }: { articles: Article[] }) {
  const t = useTranslations('homePage.journal')
  if (!articles || articles.length === 0) return null

  const leadArticle = articles[0]
  const secondaryArticles = articles.slice(1, 4)

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg)',
        paddingTop: 'clamp(56px, 7vw, 80px)',
        paddingBottom: 'clamp(48px, 6vw, 64px)',
      }}
      className="relative overflow-hidden border-b border-[var(--ed-rule)] text-[var(--ed-fg)]"
    >
      <div className="px-4 sm:px-6 md:px-10 max-w-[1240px] mx-auto">
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── Subtitle / Editorial Context ── */}
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <p
            style={{ fontFamily: F.serif }}
            className="m-0 text-[15.5px] leading-relaxed text-[var(--ed-fg-muted)] max-w-[62ch]"
          >
            Theological monographs, linguistic inquiries, and reflective discourses published for continuous study.
          </p>
          <div className="inline-flex items-center gap-2 text-[10.5px] font-mono text-[var(--ed-accent)] uppercase tracking-wider shrink-0">
            <span className="size-1.5 rounded-full bg-[var(--ed-accent)] animate-pulse" />
            <span>Research &amp; Reflections</span>
          </div>
        </div>

        {/* ── Editorial Asymmetric Layout ── */}
        <StaggerContainer
          stagger={0.08}
          delay={0.05}
          className={`grid grid-cols-1 ${
            secondaryArticles.length > 0
              ? 'lg:grid-cols-[1.18fr_0.82fr] gap-8 lg:gap-12'
              : 'max-w-[760px] mx-auto'
          } items-start`}
        >
          {/* Lead / Hero Article */}
          <LeadArticle article={leadArticle} />

          {/* Secondary Articles Stack */}
          {secondaryArticles.length > 0 && (
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--ed-rule)] pt-6 lg:pt-0 lg:pl-10 space-y-2">
              {secondaryArticles.map((article, idx) => (
                <SecondaryArticleItem
                  key={article._id}
                  article={article}
                  index={idx + 1}
                />
              ))}
            </div>
          )}
        </StaggerContainer>

        {/* ── Bottom Archive Navigation Row ── */}
        <div className="mt-10 pt-5 border-t border-[var(--ed-rule)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ed-fg-muted)] uppercase tracking-widest">
            <span className="size-1.5 rounded-full bg-[var(--ed-accent)]" />
            <span>Complete Archival Monograph Collection</span>
          </div>

          <Link
            href="/blog"
            className="ed-btn-primary group inline-flex items-center gap-2 text-[13.5px] px-4 py-2"
            style={{ fontFamily: F.serif }}
          >
            <span>{t('allWriting')}</span>
            <Arrow size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
