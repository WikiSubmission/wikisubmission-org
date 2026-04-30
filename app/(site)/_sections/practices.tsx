'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { F, SectionDivider } from './shared'

const PRAYER_TIMES: { time: string; active: boolean }[] = [
  { time: '05:12', active: false },
  { time: '12:30', active: false },
  { time: '15:42', active: true },
  { time: '18:15', active: false },
  { time: '19:48', active: false },
]

export function PracticesSection() {
  const t = useTranslations('homePage.practices')
  const [fastingIdx, setFastingIdx] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const ROTATE_MS = 6000
  
  const PRAYER_NAMES = [
    t('fajr'),
    t('dhuhr'),
    t('asr'),
    t('maghrib'),
    t('isha'),
  ]

  const FASTING_VERSES = [
    { text: t('fastingVerse183'), ref: '2:183' },
    { text: t('fastingVerse184'), ref: '2:184' },
    { text: t('fastingVerse185'), ref: '2:185' },
    { text: t('fastingVerse186'), ref: '2:186' },
    { text: t('fastingVerse187'), ref: '2:187' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setFastingIdx((prev) => (prev + 1) % FASTING_VERSES.length)
      setProgressKey((k) => k + 1)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [FASTING_VERSES.length])

  const activeIdx = PRAYER_TIMES.findIndex((p) => p.active)
  const activeName = activeIdx >= 0 ? PRAYER_NAMES[activeIdx] : ''
  const activeTime = activeIdx >= 0 ? PRAYER_TIMES[activeIdx].time : ''

  return (
    <section
      style={{
        backgroundColor:
          'color-mix(in oklab, var(--ed-bg), var(--ed-surface) 20%)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Prayer tile */}
          <Link
            href="/practices"
            className="ed-card group"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
            }}
          >
            <div
              className="flex items-center justify-between"
              aria-live="polite"
              style={{
                fontFamily: F.glacial,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>{t('prayerKicker')}</span>
              <span>
                {t('prayerNext')} ·{' '}
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>
                  {activeName} · {activeTime}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRAYER_TIMES.map(({ time, active }, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 8px',
                    border: '1px solid var(--ed-rule)',
                    borderRadius: 2,
                    textAlign: 'center',
                    background: active
                      ? 'color-mix(in oklab, var(--ed-accent), transparent 88%)'
                      : 'var(--ed-bg)',
                    borderColor: active ? 'var(--ed-accent)' : 'var(--ed-rule)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.glacial,
                      fontSize: 9,
                      fontWeight: active ? 700 : 500,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: active ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
                    }}
                  >
                    {PRAYER_NAMES[i]}
                  </div>
                  <div
                    style={{
                      fontFamily: F.display,
                      fontSize: 17,
                      fontWeight: 500,
                      color: 'var(--ed-fg)',
                      marginTop: 4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {time}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              {t('prayerDesc')}
            </p>
          </Link>

          {/* Zakaat tile */}
          <Link
            href="/practices"
            className="ed-card group"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: F.glacial,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>{t('zakatKicker')}</span>
              <span>
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>
                  2.5%
                </strong>{' '}
                · {t('zakatRateLabel')}
              </span>
            </div>

            <blockquote
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(18px, 3.6vw, 21px)',
                lineHeight: 1.5,
                color: 'var(--ed-fg)',
                fontStyle: 'italic',
                margin: 0,
                letterSpacing: '-0.01em',
                borderLeft: '2px solid var(--ed-accent)',
                paddingLeft: 18,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {t('zakatQuote')}
              <span
                style={{
                  display: 'block',
                  fontFamily: F.glacial,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                  fontStyle: 'normal',
                  marginTop: 12,
                }}
              >
                {t('zakatRef')}
              </span>
            </blockquote>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              {t('zakatDesc')}
            </p>
          </Link>



          {/* Ramadan Tile */}
          <Link
            href="/practices"
            className="ed-card group"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Progress Bar */}
            <motion.div
              key={progressKey}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'var(--ed-accent)',
                originX: 0,
                zIndex: 10,
                opacity: 0.4
              }}
            />

            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: F.glacial,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>{t('ramadanKicker')}</span>
              <span style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>
                2:183-187
              </span>
            </div>

            <div className="relative min-h-[140px] flex flex-col justify-center overflow-hidden border-l-2 border-[var(--ed-accent)]/30 bg-black/5 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={fastingIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <p className="text-[17px] font-display italic text-[var(--ed-fg)] leading-relaxed">
                    "{FASTING_VERSES[fastingIdx].text}"
                  </p>
                  <p className="text-[9px] font-glacial font-bold tracking-widest text-[var(--ed-accent)] uppercase">
                    Verse {FASTING_VERSES[fastingIdx].ref}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              {t('ramadanDesc')}
            </p>
          </Link>

          {/* Hajj Tile */}
          <Link
            href="/practices"
            className="ed-card group"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: F.glacial,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>{t('hajjKicker')}</span>
              <span style={{ color: 'var(--ed-accent)', fontWeight: 700 }}>
                {t('hajjSub')}
              </span>
            </div>

            <blockquote
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(18px, 3.6vw, 21px)',
                lineHeight: 1.5,
                color: 'var(--ed-fg)',
                fontStyle: 'italic',
                margin: 0,
                letterSpacing: '-0.01em',
                borderLeft: '2px solid var(--ed-accent)',
                paddingLeft: 18,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              “Proclaim that the people shall observe Hajj pilgrimage... They will come from the farthest locations.”
              <span
                style={{
                  display: 'block',
                  fontFamily: F.glacial,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                  fontStyle: 'normal',
                  marginTop: 12,
                }}
              >
                — Quran 22:27
              </span>
            </blockquote>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              {t('hajjDesc')}
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}
