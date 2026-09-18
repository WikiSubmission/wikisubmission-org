'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  ArrowUpRight,
  Share2,
} from 'lucide-react'
import { FEATURED_VERSES, type FeaturedVerseData } from './featured-verses-data'
import { ScriptureAudioController } from './scripture-audio-controller'
import { ScriptureVerseView } from './scripture-verse-view'

const F = {
  arabic: 'var(--font-amiri), "Scheherazade New", serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  display: 'var(--font-cormorant), Georgia, serif',
}

export function HeroScriptureDeck() {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [, setIsPlayingAudio] = useState(false)

  // Dedicated hero verse: 2:62 (Universal Salvation)
  const activeVerse: FeaturedVerseData = FEATURED_VERSES[0]

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `"${activeVerse.translation}"\n— Quran ${activeVerse.suraNumber}:${activeVerse.verseNumber} (${activeVerse.suraNameEn})`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [activeVerse])

  const handleShare = useCallback(async () => {
    try {
      const url = `${window.location.origin}/quran/${activeVerse.suraNumber}?verse=${activeVerse.verseNumber}`
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShared(true)
        window.setTimeout(() => setShared(false), 2000)
      }
    } catch {
      setShared(false)
    }
  }, [activeVerse])

  return (
    <div className="relative w-full select-none">
      {/* Museum Glass Outer Card */}
      <div
        className="
          relative overflow-hidden rounded-[20px] sm:rounded-[24px]
          border border-[var(--ed-rule)]
          bg-[color-mix(in_oklab,var(--ed-surface),transparent_12%)]
          backdrop-blur-2xl
          shadow-[0_20px_50px_-12px_rgba(40,30,20,0.12),0_4px_16px_-4px_rgba(40,30,20,0.06)]
          dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.65)]
          transition-all duration-300
        "
      >
        {/* Top Gold Accent Hairline */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in oklab, var(--ed-accent), transparent 35%), transparent)',
          }}
        />

        {/* Scripture Exhibit Body */}
        <div className="p-6 sm:p-8">
          {/* Top Surah Metadata Row */}
          <div className="mb-5 sm:mb-6 flex items-center justify-between gap-3 border-b border-[color-mix(in_oklab,var(--ed-rule),transparent_40%)] pb-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="text-[10px] font-mono font-medium uppercase tracking-[0.18em] px-2 py-0.5 rounded-[2px]"
                style={{
                  color: 'var(--ed-accent)',
                  backgroundColor: 'color-mix(in oklab, var(--ed-accent), transparent 90%)',
                }}
              >
                {activeVerse.theme}
              </span>
              <span className="text-[10.5px] font-mono tracking-widest text-[var(--ed-fg-muted)] uppercase truncate">
                {activeVerse.ref}
              </span>
            </div>

            <div className="shrink-0 text-right">
              <span
                dir="rtl"
                className="text-base font-semibold text-[var(--ed-accent)]"
                style={{ fontFamily: F.arabic }}
              >
                {activeVerse.suraNameAr}
              </span>
            </div>
          </div>

          {/* Dedicated Verse 2:62 View */}
          <div className="min-h-[200px] flex items-center">
            <ScriptureVerseView
              verse={activeVerse}
              arabicFont={F.arabic}
              serifFont={F.serif}
            />
          </div>

          {/* Action & Reciter Bar */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ed-rule)] pt-4">
            {/* Audio Reciter Controller */}
            <ScriptureAudioController
              audioUrl={activeVerse.audioUrl}
              verseLabel={activeVerse.label}
              onPlayingChange={setIsPlayingAudio}
            />

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Copy Quote Button */}
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? 'Copied to clipboard' : 'Copy verse'}
                title="Copy verse text"
                className="
                  inline-flex items-center gap-1.5 px-2 py-1.5 rounded-[3px]
                  text-[10px] font-mono uppercase tracking-[0.14em]
                  text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]
                  transition-colors cursor-pointer
                "
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {/* Share Link Button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label={shared ? 'Link copied' : 'Share verse link'}
                title="Copy direct verse link"
                className="
                  inline-flex items-center gap-1.5 px-2 py-1.5 rounded-[3px]
                  text-[10px] font-mono uppercase tracking-[0.14em]
                  text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]
                  transition-colors cursor-pointer
                "
              >
                {shared ? (
                  <>
                    <Check size={12} className="text-[var(--ed-accent)]" />
                    <span className="text-[var(--ed-accent)]">Linked</span>
                  </>
                ) : (
                  <>
                    <Share2 size={12} />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>

              {/* Read in Context Link */}
              <Link
                href={`/quran/${activeVerse.suraNumber}?verse=${activeVerse.verseNumber}`}
                className="
                  group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px]
                  border border-[var(--ed-rule)] hover:border-[var(--ed-accent)]
                  bg-[color-mix(in_oklab,var(--ed-bg),transparent_20%)]
                  hover:bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)]
                  text-[10px] font-mono uppercase tracking-[0.14em]
                  text-[var(--ed-fg)] transition-all
                "
              >
                <span>Read Surah {activeVerse.suraNumber}</span>
                <ArrowUpRight
                  size={12}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[var(--ed-accent)]"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
