'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Activity, Binary } from 'lucide-react'
import { useTranslations } from 'next-intl'

// ─── DATA ─────────────────────────────────────────────────────────────

const CHAPTER_NAMES = [
  'Al-Fatihah', 'Al-Baqarah', 'Al-Imran', 'An-Nisa', 'Al-Maidah', 'Al-Anam',
  'Al-Araf', 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Rad',
  'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan', 'Ash-Shuara',
  'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajdah',
  'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar',
  'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat',
  'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqiah', 'Al-Hadid',
  'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah', 'As-Saff', 'Al-Jumuah',
  'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam',
  'Al-Haqqah', 'Al-Maarij', 'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir',
  'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Naziat', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-Ala', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams',
  'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr',
  'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat', 'Al-Qariah', 'At-Takathur',
  'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Maun', 'Al-Kawthar',
  'Al-Kafirun', 'An-Nasr', 'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
]

const ALAQ_VERSES = [
  "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ", "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ",
  "الَّذِي عَلَّمَ بِالْقَلَمِ", "عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ", "كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَى",
  "أَنْ رَآهُ اسْتَغْنَى", "إِنَّ إِلَى رَبِّكَ الرُّجْعَى", "أَرَأَيْتَ الَّذِي يَنْهَى",
  "عَبْدًا إِذَا صَلَّى", "أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَى", "أَوْ أَمَرَ بِالتَّقْوَى",
  "أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّى", "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَى", "كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا",
  "نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ", "فَلْيَدْعُ نَادِيَهُ", "سَنَدْعُ الزَّبَانِيَةَ", "كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ"
]

const REVELATION_VERSES = [
  { words: ['اقْرَأْ', 'بِاسْمِ', 'رَبِّكَ', 'الَّذِي', 'خَلَقَ'], marker: '١' },
  { words: ['خَلَقَ', 'الْإِنْسَانَ', 'مِنْ', 'عَلَقٍ'], marker: '٢' },
  { words: ['اقْرَأْ', 'وَرَبُّكَ', 'الْأَكْرَمُ'], marker: '٣' },
  { words: ['الَّذِي', 'عَلَّمَ', 'بِالْقَلَمِ'], marker: '٤' },
  { words: ['عَلَّمَ', 'الْإِنسانَ', 'مَا لَمْ', 'يَعْلَمْ'], marker: '٥' }
]

const BISMILLAH_WORDS = [
  { text: "بِسْمِ", translation: "Name", letters: ["بِ", "سْ", "مِ"] },
  { text: "اللَّهِ", translation: "God", letters: ["ا", "ل", "لَّ", "هِ"] },
  { text: "الرَّحْمَنِ", translation: "Most Gracious", letters: ["ا", "ل", "رَّ", "حْ", "مَ", "نِ"] },
  { text: "الرَّحِيمِ", translation: "Most Merciful", letters: ["ا", "ل", "رَّ", "حِ", "ي", "مِ"] }
]

const BISMILLAH_WORD_STARTS = BISMILLAH_WORDS.map((_, index) =>
  BISMILLAH_WORDS.slice(0, index).reduce(
    (sum, word) => sum + word.letters.length,
    0
  )
)

type MiracleFact = {
  id: string
  number: string
  label: string
  detail: string
}

// ─── UTILS & HOOKS ───────────────────────────────────────────────────

function useForensicScanner(targetCount: number, speed: number = 150) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'locked'>('idle')
  const [count, setCount] = useState(0)
  const [glow, setGlow] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setInterval(() => {
      setCount(c => {
        if (c < targetCount - 1) return c + 1
        clearInterval(t)
        setPhase('locked')
        return targetCount - 1
      })
    }, speed)
    return () => clearInterval(t)
  }, [phase, targetCount, speed])

  useEffect(() => {
    if (phase !== 'locked') return
    const t = setInterval(() => {
      setGlow(g => (g >= 1 ? 1 : g + 0.05))
    }, 40)
    return () => clearInterval(t)
  }, [phase])

  return { phase, count, glow, isLocked: phase === 'locked' }
}

// ─── SHARED FORENSIC COMPONENTS ─────────────────────────────────────

function ForensicScanlines() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setOffset(o => (o + 1) % 40), 30)
    return () => clearInterval(t)
  }, [])
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 opacity-[0.06]"
      style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--ed-accent) 2px, var(--ed-accent) 4px)`,
        backgroundPosition: `0px ${offset}px`,
      }}
    />
  )
}

function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ background: 'radial-gradient(ellipse at center, transparent 30%, var(--ed-surface) 100%)' }}
    />
  )
}

function CornerMarkers({ label, sublabel }: { label: string, sublabel?: string }) {
  const t = useTranslations('miracle')

  return (
    <>
      <div className="absolute top-4 left-4 font-mono text-[7px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-25 z-30">
        {label}
      </div>
      <div className="absolute top-4 right-4 font-mono text-[7px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-25 z-30">
        {sublabel || t('visualVerified')}
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[7px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-25 z-30">
        {t('visualForensicUnit')}
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[7px] tracking-[0.4em] uppercase text-[var(--ed-fg-muted)] opacity-25 z-30">
        {t('visualConst')}
      </div>
    </>
  )
}

function StatusBadge({ phase, scanningText, lockedText }: { phase: string, scanningText: string, lockedText: string }) {
  const t = useTranslations('miracle')

  return (
    <div className="font-mono text-[9px] tracking-[0.25em] uppercase h-4 flex items-center justify-center gap-2">
      {phase === 'scanning' && <Activity size={10} className="animate-pulse" />}
      {phase === 'idle' && <span className="text-[var(--ed-fg-muted)] opacity-40">{t('visualInitializingScan')}</span>}
      {phase === 'scanning' && <span className="text-[var(--ed-accent)] animate-pulse">{scanningText}</span>}
      {phase === 'locked' && <span className="text-[var(--ed-accent)] font-bold">{lockedText}</span>}
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────

export function MiracleVisualizer({ facts }: { facts: MiracleFact[] }) {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {facts.map((fact, i) => (
        <FactSection key={fact.id} fact={fact} i={i} />
      ))}
    </div>
  )
}

function FactSection({ fact, i }: { fact: MiracleFact, i: number }) {
  const t = useTranslations('miracle')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "-10% 0px -10% 0px" })

  return (
    <section ref={ref} className="relative py-8 md:py-12 border-b border-[var(--ed-rule)]/30 last:border-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className={`space-y-4 md:space-y-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
          <div className="flex items-center gap-4 text-[var(--ed-accent)]">
            <div className="px-1.5 py-0.5 rounded bg-[var(--ed-surface)] border border-[var(--ed-rule)] font-mono text-[8px] tracking-widest uppercase">
              0{i + 1}
            </div>
            <div className="h-px w-6 bg-[var(--ed-rule)]" />
            <span className="font-mono text-[8px] uppercase opacity-40">{t('visualSystemRecord')}</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl md:text-4xl font-serif font-medium text-[var(--ed-fg)] leading-tight">
              {fact.label}
            </h3>
            <p className="text-base md:text-lg text-[var(--ed-fg-muted)] leading-relaxed font-serif max-w-xl opacity-80">
              {fact.detail}
            </p>
          </div>

          <div className="flex items-baseline gap-3 pt-3">
            <div className="font-mono text-3xl md:text-4xl font-bold text-[var(--ed-fg)] tracking-tighter opacity-60">{fact.number}</div>
            <div className="font-mono text-[8px] uppercase opacity-20 tracking-widest">{t('visualConstant')}</div>
          </div>
        </div>

        <div className="relative min-h-[400px] md:min-h-[500px] w-full rounded-[24px] md:rounded-[32px] bg-[var(--ed-surface)]/5 border border-[var(--ed-rule)] overflow-hidden flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-[0.015]" />
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            {isInView ? (
              <VisualContent id={fact.id} />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function VisualContent({ id }: { id: string }) {
  return (
    <>
      {id === 'bismillah' && <BismillahVisual />}
      {id === 'chapters' && <ChaptersVisual />}
      {id === 'revelation' && <RevelationVisual />}
      {id === 'god' && <GodVisual />}
      {id === 'chapter96' && <Chapter96Visual />}
      {id === 'discovery' && <DiscoveryVisual />}
    </>
  )
}

// ─── 01: BISMILLAH ────────────────────────────────────────────────────

function BismillahVisual() {
  const t = useTranslations('miracle')
  const totalLetters = 19
  const { phase, count, glow, isLocked } = useForensicScanner(totalLetters, 180)

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualBismillahLabel')} sublabel={t('visualBismillahSublabel')} />

      <div className="relative z-30 flex flex-col items-center gap-10 px-6">
        <AnimatePresence mode="wait">
          {!isLocked ? (
            <motion.div key="scan" className="flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-4" dir="rtl">
              {BISMILLAH_WORDS.map((word, wi) => {
                const wordStart = BISMILLAH_WORD_STARTS[wi] ?? 0
                return (
                  <div key={`word-${wi}`} className="flex items-center gap-3">
                    <div className="flex gap-1.5 md:gap-2">
                      {word.letters.map((l, li) => {
                        const absIdx = wordStart + li
                        const isLit = absIdx <= count
                        const isCurrent = absIdx === count && phase === 'scanning'
                        return (
                          <motion.span
                            key={`letter-${absIdx}`}
                            className="text-3xl md:text-5xl font-arabic relative"
                            style={{
                              fontFamily: 'var(--font-amiri)',
                              color: isLit ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
                              opacity: isLit ? (isCurrent ? 1 : 0.85) : 0.08,
                            }}
                            animate={{ scale: isCurrent ? 1.15 : 1 }}
                            transition={{ duration: 0.1 }}
                          >
                            {l}
                          </motion.span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div
                className="text-2xl md:text-5xl text-center leading-relaxed font-arabic px-4 text-[var(--ed-accent)] whitespace-nowrap"
                dir="rtl"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  textShadow: `0 0 ${20 + glow * 20}px var(--ed-accent-soft), 0 0 ${40 + glow * 40}px var(--ed-accent-soft)`
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </div>
              <div className="text-sm md:text-lg font-serif italic text-[var(--ed-fg-muted)] opacity-60">
                {t('visualBismillahTranslation')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-2 pt-6 border-t border-[var(--ed-rule)]/10 w-56">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-6xl md:text-7xl font-bold text-[var(--ed-fg)] tabular-nums">
              {isLocked ? 19 : count + 1}
            </span>
            <span className="font-mono text-sm text-[var(--ed-fg-muted)] opacity-20">/ 19</span>
          </div>
          <StatusBadge
            phase={phase}
            scanningText={t('visualScanningGraphemes')}
            lockedText={t('visualVerified19Letters')}
          />
        </div>
      </div>
    </div>
  )
}

// ─── 02: 114 CHAPTERS ─────────────────────────────────────────────────

function ChaptersVisual() {
  const t = useTranslations('miracle')
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'locked'>('idle')
  const [glow, setGlow] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'scanning') return
    const delay = index < 100 ? 12 : index < 110 ? 40 : 80
    const t = setTimeout(() => {
      if (index < 114) setIndex(i => i + 1)
      else setPhase('locked')
    }, delay)
    return () => clearTimeout(t)
  }, [index, phase])

  useEffect(() => {
    if (phase !== 'locked') return
    const t = setInterval(() => setGlow(g => (g >= 1 ? 1 : g + 0.03)), 40)
    return () => clearInterval(t)
  }, [phase])

  const displayIndex = Math.min(index, 113)
  const currentName = CHAPTER_NAMES[displayIndex]
  const isLocked = phase === 'locked'

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualChapterIndex')} sublabel={t('visual114Units')} />

      <div className="relative z-30 flex flex-col items-center gap-8 px-6 w-full">
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isLocked ? (
              <motion.div key={displayIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.5, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.05 }} className="text-xl md:text-2xl font-serif italic text-[var(--ed-fg-muted)]">
                {currentName}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[10px] tracking-[0.3em] text-[var(--ed-accent)] uppercase">
                {t('visualAllChaptersIndexed')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex items-center justify-center">
          <svg className="absolute w-64 h-64 md:w-80 md:h-80 animate-[spin_20s_linear_infinite] opacity-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--ed-accent)" strokeWidth="0.5" strokeDasharray="4 4" />
          </svg>
          <div className="font-mono text-7xl md:text-9xl font-bold leading-none tabular-nums transition-all duration-700" style={{ color: isLocked ? 'var(--ed-accent)' : 'var(--ed-fg)', textShadow: isLocked ? `0 0 ${30 + glow * 40}px var(--ed-accent-soft)` : 'none' }}>
            {index}
          </div>
        </div>

        <AnimatePresence>
          {isLocked && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-[var(--ed-surface)]/60 px-6 py-3 rounded-2xl border border-[var(--ed-rule)] backdrop-blur-sm">
              <div className="font-mono text-4xl md:text-5xl font-bold text-[var(--ed-accent)]">19</div>
              <div className="text-xl opacity-20">×</div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-[var(--ed-fg)]">6</div>
            </motion.div>
          )}
        </AnimatePresence>

        <StatusBadge
          phase={phase}
          scanningText={t('visualIndexing', { index })}
          lockedText={t('visualVerified114')}
        />
      </div>
    </div>
  )
}

// ─── 03: FIRST REVELATION ─────────────────────────────────────────────

function RevelationVisual() {
  const t = useTranslations('miracle')
  const { phase, count: wordCount, isLocked } = useForensicScanner(19, 350)
  const [beamX, setBeamX] = useState(-100)

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setInterval(() => setBeamX(x => (x > 150 ? -100 : x + 3)), 30)
    return () => clearInterval(t)
  }, [phase])

  let globalIdx = 0

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualRevelationLabel')} sublabel={t('visualFirstRevelation')} />

      {phase === 'scanning' && (
        <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--ed-accent)] to-transparent opacity-30 z-20 pointer-events-none" style={{ left: `${beamX}%`, boxShadow: '0 0 20px var(--ed-accent-soft)' }} />
      )}

      <div className="relative z-30 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        <div className="text-center space-y-1">
          <div className="font-mono text-[8px] tracking-[0.4em] uppercase opacity-30">{t('visualSourceText')}</div>
          <div className="text-xs md:text-sm font-serif italic text-[var(--ed-fg-muted)] tracking-widest border-x border-[var(--ed-rule)]/30 px-6 py-1">
            {t('visualSurahAlaq')} <span className="opacity-40">({t('visualEmbryo')})</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full text-right" dir="rtl">
          {REVELATION_VERSES.map((verse, vIdx) => (
            <div key={`verse-${vIdx}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 justify-start leading-[1.8]">
              {verse.words.map((word) => {
                const idx = globalIdx++
                const isLit = idx <= wordCount
                const isCurrent = idx === wordCount && phase === 'scanning'
                return (
                  <motion.span key={`word-${idx}`} className="text-xl md:text-3xl font-arabic" style={{ fontFamily: 'var(--font-amiri)', color: isLit ? 'var(--ed-accent)' : 'var(--ed-fg-muted)', opacity: isLit ? (isCurrent ? 1 : 0.85) : 0.08 }} animate={{ scale: isCurrent ? 1.08 : 1 }}>
                    {word}
                  </motion.span>
                )
              })}
              <div key={`marker-${vIdx}`} className="w-5 h-5 rounded-full border border-[var(--ed-rule)] flex items-center justify-center text-[8px] font-arabic opacity-30 mr-1">
                {verse.marker}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-baseline gap-4 border-t border-[var(--ed-rule)]/20 pt-6 w-full justify-center">
          <div className="font-mono text-5xl md:text-7xl font-bold tabular-nums transition-all duration-500" style={{ color: isLocked ? 'var(--ed-accent)' : 'var(--ed-fg)' }}>
            {isLocked ? 19 : wordCount + 1}
          </div>
          <div className="font-mono text-lg opacity-20">/ 19</div>
        </div>

        <StatusBadge
          phase={phase}
          scanningText={t('visualCountingRevelationWords')}
          lockedText={t('visualVerified19Words')}
        />
      </div>
    </div>
  )
}

// ─── 04: GOD FREQUENCY ────────────────────────────────────────────────

function GodVisual() {
  const t = useTranslations('miracle')
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'locked'>('idle')
  const [glow, setGlow] = useState(0)
  const target = 2698

  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'scanning') return
    const t = setInterval(() => {
      setCount(c => {
        const step = Math.max(1, Math.floor((target - c) / 20))
        const next = Math.min(c + step, target)
        if (next >= target) {
          clearInterval(t)
          setPhase('locked')
        }
        return next
      })
    }, 30)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'locked') return
    const t = setInterval(() => setGlow(g => (g >= 1 ? 1 : g + 0.03)), 40)
    return () => clearInterval(t)
  }, [phase])

  const isLocked = phase === 'locked'

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualFrequencyScan')} sublabel={t('visualWordAllah')} />

      <div className="relative z-30 flex flex-col items-center gap-8 px-6">
        <motion.div className="text-6xl md:text-8xl font-arabic opacity-10" style={{ fontFamily: 'var(--font-amiri)' }} animate={{ opacity: isLocked ? 0.15 : 0.05 }}>الله</motion.div>
        <div className="font-mono text-6xl md:text-8xl font-bold tabular-nums transition-all duration-500" style={{ color: isLocked ? 'var(--ed-accent)' : 'var(--ed-fg)', textShadow: isLocked ? `0 0 ${20 + glow * 40}px var(--ed-accent-soft)` : 'none' }}>
          {count.toLocaleString()}
        </div>
        <div className="font-serif italic text-sm md:text-base text-[var(--ed-fg-muted)] opacity-50">
          {t('visualAllahFrequency')}
        </div>
        {isLocked && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 bg-[var(--ed-surface)]/60 px-6 py-3 rounded-2xl border border-[var(--ed-rule)]">
            <div className="font-mono text-3xl md:text-5xl font-bold text-[var(--ed-accent)]">19</div>
            <div className="text-xl opacity-20">×</div>
            <div className="font-mono text-2xl md:text-4xl font-bold text-[var(--ed-fg)]">142</div>
          </motion.div>
        )}
        <StatusBadge
          phase={phase}
          scanningText={t('visualTallyingOccurrences')}
          lockedText={t('visualVerified2698')}
        />
      </div>
    </div>
  )
}

// ─── 05: CHAPTER 96 REEL ──────────────────────────────────────────────

function Chapter96Visual() {
  const t = useTranslations('miracle')
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'locked'>('idle')
  const [displayVerse, setDisplayVerse] = useState(1)
  const [glowIntensity, setGlowIntensity] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'scanning') return

    let current = 1
    const resetTimer = setTimeout(() => setDisplayVerse(1), 0)

    const reelInterval = setInterval(() => {
      if (current >= 19) {
        clearInterval(reelInterval)
        setPhase('locked')
        return
      }

      current++
      setDisplayVerse(current)
    }, 250)

    return () => {
      clearTimeout(resetTimer)
      clearInterval(reelInterval)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'locked') return
    const t = setInterval(() => setGlowIntensity(g => (g >= 1 ? 1 : g + 0.05)), 50)
    return () => clearInterval(t)
  }, [phase])

  const currentText = ALAQ_VERSES[displayVerse - 1] || ALAQ_VERSES[0]
  const isLocked = phase === 'locked'

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualSurah096')} sublabel={t('visualVerseCount')} />

      <div className="relative z-30 flex flex-col items-center gap-8 px-6 w-full">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">{t('visualVerse')}</div>
          <div className={`font-mono text-7xl md:text-8xl font-bold leading-none tabular-nums transition-all duration-500 ${isLocked ? 'text-[var(--ed-accent)] scale-110' : 'text-[var(--ed-fg)] opacity-30'}`}>
            {displayVerse.toString().padStart(2, '0')}
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">{t('visualOf19')}</div>
        </div>

        <div className="relative w-full max-w-2xl h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={displayVerse} initial={{ opacity: 0, y: phase === 'scanning' ? -30 : 0, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: phase === 'scanning' ? 30 : 0, filter: 'blur(8px)' }} transition={{ duration: phase === 'scanning' ? 0.08 : 0.6 }} className="text-center" dir="rtl">
              <p className="font-arabic text-2xl md:text-4xl leading-relaxed" style={{ fontFamily: 'var(--font-amiri)', color: isLocked ? 'var(--ed-accent)' : 'var(--ed-fg)', textShadow: isLocked ? `0 0 ${20 + glowIntensity * 30}px var(--ed-accent-soft)` : 'none', opacity: isLocked ? 1 : 0.6 }}>
                {currentText}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex gap-[3px] w-full max-w-md justify-center">
            {ALAQ_VERSES.map((_, i) => (
              <div key={`alaq-indicator-${i}`} className={`h-1.5 flex-1 max-w-[18px] transition-colors duration-300 ${i + 1 <= displayVerse || isLocked ? 'bg-[var(--ed-accent)]/40' : 'bg-[var(--ed-rule)]/15'}`} />
            ))}
          </div>
          <StatusBadge
            phase={phase}
            scanningText={t('visualScanningAlaq')}
            lockedText={t('visualVerified19Verses')}
          />
        </div>
      </div>
    </div>
  )
}

// ─── 06: DISCOVERY YEAR ───────────────────────────────────────────────

function DiscoveryVisual() {
  const t = useTranslations('miracle')
  const [phase, setPhase] = useState<'idle' | 'decoding' | 'calculating' | 'factoring' | 'locked'>('idle')
  const [displayYear, setDisplayYear] = useState('----')
  const [glow, setGlow] = useState(0)
  
  const targetYear = '1974'
  const chars = '0123456789'

  // Master Animation Sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('decoding'), 400)
    const t2 = setTimeout(() => setPhase('calculating'), 2400)
    const t3 = setTimeout(() => setPhase('factoring'), 4400)
    const t4 = setTimeout(() => setPhase('locked'), 6400)
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  // Phase 1: Scramble Year
  useEffect(() => {
    if (phase !== 'decoding') return
    let pos = 0
    let iter = 0
    
    const t = setInterval(() => {
      iter++
      setDisplayYear(targetYear.split('').map((c, i) => 
        (i < pos ? c : chars[Math.floor(Math.random() * chars.length)])
      ).join(''))
      
      if (iter % 6 === 0 && pos < 4) pos++
      if (pos >= 4) {
        clearInterval(t)
        setDisplayYear(targetYear)
      }
    }, 50)
    
    return () => clearInterval(t)
  }, [phase])

  // Post-Lock Glow
  useEffect(() => {
    if (phase !== 'locked') return
    const t = setInterval(() => setGlow(g => (g >= 1 ? 1 : g + 0.04)), 40)
    return () => clearInterval(t)
  }, [phase])

  const getStatusText = () => {
    switch(phase) {
      case 'decoding': return t('visualDecodingTimestamp')
      case 'calculating': return t('visualCalculatingLunar')
      case 'factoring': return t('visualExtractingFactors')
      case 'locked': return t('visualVerifiedInterlock')
      default: return t('visualInitializing')
    }
  }

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-start py-12 pb-24 overflow-hidden">
      <ForensicScanlines />
      <Vignette />
      <CornerMarkers label={t('visualTemporalAnalysis')} sublabel={t('visualYear1974')} />

      <div className="relative z-30 flex flex-col items-center gap-6 px-6 w-full max-w-lg mt-2">
        
        {/* Step 1: The Year */}
        <div className="flex flex-col items-center">
          <Binary size={24} className="text-[var(--ed-accent)] opacity-30 mb-2" />
          <div 
            className="font-mono text-7xl md:text-9xl font-bold leading-none tracking-tighter tabular-nums transition-all duration-500" 
            style={{ 
              color: phase === 'decoding' ? 'var(--ed-fg)' : 'var(--ed-accent)', 
              textShadow: phase === 'locked' ? `0 0 ${20 + glow * 40}px var(--ed-accent-soft)` : 'none' 
            }}
          >
            {displayYear}
          </div>
        </div>

        {/* Dynamic Data Panel */}
        <div className="w-full flex flex-col items-center justify-start gap-5 mt-2">
          <AnimatePresence>
            
            {/* Step 2: Lunar Duration Calculation */}
            {(phase === 'calculating' || phase === 'factoring' || phase === 'locked') && (
              <motion.div 
                key="lunar-duration"
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-center gap-3 md:gap-5 w-full font-mono text-sm border border-[var(--ed-rule)]/50 bg-[var(--ed-surface)]/30 px-4 md:px-6 py-3 rounded-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-[var(--ed-fg-muted)]">13 BH</span>
                  <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                    {t('visualRevelationOfQuran')}
                  </span>
                </div>
                
                <span className="text-[var(--ed-accent)] opacity-50">→</span>
                
                <div className="flex flex-col items-center text-center">
                  <span className="text-[var(--ed-fg-muted)]">1974 CE</span>
                  <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                    {t('visualMiracleDiscovered')}
                  </span>
                </div>
                
                <span className="text-[var(--ed-accent)] opacity-50">=</span>
                
                <div className="flex flex-col items-center text-center">
                  <span className="font-bold text-[var(--ed-fg)] text-base">1406</span>
                  <span className="text-[8px] uppercase text-[var(--ed-accent)] opacity-70 tracking-widest mt-1">
                    {t('visualLunarYears')}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 3: The Factoring & Connection */}
            {(phase === 'factoring' || phase === 'locked') && (
              <motion.div 
                key="factoring-interlock"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center w-full"
              >
                <div className="flex items-center justify-center gap-4 md:gap-6 bg-[var(--ed-surface)]/80 px-8 py-4 rounded-2xl border border-[var(--ed-rule)] shadow-[0_0_30px_var(--ed-surface)] w-full">
                  <div className="font-mono text-3xl md:text-4xl text-[var(--ed-fg-muted)]">1406</div>
                  <div className="text-[var(--ed-accent)] opacity-50 text-2xl">=</div>
                  <div className="flex items-center gap-3 font-mono text-3xl md:text-4xl font-bold text-[var(--ed-accent)]">
                    <span>19</span>
                    <span className="text-xl md:text-2xl opacity-40 text-[var(--ed-fg)]">×</span>
                    <span>74</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: The Anchor (Surah 74:30) */}
            {phase === 'locked' && (
              <motion.div 
                key="scriptural-anchor"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full flex flex-col items-center gap-4 pt-10 border-t border-[var(--ed-rule)]/50 mt-4"
              >
                <div className="px-3 py-1 rounded border border-[var(--ed-accent)]/30 font-mono text-[9px] tracking-widest text-[var(--ed-accent)] bg-[var(--ed-accent)]/5 uppercase">
                  {t('visualSurah7430')}
                </div>
                <div 
                  className="font-arabic text-3xl md:text-4xl text-[var(--ed-fg)] mt-1" 
                  dir="rtl"
                  style={{ fontFamily: 'var(--font-amiri)', textShadow: `0 0 ${glow * 15}px var(--ed-accent-soft)` }}
                >
                  عَلَيْهَا تِسْعَةَ عَشَرَ
                </div>
                <div className="font-serif italic text-base md:text-lg text-[var(--ed-fg-muted)] opacity-90 mt-1">
                  {t('visualOverItIsNineteen')}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Status Tracker */}
      <div className="w-full flex justify-center mt-auto pt-12 pb-6 z-40">
         <StatusBadge 
            phase={phase === 'locked' ? 'locked' : 'scanning'} 
            scanningText={getStatusText()} 
            lockedText={getStatusText()} 
          />
      </div>
    </div>
  )
}
