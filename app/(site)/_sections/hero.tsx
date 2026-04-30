'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F, Arrow } from './shared'
import { STAGGER_CONTAINER, FADE_UP } from '@/lib/motion'

function Stat({ k, label }: { k: string; label: string }) {
  return (
    <motion.div 
      variants={FADE_UP}
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontSize: 28,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
        }}
      >
        {k}
      </div>
      <div
        style={{
          fontFamily: F.glacial,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--ed-fg-muted)',
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

export function HeroManifesto() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.hero')

  return (
    <section
      className="px-4 sm:px-6 md:px-10"
      style={{
        position: 'relative',
        paddingTop: 'clamp(56px, 10vw, 120px)',
        paddingBottom: 'clamp(40px, 8vw, 100px)',
        maxWidth: 1240,
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="show"
        style={{
          columnGap: 60,
          rowGap: 48,
          alignItems: 'start',
        }}
        className="grid grid-cols-[1.3fr_1fr] max-md:grid-cols-1"
      >
        <motion.h1
          variants={FADE_UP}
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(48px, 14vw, 128px)',
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: '-0.035em',
            color: 'var(--ed-fg)',
          }}
        >
          <span style={{ display: 'block' }}>{t('headline1')}</span>
          <span
            style={{
              display: 'block',
              fontStyle: 'italic',
              color: 'var(--ed-fg-muted)',
            }}
          >
            {t('headline2')}
          </span>
          <span style={{ display: 'block', color: 'var(--ed-accent)' }}>
            {t('headline3')}
          </span>
        </motion.h1>

        <motion.aside
          variants={FADE_UP}
          style={{
            borderLeft: '1px solid var(--ed-rule)',
            paddingLeft: 32,
            alignSelf: 'center',
          }}
          className="max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-6"
        >
          <div
            style={{
              fontFamily: F.glacial,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--ed-accent)',
              marginBottom: 10,
            }}
          >
            {t('verseKicker')}
          </div>
          <p
            style={{
              fontFamily: F.serif,
              fontSize: 'clamp(14px, 3.6vw, 15px)',
              lineHeight: 1.65,
              color: 'var(--ed-fg-muted)',
              margin: 0,
            }}
          >
            {t('verse')}
          </p>
        </motion.aside>

        <motion.p
          variants={FADE_UP}
          style={{
            fontFamily: F.serif,
            fontSize: 'clamp(16px, 4.2vw, 18px)',
            lineHeight: 1.6,
            color: 'var(--ed-fg-muted)',
            maxWidth: '54ch',
          }}
        >
          {t('lede')}
        </motion.p>

        <motion.div
          variants={FADE_UP}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            gap: 'clamp(10px, 3vw, 12px)',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/quran"
            className="ed-btn-primary"
            style={{ fontFamily: F.serif }}
          >
            {t('ctaPrimary')}
            <Arrow />
          </Link>
          <button
            type="button"
            onClick={toggleAsk}
            className="ed-btn-ghost"
            style={{ fontFamily: F.serif }}
          >
            {t('ctaSecondary')}
          </button>
        </motion.div>

        <motion.div
          variants={FADE_UP}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            gap: 'clamp(24px, 8vw, 56px)',
            paddingTop: 40,
            borderTop: '1px solid var(--ed-rule)',
            flexWrap: 'wrap',
          }}
        >
          <Stat k={t('stat1k')} label={t('stat1label')} />
          <Stat k={t('stat2k')} label={t('stat2label')} />
          <Stat k={t('stat3k')} label={t('stat3label')} />
          <Stat k={t('stat4k')} label={t('stat4label')} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        aria-hidden
        style={{
          position: 'absolute',
          right: -80,
          top: 40,
          width: 420,
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }}
        className="hidden lg:block"
      >
        <Image
          src="/brand-assets/logo-transparent.png"
          alt=""
          width={420}
          height={420}
          priority
        />
      </motion.div>
    </section>
  )
}

