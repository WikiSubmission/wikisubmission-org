'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { F, SectionDivider, Arrow } from './shared'
import { useScrollAnimation, FADE_UP, STAGGER_CONTAINER } from '@/lib/motion'

function CountUp({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const { ref, isInView } = useScrollAnimation()

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
        ease: 'easeOut'
      })
      return () => controls.stop()
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{displayValue}</span>
}

function Fact({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <motion.div
      variants={FADE_UP}
      whileHover={{ y: -2, backgroundColor: 'var(--ed-bg)' }}
      className="transition-colors duration-300 group"
      style={{
        padding: 'clamp(24px, 5vw, 32px) clamp(20px, 5vw, 28px)',
        backgroundColor: 'var(--ed-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        height: '100%',
        cursor: 'default',
        border: '1px solid transparent'
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontSize: 36,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          lineHeight: 1,
          color: 'var(--ed-fg)',
        }}
        className="group-hover:text-[var(--ed-accent)] transition-colors duration-300"
      >
        {k}
      </div>
      <div
        style={{
          fontFamily: F.serif,
          fontSize: 13.5,
          color: 'var(--ed-fg-muted)',
          marginBottom: 4,
        }}
      >
        {v}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10.5,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: 'var(--ed-accent)',
          marginTop: 'auto',
          opacity: 0.8
        }}
      >
        {note}
      </div>
    </motion.div>
  )
}

export function MiracleSection() {
  const t = useTranslations('homePage.miracle')
  const { ref, isInView } = useScrollAnimation()

  return (
    <section
      ref={ref}
      className="px-4 sm:px-6 md:px-10"
      style={{
        paddingTop: 'clamp(72px, 10vw, 120px)',
        paddingBottom: 'clamp(72px, 10vw, 120px)',
        maxWidth: 1240,
        margin: '0 auto',
      }}
    >
      <SectionDivider
        num={t('dividerNum')}
        title={t('dividerTitle')}
        sub={t('dividerSub')}
      />

      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{ gap: 72, alignItems: 'stretch' }}
        className="grid grid-cols-[1.2fr_1fr] max-md:grid-cols-1 max-md:gap-12"
      >
        {/* Left: 19 + description */}
        <motion.div
          variants={FADE_UP}
          className="max-sm:flex-col max-sm:gap-6"
          style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}
        >
          <div
            aria-hidden
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(84px, 24vw, 200px)',
              lineHeight: 0.85,
              letterSpacing: '-0.04em',
              color: 'var(--ed-accent)',
              display: 'flex',
              alignItems: 'baseline',
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            <span style={{ fontStyle: 'italic' }}>1</span>
            <span style={{ fontStyle: 'italic' }}>
              {isInView ? <CountUp value={9} duration={1.5} /> : '9'}
            </span>
          </div>
          <div>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(34px, 8vw, 44px)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                marginBottom: 8,
                color: 'var(--ed-fg)',
              }}
            >
              {t('heading')}
            </h3>
            <p
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'var(--ed-fg-muted)',
                marginBottom: 20,
              }}
            >
              {t('ref')}
            </p>
            <p
              style={{
                fontFamily: F.serif,
                fontSize: 16,
                color: 'var(--ed-fg-muted)',
                lineHeight: 1.65,
                marginBottom: 24,
                maxWidth: '44ch',
              }}
            >
              {t('desc')}
            </p>
            <Link href="/miracle" className="ed-cta">
              {t('cta')} <Arrow />
            </Link>
          </div>
        </motion.div>

        {/* Right: 2×2 fact grid */}
        <motion.div
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{
            gap: 0,
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {[
            { k: t('fact1k'), v: t('fact1v'), note: t('fact1note') },
            { k: t('fact2k'), v: t('fact2v'), note: t('fact2note') },
            { k: t('fact3k'), v: t('fact3v'), note: t('fact3note') },
            { k: t('fact4k'), v: t('fact4v'), note: t('fact4note') },
          ].map((f, i) => (
            <div
              key={i}
              className="border-b last:border-b-0 sm:last:border-b-0 sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(3)]:border-b-0"
            >
              <Fact {...f} />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

