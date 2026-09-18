'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, User, Sparkles } from 'lucide-react'
import type { RelatedBlogPost } from '@/lib/blog-queries'

interface EditorialAsideProps {
  publishedAt?: string
  updatedAt?: string
  readingMinutes?: number
  wordCount?: number
  category?: string
  authorName?: string
  authorArticles?: RelatedBlogPost[]
  otherArticles?: RelatedBlogPost[]
}

export function EditorialAside({
  publishedAt,
  updatedAt,
  readingMinutes = 1,
  wordCount = 0,
  category,
  authorName,
  authorArticles = [],
  otherArticles = [],
}: EditorialAsideProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const validAuthorArticles = authorArticles.filter((r) => r.slug?.current)
  const validOtherArticles = otherArticles.filter((r) => r.slug?.current)

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* ── 1. Archival Provenance Certificate Card ────────────────────────── */}
      <div className="rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--ed-rule)] pb-2.5">
          <span className="font-[family-name:var(--font-glacial)] font-semibold text-[10px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
            Article Provenance
          </span>
          <span className="rounded bg-[var(--ed-bg)] border border-[var(--ed-rule)] px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] font-bold tracking-[0.1em] text-[var(--ed-accent)]">
            VERIFIED
          </span>
        </div>

        <dl className="space-y-3 text-[13px]">
          {publishedAt && (
            <div>
              <dt className="font-[family-name:var(--font-glacial)] font-semibold text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
                Published
              </dt>
              <dd className="mt-0.5 text-[var(--ed-fg)] font-[family-name:var(--font-source-serif)] font-medium text-[13px]">
                {formatDate(publishedAt)}
              </dd>
            </div>
          )}

          {updatedAt && (
            <div>
              <dt className="font-[family-name:var(--font-glacial)] font-semibold text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
                Revised
              </dt>
              <dd className="mt-0.5 text-[var(--ed-fg)] font-[family-name:var(--font-source-serif)] font-medium text-[13px]">
                {formatDate(updatedAt)}
              </dd>
            </div>
          )}

          <div>
            <dt className="font-[family-name:var(--font-glacial)] font-semibold text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
              Length & Pace
            </dt>
            <dd className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--ed-fg)]">
              {readingMinutes} min read ({wordCount.toLocaleString('en-US')} words)
            </dd>
          </div>

          {category && (
            <div>
              <dt className="font-[family-name:var(--font-glacial)] font-semibold text-[9.5px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]">
                Category
              </dt>
              <dd className="mt-0.5">
                <span className="inline-block rounded px-2 py-0.5 bg-[var(--ed-bg)] border border-[var(--ed-rule)] text-[11px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[var(--ed-accent)]">
                  {category}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* ── 2. Other Articles From Same Author ─────────────────────────────── */}
      {validAuthorArticles.length > 0 && (
        <div className="rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 font-[family-name:var(--font-glacial)] font-semibold text-[10px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)] border-b border-[var(--ed-rule)] pb-2.5">
            <User className="size-3.5 text-[var(--ed-accent)]" />
            <span className="truncate">More From {authorName || 'Author'}</span>
          </div>
          <div className="space-y-2.5">
            {validAuthorArticles.slice(0, 4).map((rel) => (
              <Link
                key={rel._id}
                href={`/blog/${rel.slug?.current}`}
                className="group block p-2.5 rounded-lg border border-[var(--ed-rule)] bg-[var(--ed-bg)] hover:border-[var(--ed-accent)] transition-all"
              >
                <div className="font-[family-name:var(--font-cormorant)] font-semibold text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] line-clamp-2 transition-colors text-[14.5px] leading-snug">
                  {rel.title}
                </div>
                {rel.publishedAt && (
                  <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--ed-fg-muted)] mt-1">
                    {formatDate(rel.publishedAt)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Other Articles / Other Topics ──────────────────────────────── */}
      {validOtherArticles.length > 0 && (
        <div className="rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 font-[family-name:var(--font-glacial)] font-semibold text-[10px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)] border-b border-[var(--ed-rule)] pb-2.5">
            <Sparkles className="size-3.5 text-[var(--ed-accent)]" />
            <span>Other Articles</span>
          </div>
          <div className="space-y-2.5">
            {validOtherArticles.slice(0, 4).map((rel) => (
              <Link
                key={rel._id}
                href={`/blog/${rel.slug?.current}`}
                className="group block p-2.5 rounded-lg border border-[var(--ed-rule)] bg-[var(--ed-bg)] hover:border-[var(--ed-accent)] transition-all"
              >
                <div className="font-[family-name:var(--font-cormorant)] font-semibold text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] line-clamp-2 transition-colors text-[14.5px] leading-snug">
                  {rel.title}
                </div>
                {rel.publishedAt && (
                  <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--ed-fg-muted)] mt-1">
                    {formatDate(rel.publishedAt)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
