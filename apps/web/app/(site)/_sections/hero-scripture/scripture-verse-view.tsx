'use client'

import type { FeaturedVerseData } from './featured-verses-data'

interface ScriptureVerseViewProps {
  verse: FeaturedVerseData
  arabicFont: string
  serifFont: string
}

function highlightTranslation(text: string, wordsToHighlight?: string[]) {
  if (!wordsToHighlight || wordsToHighlight.length === 0) {
    return text
  }

  // Regex to match highlighted words (e.g. GOD, GOD ALONE)
  const escaped = wordsToHighlight
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`\\b(${escaped})\\b`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    const isMatch = wordsToHighlight.some(
      (w) => w.toLowerCase() === part.toLowerCase(),
    )
    if (isMatch) {
      return (
        <span
          key={i}
          className="font-semibold"
          style={{
            color: 'var(--ed-accent)',
            textShadow: '0 1px 10px rgba(192, 138, 45, 0.3)',
          }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}

export function ScriptureVerseView({
  verse,
  arabicFont,
  serifFont,
}: ScriptureVerseViewProps) {
  return (
    <div className="w-full flex flex-col">
      {/* Calligraphic Arabic Presentation */}
      <div className="relative mb-5 sm:mb-6">
        <p
          dir="rtl"
          lang="ar"
          className="
            m-0 text-right
            text-[1.65rem] leading-[1.82]
            text-[var(--ed-fg)]
            sm:text-[1.95rem] select-text
          "
          style={{
            fontFamily: arabicFont,
          }}
        >
          {verse.arabic}
          <span
            className="inline-block mr-2 text-[var(--ed-accent)] text-[1.4rem] align-middle select-none opacity-90"
            aria-hidden
          >
            ۝
          </span>
        </p>
      </div>

      {/* Decorative Separator with Surah Metadata */}
      <div className="flex items-center gap-3 my-1 sm:my-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ed-rule)] to-transparent" />
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[var(--ed-fg-muted)] uppercase">
          <span>{verse.suraNameEn}</span>
          <span className="text-[var(--ed-accent)]">•</span>
          <span>{verse.suraMeaning}</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ed-rule)] to-transparent" />
      </div>

      {/* Editorial English Translation */}
      <blockquote
        className="
          m-0 mt-4 max-w-[62ch]
          text-[16.5px] sm:text-[18px]
          leading-[1.72]
          tracking-[-0.01em]
          text-[var(--ed-fg)]
          select-text
        "
        style={{
          fontFamily: serifFont,
        }}
      >
        &ldquo;{highlightTranslation(verse.translation, verse.highlightWords)}&rdquo;
      </blockquote>
    </div>
  )
}
