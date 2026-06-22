'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import {
  ChevronLeft, ChevronRight,
  Compass, Heart, User, BookOpen, ArrowDownRight, ArrowUp, ArrowDown, CheckCircle, MessageSquare
} from 'lucide-react'
import { F } from '../../_sections/shared/server'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const STEPS = [
  { 
    title: 'Face the Qiblah', 
    description: 'Face the direction of Mecca as a shared point of organization for the prayer.', 
    details: 'The Quran establishes the Kaaba as the focal point for all Submitters during their daily contact prayers. (2:125)', 
    icon: Compass, 
    arabic: 'الْقِبْلَة' 
  },
  { 
    title: 'State the intention', 
    description: 'In your own language, quietly or audibly state which Contact Prayer you are about to observe.', 
    details: 'Pure intention (Niyyah) is the spiritual foundation of all worship in Submission.', 
    icon: Heart, 
    arabic: 'النِّيَّة' 
  },
  { 
    title: 'Open the prayer', 
    description: 'Raise your hands to the sides of your face and say, Allahu Akbar, then let your arms rest naturally.', 
    details: '"Allahu Akbar" means "God is Great". This initiates your direct contact with the Creator.', 
    icon: User, 
    arabic: 'اللَّهُ أَكْبَر' 
  },
  { 
    title: 'Recite The Key', 
    description: 'While standing, recite Sura 1 in Arabic. Other personal commemoration may be made in your own language.', 
    details: 'The Key (Al-Fatihah) is the foundation of the Contact Prayers and is recited in every unit.', 
    icon: BookOpen, 
    arabic: 'الْفَاتِحَة' 
  },
  { 
    title: 'Bow, Rukoo', 
    description: 'Bow from the waist with hands on the knees. Say Allahu Akbar while moving, then glorify God while bowing.', 
    details: 'Glorify God by saying "Subhana Rabbiyal Azeem" (Glory be to my Lord, the Great).', 
    icon: ArrowDownRight, 
    arabic: 'الرُّكُوع' 
  },
  { 
    title: 'Stand, then prostrate', 
    description: 'Rise while praising God, then go down to prostration while saying Allahu Akbar.', 
    details: 'When rising, say "Sami Allahu Liman Hamidah" (God hears those who praise Him).', 
    icon: ArrowUp, 
    arabic: 'الْقِيَام' 
  },
  { 
    title: 'Prostrate, Sujood', 
    description: 'Place the forehead on the ground and glorify God. Sit briefly, then make the second prostration.', 
    details: 'Glorify God by saying "Subhana Rabbiyal A\'la" (Glory be to my Lord, the Most High).', 
    icon: ArrowDown, 
    arabic: 'السُّجُود' 
  },
  { 
    title: 'Complete the unit', 
    description: 'Two prostrations complete one Rakah. Continue until the required units for that prayer are complete.', 
    details: 'Each prayer has a specific number of units (Rakahs): Dawn (2), Noon (4), Afternoon (4), Sunset (3), Night (4).', 
    icon: CheckCircle, 
    arabic: 'الرَّكْعَة' 
  },
  { 
    title: 'Close with the Shahaadah and peace', 
    description: 'In the final sitting position, pronounce the First Pillar, then turn right and left with the greeting of peace.', 
    details: 'Pronounce: "Ash-hadu an la ilaha illa Allah" (I bear witness that there is no god besides God).', 
    icon: MessageSquare, 
    arabic: 'الشَّهَادَة' 
  },
]

export function ContactPrayersSlideshow() {
  const [slide, setSlide] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  const slideTextRef = useRef<HTMLDivElement | null>(null)
  const slideImageRef = useRef<HTMLDivElement | null>(null)
  const slideKeyRef = useRef(slide)

  useEffect(() => {
    const textEl = slideTextRef.current
    const imageEl = slideImageRef.current
    if (!textEl || !imageEl) return
    if (slideKeyRef.current === slide || reducedMotion) {
      gsap.set(textEl, { opacity: 1, x: 0 })
      gsap.set(imageEl, { opacity: 1, scale: 1 })
    } else {
      gsap.fromTo(
        textEl,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' },
      )
      gsap.fromTo(
        imageEl,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' },
      )
    }
    slideKeyRef.current = slide
  }, [slide, reducedMotion])

  const step = STEPS[slide]
  const StepIcon = step.icon

  const next = () => setSlide(p => (p + 1) % STEPS.length)
  const prev = () => setSlide(p => (p - 1 + STEPS.length) % STEPS.length)

  return (
    <div className="relative flex flex-col gap-6 md:gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8 border-b border-[var(--ed-rule)] pb-6 md:pb-8">
        <div className="space-y-3 md:space-y-4">
          <span 
            className="text-[11px] tracking-[0.2em] uppercase text-[var(--ed-accent)] font-bold"
            style={{ fontFamily: F.glacial }}
          >
            Performance Guide
          </span>
          <h2 
            className="text-3xl md:text-4xl font-medium text-[var(--ed-fg)] leading-[1.1] tracking-tight"
            style={{ fontFamily: F.serif }}
          >
            Step-by-Step Instructions
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span 
              className="text-[9px] uppercase tracking-widest text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.glacial }}
            >
              Instruction
            </span>
            <div className="flex items-center gap-3">
              <span 
                className="text-4xl font-bold text-[var(--ed-fg)] leading-none italic"
                style={{ fontFamily: F.display }}
              >
                {String(slide + 1).padStart(2, '0')}
              </span>
              <div className="h-6 w-px bg-[var(--ed-rule)]" />
              <span 
                className="text-sm text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.glacial }}
              >
                {STEPS.length}
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-2">
            <button onClick={prev} className="size-14 rounded-none border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 flex items-center justify-center hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] transition-all active:scale-95"><ChevronLeft size={24} /></button>
            <button onClick={next} className="size-14 rounded-none border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 flex items-center justify-center hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] transition-all active:scale-95"><ChevronRight size={24} /></button>
          </div>
        </div>
      </div>

      {/* ── Editorial module ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--ed-rule)] bg-[var(--ed-bg)] w-full">
        <div className="lg:col-span-12 h-10 md:h-11 px-4 md:px-6 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg)] font-bold"
              style={{ fontFamily: F.glacial }}
            >
              CONTACT PRAYERS
            </span>
            <div className="h-3 w-px bg-[var(--ed-rule)]" />
            <span
              className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg-muted)] truncate"
              style={{ fontFamily: F.glacial }}
            >
              Unit Performance
            </span>
          </div>
          <span
            className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-[var(--ed-accent)] font-bold shrink-0"
            style={{ fontFamily: F.glacial }}
          >
            Step {slide + 1}
          </span>
        </div>
        {/* Left */}
        <div className="lg:col-span-6 flex flex-col lg:border-r border-[var(--ed-rule)] bg-[var(--ed-bg)]">
          <div className="flex-1 p-5 sm:p-6 md:p-12 flex flex-col justify-center min-h-[260px] md:min-h-[450px]">
            <div ref={slideTextRef} key={slide} className="space-y-5 md:space-y-10">
                <div className="space-y-3 md:space-y-4">
                  {step.arabic && (
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="h-px flex-1 bg-[var(--ed-rule)]" />
                      <span 
                        className="text-3xl md:text-4xl text-[var(--ed-accent)] leading-none"
                        style={{ fontFamily: F.arabic }}
                      >
                        {step.arabic}
                      </span>
                      <div className="h-px flex-1 bg-[var(--ed-rule)]" />
                    </div>
                  )}
                  <h3 
                    className="text-2xl md:text-3xl font-semibold text-[var(--ed-fg)] tracking-tight leading-tight text-center"
                    style={{ fontFamily: F.serif }}
                  >
                    {step.title}
                  </h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <p 
                    className="text-[17px] md:text-xl text-[var(--ed-fg)] leading-relaxed text-center"
                    style={{ fontFamily: F.serif }}
                  >
                    {step.description}
                  </p>
                  <div className="max-w-md mx-auto py-4 md:py-6 border-t border-b border-[var(--ed-rule)] flex flex-col items-center gap-3 md:gap-4">
                    <div 
                      className="text-[9px] uppercase tracking-[0.3em] text-[var(--ed-accent)] font-bold"
                      style={{ fontFamily: F.glacial }}
                    >
                      Context & Detail
                    </div>
                    <p 
                      className="text-sm italic text-[var(--ed-fg-muted)] leading-relaxed text-center px-4"
                      style={{ fontFamily: F.serif }}
                    >
                      {step.details}
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>
        {/* Right */}
        <div className="lg:col-span-6 bg-[var(--ed-surface)]/30 flex flex-col">
          <div className="flex-1 relative flex items-center justify-center p-3 sm:p-4 md:p-12 min-h-[280px] md:min-h-[450px]">
            <div ref={slideImageRef} key={slide} className="w-full h-full relative">
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--ed-bg)] border border-[var(--ed-rule)] shadow-inner group overflow-hidden">
                  <div className="flex flex-col items-center justify-center gap-10 h-full p-8">
                    <div className="relative">
                      <div className="size-32 border border-[var(--ed-rule)] flex items-center justify-center bg-[var(--ed-surface)] relative z-10 transition-transform duration-700 group-hover:rotate-12">
                        <StepIcon size={48} strokeWidth={1} className="text-[var(--ed-fg)] opacity-40 group-hover:opacity-80 group-hover:-rotate-12 transition-all duration-700" />
                      </div>
                      <div className="absolute -inset-4 border border-[var(--ed-rule)] opacity-40 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="text-center space-y-3">
                      <div 
                        className="text-[10px] uppercase tracking-[0.5em] text-[var(--ed-accent)] font-bold"
                        style={{ fontFamily: F.glacial }}
                      >
                        Visual Study
                      </div>
                      <div className="h-px w-24 bg-[var(--ed-rule)] mx-auto" />
                      <p 
                        className="text-[10px] text-[var(--ed-fg-muted)] uppercase tracking-widest"
                        style={{ fontFamily: F.glacial }}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="w-full flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5">
          <button
            onClick={prev}
            className="h-12 md:h-14 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/60 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ed-fg)] hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] active:scale-[0.98] transition-all"
            style={{ fontFamily: F.glacial }}
          >
            <ChevronLeft size={18} />
            Prev
          </button>
          <span
            className="text-[10px] md:text-xs uppercase tracking-widest text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.glacial }}
          >
            {slide + 1} / {STEPS.length}
          </span>
          <button
            onClick={next}
            className="h-12 md:h-14 border border-[var(--ed-rule)] bg-[var(--ed-fg)] text-[var(--ed-bg)] flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest hover:bg-[var(--ed-accent)] active:scale-[0.98] transition-all"
            style={{ fontFamily: F.glacial }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-9 gap-1 md:gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSlide(i)}
              className="flex min-h-11 items-center"
              aria-label={`Step ${i + 1}: ${s.title}`}
            >
              <span
                className={`h-2 w-full border border-[var(--ed-rule)] transition-colors md:h-2.5 ${i === slide ? 'bg-[var(--ed-fg)] border-[var(--ed-fg)]' : 'bg-[var(--ed-surface)]/40 hover:bg-[var(--ed-accent)]'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
