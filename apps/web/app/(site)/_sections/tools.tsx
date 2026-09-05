'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FaApple, FaAndroid, FaGithub, FaDiscord } from 'react-icons/fa'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F, SectionDivider } from './shared'

export function ToolsSection() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.tools')

  const TOOLS = [
    {
      num: '01',
      kicker: 'SCRIPTURAL AI',
      title: 'Submission AI',
      desc: t('aiDesc') + ' Grounded strictly in authorized translations and original Arabic roots, with zero human conjecture, sectarian commentary, or user tracking.',
      actions: (
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            onClick={toggleAsk}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary hover:underline cursor-pointer"
          >
            <span>Launch Assistant (⌘K)</span>
            <ArrowRight size={13} />
          </button>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Fullscreen Chat</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      ),
    },
    {
      num: '02',
      kicker: 'IOS & ANDROID',
      title: 'WikiSubmission Mobile',
      desc: 'High-performance native reader engineered for offline reading, synchronized Arabic audio recitations, and customizable typography. 100% free with zero advertisements.',
      actions: (
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href="https://apps.apple.com/app/id6444260632"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground hover:text-primary transition-colors"
          >
            <FaApple size={14} />
            <span>App Store</span>
            <ArrowUpRight size={12} className="text-muted-foreground" />
          </Link>
          <Link
            href="https://play.google.com/store/apps/details?id=com.kuransonahit.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground hover:text-primary transition-colors"
          >
            <FaAndroid size={14} className="text-[#3DDC84]" />
            <span>Google Play</span>
            <ArrowUpRight size={12} className="text-muted-foreground" />
          </Link>
        </div>
      ),
    },
    {
      num: '03',
      kicker: 'OPEN SOURCE CODE',
      title: 'Public Monorepo & Datasets',
      desc: t('githubDesc') + ' Next.js 15, TypeScript, SQLite WASM, and normalized scripture schemas open for public inspection, fork, and contribution under the MIT license.',
      actions: (
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href="https://github.com/WikiSubmission"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary hover:underline"
          >
            <FaGithub size={14} />
            <span>GitHub Repository</span>
            <ArrowUpRight size={12} />
          </Link>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Raw Datasets</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      ),
    },
    {
      num: '04',
      kicker: 'ARCHIVE & GUILD',
      title: 'Downloads & Research Guild',
      desc: t('downloadsDesc') + ' High-resolution authorized translation PDFs, audio MP3 recitations, printable booklets, and our 24/7 global Discord study server with scripture lookup bots.',
      actions: (
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href="/downloads"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary hover:underline"
          >
            <span>Explore Archive</span>
            <ArrowRight size={12} />
          </Link>
          <Link
            href="https://discord.com/oauth2/authorize?client_id=978658099474890793"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#5865F2] hover:underline"
          >
            <FaDiscord size={14} />
            <span>Discord Server &amp; Bot</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <section
      className="relative overflow-hidden border-b border-border/40"
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        paddingTop: 'clamp(48px, 6vw, 72px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
      }}
    >
      <div
        className="relative px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        {/* ── 4-Part Pure Editorial Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
          {TOOLS.map((tool) => (
            <div key={tool.num} className="space-y-3.5 group">
              <div className="flex items-center gap-2.5 font-mono text-[11px] pb-1 border-b border-border/30">
                <span className="text-primary font-bold">{tool.num}</span>
                <span className="text-muted-foreground uppercase tracking-widest text-[10px]">
                  {tool.kicker}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(26px, 3.2vw, 34px)',
                  fontWeight: 500,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--ed-fg)',
                }}
                className="group-hover:text-primary transition-colors"
              >
                {tool.title}
              </h3>

              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: 'var(--ed-fg-muted)',
                }}
              >
                {tool.desc}
              </p>

              {tool.actions}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
