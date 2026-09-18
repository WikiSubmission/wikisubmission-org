'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  ArrowUpRight,
  Sparkles,
  Code2,
  CheckCircle2,
} from 'lucide-react'
import { FaApple, FaAndroid, FaGithub, FaDiscord } from 'react-icons/fa'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F, SectionDivider, Arrow } from './shared'
import { About } from '@/constants/about'

export function ToolsSection() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.tools')

  return (
    <section
      id="tools"
      className="relative overflow-hidden border-b border-[var(--ed-rule)] bg-[var(--ed-bg-alt)] text-[var(--ed-fg)]"
      style={{
        paddingTop: 'clamp(52px, 6vw, 76px)',
        paddingBottom: 'clamp(60px, 7vw, 88px)',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        {/* Section Divider */}
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* Section Headline & Editorial Kicker */}
        <div className="mb-10 sm:mb-12 max-w-[820px]">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-[color-mix(in_oklab,var(--ed-accent),transparent_75%)] bg-[color-mix(in_oklab,var(--ed-accent),transparent_94%)] text-[var(--ed-accent)] text-[11px] font-mono uppercase tracking-[0.16em] mb-3.5">
            <Code2 size={13} className="shrink-0" />
            <span>Open Ecosystem · Free Instruments & Data</span>
          </div>

          <h2
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--ed-fg)',
            }}
            className="m-0 mb-3"
          >
            Digital instruments for{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--ed-accent)',
                fontWeight: 400,
              }}
            >
              independent
            </em>{' '}
            study.
          </h2>

          <p
            style={{
              fontFamily: F.serif,
              fontSize: '15.5px',
              lineHeight: 1.7,
              color: 'var(--ed-fg-muted)',
            }}
            className="m-0 max-w-[65ch]"
          >
            Every software application, mobile edition, and scripture dataset engineered by WikiSubmission is 100% free, open-source, and ad-free. Built for uncompromised scholarship.
          </p>
        </div>

        {/* ── 2x2 Minimalist Instrument Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Module 01: Submission AI */}
          <div
            className="
              group relative flex flex-col justify-between
              rounded-[10px] border border-[var(--ed-rule)]
              bg-[var(--ed-surface)]
              p-6 sm:p-7
              shadow-xs
              transition-all duration-300
              hover:border-[color-mix(in_oklab,var(--ed-accent),transparent_50%)]
              hover:shadow-sm
            "
          >
            <div>
              {/* Header taxonomy */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: F.mono }}
                    className="text-[11px] font-semibold text-[var(--ed-accent)] tracking-wider"
                  >
                    01
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
                  >
                    Scriptural Assistant
                  </span>
                </div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_92%)] text-[var(--ed-accent)] text-[10px] font-mono uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-[var(--ed-accent)] animate-pulse" />
                  <span>Interactive</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(23px, 2.5vw, 28px)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                }}
                className="m-0 mb-2 transition-colors group-hover:text-[var(--ed-accent)]"
              >
                Submission AI
              </h3>

              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] leading-relaxed text-[var(--ed-fg-muted)]"
              >
                {t('aiDesc')} Grounded strictly in authorized translations and original Arabic roots—zero human conjecture, zero ads, zero telemetry tracking.
              </p>

              {/* Interactive Search / Chat Prompt Trigger */}
              <button
                type="button"
                onClick={toggleAsk}
                className="
                  w-full mt-4 mb-2 flex items-center justify-between
                  px-3.5 py-2.5 rounded-[6px]
                  border border-[var(--ed-rule)]
                  bg-[var(--ed-bg)]
                  text-left
                  transition-all duration-200
                  hover:border-[var(--ed-accent)]
                  hover:bg-[color-mix(in_oklab,var(--ed-accent),transparent_96%)]
                  cursor-pointer
                "
              >
                <div className="flex items-center gap-2 text-[13px] text-[var(--ed-fg-muted)]">
                  <Sparkles size={13} className="text-[var(--ed-accent)] shrink-0" />
                  <span className="truncate">Ask a question about Quran or Submission...</span>
                </div>
                <kbd
                  style={{ fontFamily: F.mono }}
                  className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-[color-mix(in_oklab,var(--ed-fg),transparent_90%)] text-[var(--ed-fg-muted)] shrink-0"
                >
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 mt-4 border-t border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)] flex items-center justify-between">
              <button
                type="button"
                onClick={toggleAsk}
                className="
                  ed-btn-primary cursor-pointer text-[13px] px-3.5 py-1.5
                "
                style={{ fontFamily: F.serif }}
              >
                <span>Launch Assistant</span>
                <Arrow size={12} className="ml-1.5" />
              </button>

              <Link
                href="/chat"
                className="inline-flex items-center gap-1 text-[11.5px] font-mono uppercase tracking-wider text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors"
              >
                <span>Fullscreen</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          {/* Module 02: Mobile Applications */}
          <div
            className="
              group relative flex flex-col justify-between
              rounded-[10px] border border-[var(--ed-rule)]
              bg-[var(--ed-surface)]
              p-6 sm:p-7
              shadow-xs
              transition-all duration-300
              hover:border-[color-mix(in_oklab,var(--ed-accent),transparent_50%)]
              hover:shadow-sm
            "
          >
            <div>
              {/* Header taxonomy */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: F.mono }}
                    className="text-[11px] font-semibold text-[var(--ed-accent)] tracking-wider"
                  >
                    02
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
                  >
                    Mobile Readers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ed-fg-muted)]">
                  <FaApple size={14} title="iOS" />
                  <span className="opacity-40">/</span>
                  <FaAndroid size={14} title="Android" />
                </div>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(23px, 2.5vw, 28px)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                }}
                className="m-0 mb-2 transition-colors group-hover:text-[var(--ed-accent)]"
              >
                WikiSubmission Mobile
              </h3>

              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] leading-relaxed text-[var(--ed-fg-muted)]"
              >
                Engineered for uninterrupted offline study with synchronized verse recitations, classical Arabic root tables, and adjustable typography. 100% free with zero ads.
              </p>

              {/* Feature Highlights */}
              <div className="flex flex-wrap gap-2 mt-4 pt-1 text-[11px] font-mono text-[var(--ed-fg-muted)]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Offline Synced
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Audio Recitations
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Zero Trackers
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 mt-4 border-t border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)] flex items-center gap-3">
              <a
                href="https://apps.apple.com/app/id6444260632"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2
                  px-3 py-1.5 rounded-[5px]
                  border border-[var(--ed-rule)]
                  bg-[var(--ed-bg)]
                  text-[12px] font-mono uppercase tracking-wider text-[var(--ed-fg)]
                  transition-all duration-200
                  hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]
                "
              >
                <FaApple size={13} className="shrink-0" />
                <span>App Store</span>
                <ArrowUpRight size={10} className="opacity-60" />
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.kuransonahit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2
                  px-3 py-1.5 rounded-[5px]
                  border border-[var(--ed-rule)]
                  bg-[var(--ed-bg)]
                  text-[12px] font-mono uppercase tracking-wider text-[var(--ed-fg)]
                  transition-all duration-200
                  hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]
                "
              >
                <FaAndroid size={13} className="shrink-0 text-emerald-500" />
                <span>Google Play</span>
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            </div>
          </div>

          {/* Module 03: Public Monorepo & Datasets */}
          <div
            className="
              group relative flex flex-col justify-between
              rounded-[10px] border border-[var(--ed-rule)]
              bg-[var(--ed-surface)]
              p-6 sm:p-7
              shadow-xs
              transition-all duration-300
              hover:border-[color-mix(in_oklab,var(--ed-accent),transparent_50%)]
              hover:shadow-sm
            "
          >
            <div>
              {/* Header taxonomy */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: F.mono }}
                    className="text-[11px] font-semibold text-[var(--ed-accent)] tracking-wider"
                  >
                    03
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
                  >
                    Open Source Code
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--ed-fg-muted)] uppercase tracking-wider">
                  MIT License
                </span>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(23px, 2.5vw, 28px)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                }}
                className="m-0 mb-2 transition-colors group-hover:text-[var(--ed-accent)]"
              >
                Public Monorepo & Schemas
              </h3>

              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] leading-relaxed text-[var(--ed-fg-muted)]"
              >
                {t('githubDesc')} Built with Next.js 15, TypeScript, and SQLite WASM. All data schemas and algorithms are freely available for public inspection.
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-1 text-[11px] font-mono text-[var(--ed-fg-muted)]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Next.js 15
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  TypeScript
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  SQLite WASM
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 mt-4 border-t border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)] flex items-center justify-between">
              <a
                href={About.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  ed-btn-primary cursor-pointer text-[13px] px-3.5 py-1.5 inline-flex items-center gap-2
                "
                style={{ fontFamily: F.serif }}
              >
                <FaGithub size={13} />
                <span>GitHub Repository</span>
                <ArrowUpRight size={11} className="opacity-70" />
              </a>

              <Link
                href="/downloads"
                className="inline-flex items-center gap-1 text-[11.5px] font-mono uppercase tracking-wider text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors"
              >
                <span>Raw Datasets</span>
                <Arrow size={11} />
              </Link>
            </div>
          </div>

          {/* Module 04: Archival Downloads & Community Guild */}
          <div
            className="
              group relative flex flex-col justify-between
              rounded-[10px] border border-[var(--ed-rule)]
              bg-[var(--ed-surface)]
              p-6 sm:p-7
              shadow-xs
              transition-all duration-300
              hover:border-[color-mix(in_oklab,var(--ed-accent),transparent_50%)]
              hover:shadow-sm
            "
          >
            <div>
              {/* Header taxonomy */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: F.mono }}
                    className="text-[11px] font-semibold text-[var(--ed-accent)] tracking-wider"
                  >
                    04
                  </span>
                  <span
                    style={{ fontFamily: F.glacial }}
                    className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
                  >
                    Archival Guild
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--ed-fg-muted)] uppercase tracking-wider">
                  Public Archive
                </span>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(23px, 2.5vw, 28px)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                }}
                className="m-0 mb-2 transition-colors group-hover:text-[var(--ed-accent)]"
              >
                Downloads & Community
              </h3>

              <p
                style={{ fontFamily: F.serif }}
                className="m-0 text-[13.5px] leading-relaxed text-[var(--ed-fg-muted)]"
              >
                {t('downloadsDesc')} High-resolution authorized translation PDFs, complete audio recitations, and our 24/7 global Discord server with automated verse lookup bots.
              </p>

              {/* Archive tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-1 text-[11px] font-mono text-[var(--ed-fg-muted)]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Printable PDFs
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Audio MP3s
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[var(--ed-bg)] border border-[var(--ed-rule)]">
                  Discord Bot
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 mt-4 border-t border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)] flex items-center justify-between">
              <Link
                href="/downloads"
                className="
                  ed-btn-primary cursor-pointer text-[13px] px-3.5 py-1.5 inline-flex items-center gap-2
                "
                style={{ fontFamily: F.serif }}
              >
                <span>Explore Archive</span>
                <Arrow size={12} />
              </Link>

              <a
                href={About.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11.5px] font-mono uppercase tracking-wider text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors"
              >
                <FaDiscord size={13} className="text-[#5865F2]" />
                <span>Discord</span>
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Minimalist Reassurance Banner ── */}
        <div className="mt-6 p-4 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[var(--ed-fg-muted)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>All instruments are 100% free, open-source, and privacy-first.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[var(--ed-accent)]">Zero Advertisements</span>
            <span className="opacity-30">·</span>
            <span>Zero Paywalls</span>
            <span className="opacity-30">·</span>
            <span>Open Data</span>
          </div>
        </div>
      </div>
    </section>
  )
}
