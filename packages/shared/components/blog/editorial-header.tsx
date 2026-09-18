'use client'

import React from 'react'

interface EditorialHeaderProps {
  title: string
  excerpt?: string
  category?: string
  authorName?: string
  wordCount?: number
  readingMinutes?: number
}

export function EditorialHeader({
  title,
  excerpt,
  category,
  authorName,
  wordCount = 0,
  readingMinutes = 1,
}: EditorialHeaderProps) {
  return (
    <header className="mb-10 text-center sm:mb-14 pt-2">
      {/* Category Kicker */}
      {category && (
        <div className="mb-4 inline-block font-[family-name:var(--font-glacial)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ed-accent)]">
          {category}
        </div>
      )}

      {/* Top Monospace Metadata Kicker: e.g. 1,450 WORDS | 7 MIN READ | AUTHOR */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.1em] text-[var(--ed-fg-muted)]">
        {wordCount > 0 && (
          <>
            <span>{wordCount.toLocaleString('en-US')} Words</span>
            <span className="text-[var(--ed-rule)]" aria-hidden="true">
              |
            </span>
          </>
        )}
        <span>{readingMinutes} Min Read</span>
        {authorName && (
          <>
            <span className="text-[var(--ed-rule)]" aria-hidden="true">
              |
            </span>
            <span className="text-[var(--ed-fg)] font-medium">{authorName}</span>
          </>
        )}
      </div>

      {/* Title in Cormorant Garamond */}
      <h1 className="mx-auto max-w-[34ch] font-[family-name:var(--font-cormorant)] text-[clamp(2.1rem,1.6rem+2.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--ed-fg)]">
        {title}
      </h1>

      {/* Subtitle / Standfirst */}
      {excerpt && (
        <p className="mx-auto mt-4 max-w-[46rem] font-[family-name:var(--font-source-serif)] text-[18.5px] md:text-[21px] italic leading-[1.48] text-[var(--ed-fg-muted)]">
          {excerpt}
        </p>
      )}

      {/* Minimal Centered Dashes Ornament matching SA */}
      <div
        aria-hidden="true"
        className="mx-auto mt-8 select-none font-[family-name:var(--font-jetbrains)] text-[12px] tracking-[0.25em] text-[var(--ed-fg-muted)] opacity-40"
      >
        ------
      </div>
    </header>
  )
}
