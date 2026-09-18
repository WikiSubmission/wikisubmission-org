'use client'

import { useState } from 'react'
import type { WordToken } from './featured-verses-data'

interface ScriptureWordViewProps {
  words: WordToken[]
  arabicFont: string
  monoFont: string
  serifFont: string
}

export function ScriptureWordView({
  words,
  arabicFont,
  monoFont,
  serifFont,
}: ScriptureWordViewProps) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)

  return (
    <div className="w-full">
      <div
        dir="rtl"
        className="
          flex flex-wrap items-stretch justify-start gap-2 sm:gap-2.5
          max-h-[280px] overflow-y-auto pr-1 select-none scrollbar-thin
        "
      >
        {words.map((word, idx) => {
          const isHovered = activeWordIndex === idx

          return (
            <div
              key={`${word.arabic}-${idx}`}
              onMouseEnter={() => setActiveWordIndex(idx)}
              onMouseLeave={() => setActiveWordIndex(null)}
              className={`
                group relative flex flex-col items-center justify-between
                px-2.5 py-2 rounded-[6px] transition-all duration-200 cursor-pointer
                border
                ${
                  word.isGod
                    ? 'border-[color-mix(in_oklab,var(--ed-accent),transparent_50%)] bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)] shadow-[0_2px_8px_rgba(192,138,45,0.15)]'
                    : isHovered
                    ? 'border-[var(--ed-fg)] bg-[color-mix(in_oklab,var(--ed-fg),transparent_94%)] shadow-sm -translate-y-0.5'
                    : 'border-[var(--ed-rule)] bg-[color-mix(in_oklab,var(--ed-bg),transparent_20%)] hover:border-[color-mix(in_oklab,var(--ed-fg),transparent_60%)]'
                }
              `}
            >
              {/* Arabic Token */}
              <span
                className={`
                  text-[1.28rem] sm:text-[1.4rem] leading-none mb-1.5 transition-colors
                  ${word.isGod ? 'text-[var(--ed-accent)] font-semibold' : 'text-[var(--ed-fg)]'}
                `}
                style={{
                  fontFamily: arabicFont,
                }}
              >
                {word.arabic}
              </span>

              {/* Transliteration */}
              <span
                dir="ltr"
                className="text-[9.5px] font-mono tracking-tight text-[var(--ed-fg-muted)] opacity-80"
                style={{ fontFamily: monoFont }}
              >
                {word.transliteration}
              </span>

              {/* English Meaning */}
              <span
                dir="ltr"
                className={`
                  text-[11px] mt-0.5 text-center font-medium
                  ${word.isGod ? 'text-[var(--ed-accent)] font-semibold' : 'text-[var(--ed-fg)]'}
                `}
                style={{ fontFamily: serifFont }}
              >
                {word.english}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--ed-fg-muted)] border-t border-[var(--ed-rule)] pt-2.5">
        <span style={{ fontFamily: monoFont }}>
          {words.length} WORDS • TAP ANY WORD FOR LEXICAL BREAKDOWN
        </span>
        <span className="text-[var(--ed-accent)] font-mono">
          ROOT & CONCORDANCE ENABLED
        </span>
      </div>
    </div>
  )
}
