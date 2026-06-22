'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

import {
  ChevronLeft, ChevronRight,
  Droplets, User, Heart, Wind, Waves,
  Play,
} from 'lucide-react'
import Image from 'next/image'
import { F } from '../../_sections/shared/server'
import { QuranRef } from '@/components/quran-ref'

const VideoModal = dynamic(
  () => import('../../_sections/shared/video-modal').then((m) => ({ default: m.VideoModal })),
  { ssr: false },
)


const FOOTNOTES = [
  { title: 'Major Ablution (Ghusl)', text: 'If you were unclean due to sexual orgasm, you shall bathe.', icon: Waves },
  { title: 'Dry Ablution (Tayammum)', text: 'If you are ill, or traveling, or had any digestive excretion (urinary, fecal, or gas), or had (sexual) contact with the women, and you cannot find water, you shall observe the dry ablution (Tayammum) by touching clean dry soil, then rubbing your faces and hands.', icon: Wind },
  { title: 'Purpose of Purification', text: 'GOD does not wish to make the religion difficult for you; He wishes to cleanse you and to perfect His blessing upon you, that you may be appreciative.', icon: Heart },
]

const STEPS = [
  { title: 'Wash Face', description: 'The first physical step is to wash your face completely.', details: 'Ensure water reaches all parts of the face, from hairline to chin and ear to ear.', icon: Droplets, arabic: 'غَسْلُ الْوَجْه', image: '/images/ablution/step-face.png' },
  { title: 'Wash Arms to Elbows', description: 'Wash your right arm up to and including the elbow, then repeat with the left arm.', details: 'The Quranic command specifies "your arms to the elbows" [5:6].', icon: Droplets, arabic: 'غَسْلُ الْيَدَيْن', image: '/images/ablution/step-arms.png' },
  { title: 'Wipe the Head', description: 'Wipe your head with wet hands.', details: 'The head is to be "wiped" (Masah) with wet hands, not washed under running water.', icon: User, arabic: 'مَسْحُ الرَّأْس', image: '/images/ablution/step-head.png' },
  { title: 'Wash Feet to Ankles', description: 'Wash your right foot up to the ankle, then repeat with the left foot.', details: 'This final step completes the physical purification required for the Contact Prayer.', icon: Droplets, arabic: 'غَسْلُ الرِّجْلَيْن', image: '/images/ablution/step-feet.png' },
]

// ── COMPONENT ─────────────────────────────────────────────────────────

export function AblutionSlideshow() {
  const [slide, setSlide] = useState(0)
  const [open, setOpen] = useState(false)

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const next = () => setSlide(p => (p + 1) % STEPS.length)
  const prev = () => setSlide(p => (p - 1 + STEPS.length) % STEPS.length)

  const step = STEPS[slide]

  return (
    <>
    <div className="relative w-full">
      <div className="flex flex-col gap-12 md:gap-16">

          {/* ── Header ── */}
          <div className="flex flex-col items-center text-center gap-6 md:gap-8 border-b border-[var(--ed-rule)] pb-8 md:pb-12">
            <div className="space-y-6 md:space-y-8 flex flex-col items-center">
              <div className="space-y-2">
                <span 
                  className="text-[11px] tracking-[0.2em] uppercase text-[var(--ed-accent)] font-bold"
                  style={{ fontFamily: F.glacial }}
                >
                  Purification Ritual
                </span>
                <h3 
                  className="text-3xl md:text-5xl font-medium text-[var(--ed-fg)] leading-[1.1] tracking-tight"
                  style={{ fontFamily: F.serif }}
                >
                  The 4 Steps of Ablution
                </h3>
              </div>
            </div>
          </div>

          {/* ── Pre-requisite: Intention ── */}
          <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-8 mt-6 md:mt-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-10 border border-[var(--ed-rule)] bg-[var(--ed-bg)] flex flex-col items-center justify-center shrink-0">
                <Heart size={16} className="text-[var(--ed-accent)]" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg md:text-xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                  Pre-requisite: The Intention
                </h4>
                <p className="text-sm md:text-base text-[var(--ed-fg-muted)] leading-relaxed italic" style={{ fontFamily: F.serif }}>
                  Before beginning, silently state your intention to perform ablution. For example: <span className="text-[var(--ed-fg)]">&ldquo;I intend to perform ablution&rdquo;</span> or <span className="text-[var(--ed-fg)]">&ldquo;Nawaytu al-wudu&rdquo;</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:block h-px w-8 bg-[var(--ed-rule)]" />
              <span className="text-2xl md:text-3xl text-[var(--ed-accent)]" style={{ fontFamily: F.arabic }}>النِّيَّة</span>
            </div>
          </div>

          {/* ── Slideshow View ── */}
          <div className="flex flex-col gap-10 md:gap-14">
            {/* The Active Slide */}
            <div key={slide} className={`flex flex-col ${slide % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}>
              {/* Image side */}
              <div className="w-full md:w-5/12 aspect-[4/3] md:aspect-square relative border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 flex flex-col items-center justify-center p-8">
                {step.image ? (
                  <Image src={step.image} alt={step.title} fill className="object-cover opacity-80 mix-blend-luminosity" />
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <step.icon size={48} className="text-[var(--ed-fg-muted)] opacity-50" strokeWidth={1} />
                    <div className="text-center space-y-3">
                      <span className="text-4xl text-[var(--ed-accent)]" style={{ fontFamily: F.arabic }}>{step.arabic}</span>
                      <p className="text-lg italic text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>&ldquo;Nawaytu al-wudu&rdquo;</p>
                    </div>
                  </div>
                )}
                {step.image && <div className="absolute inset-0 bg-gradient-to-t from-[var(--ed-bg)] via-transparent to-transparent opacity-60" />}
              </div>

              {/* Text side */}
              <div className="w-full md:w-7/12 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-[var(--ed-rule)] pb-4">
                  <span className="text-4xl text-[var(--ed-accent)] italic" style={{ fontFamily: F.serif }}>{(slide + 1).toString().padStart(2, '0')}</span>
                  <div className="h-px flex-1 bg-[var(--ed-rule)]" />
                  {step.image && (
                    <span className="text-3xl text-[var(--ed-accent)] opacity-80" style={{ fontFamily: F.arabic }}>{step.arabic}</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>{step.title}</h3>
                  <p className="text-lg text-[var(--ed-fg)] leading-relaxed" style={{ fontFamily: F.serif }}>{step.description}</p>
                </div>
                
                <div className="mt-2 pt-4 border-t border-[var(--ed-rule)]/50">
                  <p className="text-sm text-[var(--ed-fg-muted)] italic leading-relaxed" style={{ fontFamily: F.serif }}>
                    {step.details}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA / Navigation */}
            <div className="w-full flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
                <button
                  onClick={prev}
                  className="h-12 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/60 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ed-fg)] hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] active:scale-[0.98] transition-all"
                  style={{ fontFamily: F.glacial }}
                >
                  <ChevronLeft size={16} />
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
                  className="h-12 border border-[var(--ed-rule)] bg-[var(--ed-fg)] text-[var(--ed-bg)] flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest hover:bg-[var(--ed-accent)] active:scale-[0.98] transition-all"
                  style={{ fontFamily: F.glacial }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => setSlide(i)}
                    className="flex min-h-11 items-center"
                    aria-label={`Step ${i + 1}: ${s.title}`}
                  >
                    <span
                      className={`h-2 w-full border border-[var(--ed-rule)] transition-colors ${i === slide ? 'bg-[var(--ed-fg)] border-[var(--ed-fg)]' : 'bg-[var(--ed-surface)]/40 hover:bg-[var(--ed-accent)]'}`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-4 md:mt-6">
                <button onClick={openModal} className="group flex items-center gap-4 px-6 py-3 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-500 shrink-0">
                  <div className="size-6 border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Play size={12} fill="currentColor" /></div>
                  <span 
                    className="text-[10px] uppercase tracking-[0.2em] font-bold"
                    style={{ fontFamily: F.glacial }}
                  >
                    Watch Video Guide
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[var(--ed-rule)]" />

          {/* ── Footnotes & Verse ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 w-full">
            {/* Footnotes */}
            <div className="flex flex-col gap-8">
              {FOOTNOTES.map((n, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <n.icon size={16} className="text-[var(--ed-accent)]" />
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--ed-fg)] font-bold" style={{ fontFamily: F.glacial }}>{n.title}</span>
                  </div>
                  <p className="text-sm text-[var(--ed-fg-muted)] leading-relaxed italic" style={{ fontFamily: F.serif }}>
                    {n.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Verse */}
            <div className="flex flex-col gap-5 lg:pl-12 lg:border-l lg:border-[var(--ed-rule)]">
              <span className="text-[11px] uppercase tracking-[0.4em] text-[var(--ed-accent)] font-bold" style={{ fontFamily: F.glacial }}>
                Scriptural Compliance
              </span>
              <p className="text-base text-[var(--ed-fg-muted)] leading-relaxed italic opacity-80 space-y-4" style={{ fontFamily: F.serif }}>
                <span className="block">&ldquo;O you who believe, when you observe the Contact Prayers (Salat), you shall:</span>
                <span className="ml-4 block">(1) wash your faces,</span>
                <span className="ml-4 block">(2) wash your arms to the elbows,</span>
                <span className="ml-4 block">(3) wipe your heads, and</span>
                <span className="ml-4 block">(4) wash your feet to the ankles.</span>
                <span className="block mt-4">If you were unclean due to sexual orgasm, you shall bathe. If you are ill, or traveling, or had any digestive excretion (urinary, fecal, or gas), or had (sexual) contact with the women, and you cannot find water, you shall observe the dry ablution (Tayammum) by touching clean dry soil, then rubbing your faces and hands. GOD does not wish to make the religion difficult for you; He wishes to cleanse you and to perfect His blessing upon you, that you may be appreciative.&rdquo;</span>
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[var(--ed-fg)]" style={{ fontFamily: F.glacial }}>
                <span>Examine Verse</span>
                <QuranRef reference="5:6" />
              </div>
            </div>
          </div>

      </div>
    </div>

    {open && (
      <VideoModal
        isOpen={open}
        onClose={closeModal}
        title="Ablution Guide"
        subtitle="Visual Demonstration"
        youtubeId="Y8QnnhDGgtw"
      />
    )}
    </>
  )
}
