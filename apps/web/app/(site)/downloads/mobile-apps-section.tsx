'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, WifiOff, Volume2, ShieldCheck, Sparkles } from 'lucide-react'
import { FaApple, FaGooglePlay } from 'react-icons/fa'
import { F } from '@/app/(site)/_sections/shared'

const APP_STORE_URL = 'https://apps.apple.com/us/app/wikisubmission/id6444260632'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kuransonahit.app'
const GITHUB_RELEASES_URL = 'https://github.com/WikiSubmission'

export function MobileAppsSection() {
  return (
    <section className="py-12" id="mobile-apps">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">01</div>
        <div>
          <p className="text-[11px] font-mono tracking-widest text-primary uppercase">NATIVE APPS</p>
          <h2 className="font-headline text-2xl md:text-3xl font-bold">Mobile Platforms</h2>
        </div>
        <div className="h-px flex-1 bg-border/60 ml-4" />
      </div>

      {/* Two Minimalist Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* iOS Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8 flex flex-col justify-between hover:border-border/80 transition-all duration-200"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center text-foreground">
                <FaApple className="text-xl" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                iOS &amp; iPadOS
              </span>
            </div>

            <h3
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(24px, 3vw, 30px)',
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
              className="text-foreground mb-2"
            >
              Apple App Store
            </h3>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: '15px',
                lineHeight: 1.6,
              }}
              className="text-muted-foreground mb-6"
            >
              Native Swift reader featuring instant offline search, synchronized verse audio, Arabic root concordance, and zero tracking.
            </p>
          </div>

          <div className="pt-4 border-t border-border/30 flex items-center justify-between gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-medium text-xs hover:opacity-90 transition-opacity"
            >
              <FaApple className="text-sm" />
              <span>Download on App Store</span>
            </a>
            <span className="font-mono text-[10px] text-muted-foreground">Free · 100% Offline</span>
          </div>
        </motion.div>

        {/* Android Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
          className="rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8 flex flex-col justify-between hover:border-border/80 transition-all duration-200"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center text-[#34A853]">
                <FaGooglePlay className="text-lg" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                Android
              </span>
            </div>

            <h3
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(24px, 3vw, 30px)',
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
              className="text-foreground mb-2"
            >
              Google Play Store
            </h3>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: '15px',
                lineHeight: 1.6,
              }}
              className="text-muted-foreground mb-6"
            >
              Native Kotlin reader optimized for performance, background recitation playback, and complete on-device SQLite storage.
            </p>
          </div>

          <div className="pt-4 border-t border-border/30 flex items-center justify-between gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 font-medium text-xs text-foreground transition-colors"
            >
              <FaGooglePlay className="text-xs text-[#34A853]" />
              <span>Get it on Google Play</span>
            </a>
            <a
              href={GITHUB_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>Direct APK</span>
              <ExternalLink size={9} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Clean Highlights & PWA Bar */}
      <div className="mt-4 px-5 py-3 rounded-xl border border-border/30 bg-muted/15 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-5 sm:gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <WifiOff size={13} className="text-primary" />
            <span>Offline SQLite</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Volume2 size={13} className="text-primary" />
            <span>Synced Audio</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-primary" />
            <span>Zero Tracking</span>
          </span>
        </div>

        <Link
          href="/quran"
          className="hover:text-foreground font-mono text-[11px] transition-colors inline-flex items-center gap-1.5"
        >
          <Sparkles size={11} className="text-primary" />
          <span>Web App / PWA</span>
        </Link>
      </div>
    </section>
  )
}
