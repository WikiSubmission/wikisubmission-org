'use client'

import React, { Children, useMemo, type ReactNode } from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { ScriptureText } from '@/components/scripture-text'
import { sanitizeUrl } from '@/lib/safe-url'
import type { BlogPost, RelatedBlogPost } from '@/lib/blog-queries'
import { BlogReadingProgressBar } from './blog-reading-progress-bar'
import { EditorialHeader } from './editorial-header'
import { EditorialToc, type ArticleHeading } from './editorial-toc'
import { EditorialAside } from './editorial-aside'
import { EditorialReader } from './editorial-reader'
import { EditorialRightRuler } from './editorial-right-ruler'

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function countWords(body?: PortableTextBlock[]): number {
  if (!body) return 0
  const text = body
    .flatMap((block) => (block as { children?: { text?: string }[] }).children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

function calculateReadingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200))
}

function getPlainText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return children.toString()
  if (Array.isArray(children)) return children.map(getPlainText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return getPlainText((children as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractHeadings(body?: PortableTextBlock[]): ArticleHeading[] {
  if (!body) return []
  const headings: ArticleHeading[] = []

  for (const block of body) {
    const style = (block as { style?: string }).style
    if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4') {
      const level = style === 'h1' ? 1 : style === 'h2' ? 2 : style === 'h3' ? 3 : 4
      const children = (block as { children?: { text?: string }[] }).children ?? []
      const text = children.map((c) => c.text ?? '').join('').trim()
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level,
        })
      }
    }
  }

  return headings
}

/**
 * Editorial Article view modeled directly after Making Software (https://www.makingsoftware.com/chapters/how-a-screen-works):
 * - Wide physical page sheet with tactile drop shadow
 * - Left Rail: Back link, In-Article Table of Contents (TOC), Article Provenance certificate,
 *   and Split Related Articles ("Other Articles From Same Author" & "Other Articles")
 * - Center: Wide page-long reading sheet with generous book margins and top toolbar
 * - Right Rail: Technical calibration ruler with 0.00 scroll tracking and ticks
 */
export function BlogPostArticle({
  post,
  related = [],
  authorArticles = [],
  otherArticles = [],
  allBlogs = [],
  backHref = '/blog',
  hrefForRelated = (slug: string) => `/blog/${slug}`,
}: {
  post: BlogPost
  related?: RelatedBlogPost[]
  authorArticles?: RelatedBlogPost[]
  otherArticles?: RelatedBlogPost[]
  allBlogs?: RelatedBlogPost[]
  backHref?: string
  hrefForRelated?: (slug: string) => string
}) {
  const title = post.title?.trim() || 'Untitled article'
  const publishedRelated = related.filter((relatedPost) => relatedPost.slug?.current)
  const scriptureRefsEnabled = post.enableScriptureRefs ?? true
  const portableTextComponents = useMemo(
    () => buildPortableTextComponents(scriptureRefsEnabled),
    [scriptureRefsEnabled]
  )
  const articleBodyId = 'blog-article-body'

  const words = useMemo(() => countWords(post.body), [post.body])
  const readingMinutes = useMemo(() => calculateReadingMinutes(words), [words])
  const headings = useMemo(() => extractHeadings(post.body), [post.body])

  // Fallback for split related articles
  const finalAuthorArticles = authorArticles.length > 0 ? authorArticles : publishedRelated.slice(0, 3)
  const finalOtherArticles = otherArticles.length > 0 ? otherArticles : (authorArticles.length > 0 ? publishedRelated.slice(0, 3) : [])

  // Previous & next post for the top toolbar navigation
  const prevPost = publishedRelated[0]
  const nextPost = publishedRelated[1]

  return (
    <div className="relative min-h-screen bg-[#ECE4D5] dark:bg-[#0C0A09] text-[var(--ed-fg)] font-[family-name:var(--font-source-serif)] pb-28 antialiased selection:bg-[var(--ed-accent-soft)] selection:text-[var(--ed-fg)]">
      <BlogReadingProgressBar targetId={articleBodyId} />

      <main id="main-content" className="mx-auto max-w-[1760px] px-3 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-x-6 xl:gap-x-10 lg:grid-cols-[18.5rem_minmax(0,1fr)_3rem] xl:grid-cols-[20.5rem_minmax(0,1fr)_3.5rem]">
          
          {/* ── Left Sidebar: Back Link, TOC, Article Provenance, and Split Related Articles ── */}
          <aside className="hidden lg:block lg:sticky lg:top-[84px] lg:mb-0 lg:max-h-[calc(100dvh-108px)] lg:self-start lg:overflow-y-auto lg:pb-8 pr-1 space-y-6">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 font-[family-name:var(--font-glacial)] font-semibold text-[11px] uppercase tracking-[0.14em] text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors"
            >
              <ArrowLeftIcon className="size-3.5 rtl-flip" />
              <span>All articles</span>
            </Link>

            {/* In-Article Table of Contents */}
            <EditorialToc headings={headings} />

            {/* Article Provenance & Split Related Articles (Moved to Left Side) */}
            <EditorialAside
              publishedAt={post.publishedAt}
              updatedAt={post.updatedAt}
              readingMinutes={readingMinutes}
              wordCount={words}
              category={post.category}
              authorName={post.authorName}
              authorArticles={finalAuthorArticles}
              otherArticles={finalOtherArticles}
            />
          </aside>

          {/* ── Center: The Generous Wide Reading Sheet ─────────────────────────────── */}
          <div className="min-w-0 w-full">
            <EditorialReader
              header={
                <EditorialHeader
                  title={title}
                  excerpt={post.excerpt}
                  category={post.category}
                  authorName={post.authorName}
                  wordCount={words}
                  readingMinutes={readingMinutes}
                />
              }
              title={title}
              prevSlug={prevPost?.slug?.current}
              nextSlug={nextPost?.slug?.current}
              backHref={backHref}
            >
              {/* Cover image if available */}
              {post.thumbnailUrl && (
                <div className="mb-10 rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-black/5 dark:bg-white/5 shadow-xs">
                  <Image
                    src={post.thumbnailUrl}
                    alt={title}
                    width={1200}
                    height={675}
                    sizes="(max-width: 1080px) 100vw, 1080px"
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
              )}

              {/* Article Body Content */}
              <div id={articleBodyId} className="space-y-6 text-[var(--ed-fg)]">
                {post.body?.length ? (
                  <PortableText value={post.body} components={portableTextComponents} />
                ) : (
                  <p className="text-sm font-[family-name:var(--font-source-serif)] text-[var(--ed-fg-muted)]">
                    This article does not have any body content yet.
                  </p>
                )}
              </div>

              {/* Article Footer Signature / Share-back */}
              <div className="mt-14 pt-8 border-t border-[var(--ed-rule)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] text-[var(--ed-accent)] hover:underline self-start sm:self-auto"
                >
                  <ArrowLeftIcon className="size-3.5 rtl-flip" /> All articles
                </Link>

                <div className="flex items-center gap-3">
                  {post.authorPhotoUrl && (
                    <Image
                      src={post.authorPhotoUrl}
                      alt={post.authorName ?? ''}
                      width={26}
                      height={26}
                      className="rounded-full object-cover shrink-0 border border-[var(--ed-rule)]"
                    />
                  )}
                  <div>
                    {post.authorName && (
                      <div className="text-xs font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[var(--ed-fg)]">
                        {post.authorName}
                      </div>
                    )}
                    {post.publishedAt && (
                      <div className="text-[11px] font-[family-name:var(--font-jetbrains)] text-[var(--ed-fg-muted)]">
                        {formatDate(post.publishedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </EditorialReader>

            {/* Mobile-only view of Provenance and Related Articles (< lg) */}
            <div className="block lg:hidden mt-10">
              <EditorialAside
                publishedAt={post.publishedAt}
                updatedAt={post.updatedAt}
                readingMinutes={readingMinutes}
                wordCount={words}
                category={post.category}
                authorName={post.authorName}
                authorArticles={finalAuthorArticles}
                otherArticles={finalOtherArticles}
              />
            </div>
          </div>

          {/* ── Right Sidebar: The Technical Calibration Ruler (Making Software style) ── */}
          <aside className="hidden lg:flex lg:sticky lg:top-[84px] lg:self-start justify-end w-full pt-1">
            <EditorialRightRuler headings={headings} targetId={articleBodyId} />
          </aside>
        </div>

        {/* ── Bottom Section: More from the Archive (All Blogs) ───────── */}
        {(() => {
          const archiveBlogs = allBlogs.length > 0 ? allBlogs : publishedRelated
          if (archiveBlogs.length === 0) return null

          return (
            <section className="mt-24 pt-16 border-t border-[var(--ed-rule)] max-w-[1600px] mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <span className="inline-block text-[10px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.2em] text-[var(--ed-accent)] mb-2">
                  Explore The Collection
                </span>
                <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(28px,3.2vw,42px)] font-semibold tracking-[-0.02em] leading-[1.1] text-[var(--ed-fg)]">
                  More from the Archive
                </h2>
                <p className="mt-2 text-sm font-[family-name:var(--font-source-serif)] text-[var(--ed-fg-muted)]">
                  Browse all published monographs, studies, and community articles.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {archiveBlogs.map((relatedPost) => (
                  <Link
                    key={relatedPost._id}
                    href={hrefForRelated(relatedPost.slug?.current || '')}
                    className="group flex flex-col bg-[var(--ed-surface)] rounded-xl border border-[var(--ed-rule)] overflow-hidden transition-all hover:border-[var(--ed-accent)] hover:shadow-lg"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--ed-bg)]">
                      {relatedPost.thumbnailUrl ? (
                        <Image
                          src={relatedPost.thumbnailUrl}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-6 text-center text-xs font-[family-name:var(--font-cormorant)] text-[var(--ed-fg-muted)] bg-[var(--ed-surface)]">
                          {relatedPost.category || 'Article'}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {relatedPost.category && (
                          <span className="text-[10px] font-[family-name:var(--font-glacial)] font-bold uppercase tracking-[0.14em] text-[var(--ed-accent)] mb-1 block">
                            {relatedPost.category}
                          </span>
                        )}
                        <h3 className="font-[family-name:var(--font-cormorant)] text-[18px] font-semibold tracking-[-0.01em] leading-snug text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors">
                          {relatedPost.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--ed-rule)]/60 text-xs font-[family-name:var(--font-jetbrains)] text-[var(--ed-fg-muted)]">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        {relatedPost.authorName && (
                          <span className="font-sans text-[11px] font-medium text-[var(--ed-fg)]">{relatedPost.authorName}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })()}
      </main>
    </div>
  )
}

function wrapStringChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child, i) =>
    typeof child === 'string' ? (
      <ScriptureText key={i} text={child} from="blog post" />
    ) : (
      child
    )
  )
}

const CALLOUT_TONES: Record<string, string> = {
  info: 'border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[var(--ed-fg)]',
  tip: 'border-[var(--ed-accent)]/40 bg-[var(--ed-accent)]/10 text-[var(--ed-fg)]',
  warning: 'border-amber-500/40 bg-amber-500/10 text-[var(--ed-fg)]',
  danger: 'border-destructive/40 bg-destructive/10 text-[var(--ed-fg)]',
}

interface RichTableValue {
  rows?: Array<{ cells?: Array<{ content?: unknown[] }> }>
  columnHeaders?: Array<{ title?: string }>
  hasRowTitles?: boolean
}

function buildPortableTextComponents(scriptureRefsEnabled: boolean) {
  const renderText = (children: ReactNode) =>
    scriptureRefsEnabled ? wrapStringChildren(children) : children

  return {
    block: {
      normal: ({ children }: { children?: ReactNode }) => (
        <p className="mb-6 leading-[1.75] text-[18.5px] text-[var(--ed-fg)] break-words [overflow-wrap:anywhere]">
          {renderText(children)}
        </p>
      ),
      h1: ({ children, value }: { children?: ReactNode; value?: PortableTextBlock }) => {
        const text = getPlainText(children)
        const id = slugify(text)
        return (
          <h1
            id={id}
            className="font-[family-name:var(--font-cormorant)] text-[34px] sm:text-[38px] mt-12 mb-4 font-semibold tracking-[-0.02em] leading-[1.15] text-[var(--ed-fg)] break-words [overflow-wrap:anywhere]"
          >
            {renderText(children)}
          </h1>
        )
      },
      h2: ({ children, value }: { children?: ReactNode; value?: PortableTextBlock }) => {
        const text = getPlainText(children)
        const id = slugify(text)
        return (
          <h2
            id={id}
            className="font-[family-name:var(--font-cormorant)] text-[28px] sm:text-[32px] mt-10 mb-3 font-semibold tracking-[-0.02em] leading-[1.18] text-[var(--ed-fg)] break-words [overflow-wrap:anywhere]"
          >
            {renderText(children)}
          </h2>
        )
      },
      h3: ({ children, value }: { children?: ReactNode; value?: PortableTextBlock }) => {
        const text = getPlainText(children)
        const id = slugify(text)
        return (
          <h3
            id={id}
            className="font-[family-name:var(--font-cormorant)] text-[22px] sm:text-[25px] mt-8 mb-2.5 font-semibold tracking-[-0.015em] leading-[1.2] text-[var(--ed-fg)] break-words [overflow-wrap:anywhere]"
          >
            {renderText(children)}
          </h3>
        )
      },
      h4: ({ children, value }: { children?: ReactNode; value?: PortableTextBlock }) => {
        const text = getPlainText(children)
        const id = slugify(text)
        return (
          <h4
            id={id}
            className="font-[family-name:var(--font-cormorant)] text-[19px] sm:text-[21px] mt-6 mb-2 font-semibold tracking-[-0.01em] text-[var(--ed-fg)] break-words [overflow-wrap:anywhere]"
          >
            {renderText(children)}
          </h4>
        )
      },
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="my-8 pl-6 border-l-2 border-[var(--ed-accent)] italic text-[20px] md:text-[22px] leading-[1.5] text-[var(--ed-fg-muted)] break-words [overflow-wrap:anywhere] bg-[var(--ed-surface)] py-3 rounded-r-lg">
          {renderText(children)}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: { children?: ReactNode }) => (
        <ul className="list-disc pl-6 mb-6 space-y-2 text-[18px] text-[var(--ed-fg)]">{children}</ul>
      ),
      number: ({ children }: { children?: ReactNode }) => (
        <ol className="list-decimal pl-6 mb-6 space-y-2 text-[18px] text-[var(--ed-fg)]">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }: { children?: ReactNode }) => (
        <li className="leading-[1.7] text-[18px] text-[var(--ed-fg)]">{renderText(children)}</li>
      ),
      number: ({ children }: { children?: ReactNode }) => (
        <li className="leading-[1.7] text-[18px] text-[var(--ed-fg)]">{renderText(children)}</li>
      ),
    },
    marks: {
      strong: ({ children }: { children?: ReactNode }) => (
        <strong className="font-bold text-[var(--ed-fg)]">{children}</strong>
      ),
      em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
      code: ({ children }: { children?: ReactNode }) => (
        <code className="font-[family-name:var(--font-jetbrains)] text-[0.88em] bg-[var(--ed-surface)] border border-[var(--ed-rule)] px-1.5 py-0.5 rounded text-[var(--ed-accent)]">
          {children}
        </code>
      ),
      underline: ({ children }: { children?: ReactNode }) => (
        <span className="underline underline-offset-4">{children}</span>
      ),
      strikeThrough: ({ children }: { children?: ReactNode }) => (
        <span className="line-through opacity-70">{children}</span>
      ),
      link: ({
        children,
        value,
      }: {
        children?: ReactNode
        value?: { href?: string; blank?: boolean }
      }) => {
        const safe = sanitizeUrl(value?.href)
        if (!safe) return <>{children}</>
        return (
          <a
            href={safe}
            target={value?.blank ? '_blank' : undefined}
            rel={value?.blank ? 'noopener noreferrer' : undefined}
            className="text-[var(--ed-accent)] underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {children}
          </a>
        )
      },
      citation: ({
        children,
        value,
      }: {
        children?: ReactNode
        value?: { source?: string; reference?: string; href?: string }
      }) => {
        const safe = value?.href ? sanitizeUrl(value.href) : undefined
        const display = value?.source || value?.reference
        return (
          <cite className="not-italic text-[var(--ed-fg)] border-b border-dotted border-[var(--ed-rule)] inline">
            {children}
            {display && (
              <sup className="ml-1 text-[11px] font-mono text-[var(--ed-accent)] font-semibold">
                {safe ? (
                  <a
                    href={safe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    [{display}]
                  </a>
                ) : (
                  `[${display}]`
                )}
              </sup>
            )}
          </cite>
        )
      },
    },
    types: {
      image: ({
        value,
      }: {
        value?: { url?: string; asset?: { url?: string }; caption?: string; alt?: string }
      }) => {
        const url = value?.url ?? value?.asset?.url
        if (!url) return null
        return (
          <figure className="my-10">
            <div className="rounded-xl overflow-hidden border border-[var(--ed-rule)] bg-[var(--ed-surface)]">
              <Image
                src={url}
                alt={value?.alt || value?.caption || ''}
                width={1200}
                height={675}
                sizes="(max-width: 820px) 100vw, 820px"
                className="w-full h-auto object-contain"
              />
            </div>
            {value?.caption && (
              <figcaption className="text-xs font-[family-name:var(--font-source-serif)] italic text-center text-[var(--ed-fg-muted)] mt-2.5">
                {value.caption}
              </figcaption>
            )}
          </figure>
        )
      },
      callout: ({
        value,
      }: {
        value?: { tone?: 'info' | 'tip' | 'warning' | 'danger'; content?: PortableTextBlock[] }
      }) => {
        const tone = value?.tone || 'info'
        const toneClass = CALLOUT_TONES[tone] || CALLOUT_TONES.info
        return (
          <aside className={`my-8 p-5 border rounded-xl shadow-sm ${toneClass}`}>
            {value?.content && (
              <PortableText
                value={value.content}
                components={buildPortableTextComponents(scriptureRefsEnabled)}
              />
            )}
          </aside>
        )
      },
      richTable: ({ value }: { value?: RichTableValue }) => {
        if (!value?.rows?.length) return null
        return (
          <div className="my-8 overflow-x-auto border border-[var(--ed-rule)] rounded-xl bg-[var(--ed-surface)]">
            <table className="w-full text-left text-sm font-[family-name:var(--font-source-serif)] border-collapse">
              {value.columnHeaders && (
                <thead>
                  <tr className="border-b border-[var(--ed-rule)] bg-[var(--ed-bg)]">
                    {value.columnHeaders.map((col, i) => (
                      <th
                        key={i}
                        className="p-3.5 font-[family-name:var(--font-glacial)] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ed-fg-muted)]"
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-[var(--ed-rule)]">
                {value.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[var(--ed-bg)]/50 transition-colors">
                    {row.cells?.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-3.5 text-[var(--ed-fg)]">
                        {cell.content && (
                          <PortableText
                            value={cell.content as PortableTextBlock[]}
                            components={buildPortableTextComponents(scriptureRefsEnabled)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      },
      verse: ({
        value,
      }: {
        value?: {
          chapter?: number
          verses?: string
          surahName?: string
          arabic?: string
          translation?: string
          body?: PortableTextBlock[]
        }
      }) => {
        return (
          <div className="my-8 p-6 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-xs transition-all">
            {value?.arabic && (
              <div
                dir="rtl"
                lang="ar"
                className="text-right font-[family-name:var(--font-amiri,serif)] text-[24px] sm:text-[27px] leading-[2.3] text-[var(--ed-fg)] mb-4 font-normal tracking-wide"
              >
                {value.arabic}
              </div>
            )}
            {value?.translation && (
              <div className="text-[17.5px] sm:text-[18.5px] leading-[1.75] text-[var(--ed-fg)] font-[family-name:var(--font-source-serif)] mb-3 italic">
                &ldquo;{value.translation}&rdquo;
              </div>
            )}
            {value?.body && !value?.translation && (
              <div className="italic text-[19px] leading-[1.6] text-[var(--ed-fg)] mb-3">
                <PortableText
                  value={value.body}
                  components={buildPortableTextComponents(scriptureRefsEnabled)}
                />
              </div>
            )}
            {(value?.chapter || value?.surahName) && (
              <div className="text-right font-[family-name:var(--font-glacial)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ed-accent)]">
                {value.surahName
                  ? `Surah ${value.surahName} (${value.chapter}:${value.verses ?? ''})`
                  : `Quran ${value.chapter}:${value.verses ?? ''}`}
              </div>
            )}
          </div>
        )
      },
    },
  }
}
