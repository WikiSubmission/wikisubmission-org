'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Calendar,
  Clock,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react'
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

export function JournalSection({ articles }: { articles: Article[] }) {
  const t = useTranslations('homePage.journal')
  if (articles.length === 0) return null

  // Display the 4 articles
  const displayArticles = articles.slice(0, 4)

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        paddingTop: 'clamp(56px, 7vw, 80px)',
        paddingBottom: 'clamp(36px, 4.5vw, 48px)',
      }}
      className="relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 800px 450px at 50% 20%, rgba(209,166,74,0.025) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 600px 350px at 80% 80%, rgba(209,166,74,0.015) 0%, transparent 70%)',
        }}
      />

      <div className="px-4 sm:px-6 md:px-10 max-w-[1240px] mx-auto">
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── 4-Article Balanced Editorial Grid ───────────────────────────── */}
        <StaggerContainer
          stagger={0.07}
          delay={0.05}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {displayArticles.map((article, index) => {
            const indexLabel = (index + 1).toString().padStart(2, '0')
            return (
              <Link
                key={article._id}
                href={`/blog/${article.slug?.current}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-5 sm:p-5.5 shadow-sm hover:shadow-xl hover:border-primary/40 hover:bg-card transition-all duration-300 no-underline"
              >
                <div>
                  {/* Thumbnail Plate */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-4 border border-border/60 bg-muted shadow-sm">
                    {article.thumbnailUrl ? (
                      <>
                        <Image
                          src={article.thumbnailUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/40 gap-1.5">
                        <BookOpen size={24} />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Article {indexLabel}</span>
                      </div>
                    )}

                    {/* Category pill on thumbnail */}
                    {article.category && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[4px] text-[9px] font-mono font-semibold tracking-wider uppercase shadow-md backdrop-blur-md bg-background/85 border border-border/70 text-primary">
                        {article.category}
                      </div>
                    )}
                  </div>

                  {/* Index & Category Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      style={{ fontFamily: F.mono }}
                      className="text-[10px] font-semibold tracking-[0.14em] uppercase text-primary"
                    >
                      Article {indexLabel}
                    </span>

                    <span
                      style={{ fontFamily: F.mono }}
                      className="text-[10px] text-muted-foreground/70 flex items-center gap-1"
                    >
                      <Clock size={11} className="text-primary/70" />
                      <span>{estimateReadingTime(article.excerpt)}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: F.display,
                      fontSize: 'clamp(18px, 2.4vw, 20.5px)',
                      fontWeight: 600,
                      lineHeight: 1.25,
                      letterSpacing: '-0.015em',
                    }}
                    className="text-foreground group-hover:text-primary transition-colors duration-200 mb-2.5 line-clamp-2"
                  >
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p
                      style={{
                        fontFamily: F.serif,
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                      }}
                      className="text-muted-foreground line-clamp-2 m-0"
                    >
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {/* Card Footer with Date, Author & Read Link */}
                <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center justify-between font-mono text-[11px] gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0 truncate">
                    {article.authorName && (
                      <span className="font-medium text-foreground text-[11px] truncate">
                        {article.authorName}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="flex items-center gap-1 text-muted-foreground/70 text-[10px]">
                        <Calendar size={10} className="opacity-60 text-primary" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Read</span>
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </Link>
            )
          })}
        </StaggerContainer>

        {/* ── Bottom Archive Navigation Row ────────────────────────────────── */}
        <div className="mt-8 pt-5 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Archival Monographs &amp; Research Notes</span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            <span>{t('allWriting')}</span>
            <Arrow size={12} />
          </Link>
        </div>
      </div>
    </section>
  )
}
