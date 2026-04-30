'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { F, Arrow } from './shared'
import { STAGGER_CONTAINER, FADE_UP, useScrollAnimation } from '@/lib/motion'

export function ClosingSection() {
  const t = useTranslations('homePage.closing')
  const { ref, isInView } = useScrollAnimation()

  return (
    <section
      ref={ref}
      className="px-4 sm:px-6 md:px-10"
      style={{
        backgroundColor: 'var(--ed-fg)',
        color: 'var(--ed-bg)',
        paddingTop: 'clamp(72px, 12vw, 144px)',
        paddingBottom: 'clamp(72px, 12vw, 144px)',
      }}
    >
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          textAlign: 'center',
        }}
      >
        <motion.div variants={FADE_UP} style={{ width: 80 }}>
          <Image
            src="/brand-assets/logo-transparent.png"
            alt=""
            width={80}
            height={80}
            aria-hidden
            className="invert grayscale"
          />
        </motion.div>

        <motion.h2
          variants={FADE_UP}
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            maxWidth: '20ch',
            color: 'var(--ed-bg)',
          }}
        >
          {t('quote')}
        </motion.h2>

        <motion.div
          variants={FADE_UP}
          style={{
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            opacity: 0.6,
          }}
        >
          {t('ref')}
        </motion.div>

        <motion.div
          variants={FADE_UP}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/quran"
            className="ed-btn-inv"
            style={{ fontFamily: F.serif }}
          >
            {t('ctaPrimary')}
            <Arrow />
          </Link>
          <Link
            href="/donate"
            className="ed-btn-ghost-inv"
            style={{ fontFamily: F.serif }}
          >
            {t('ctaSecondary')}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}