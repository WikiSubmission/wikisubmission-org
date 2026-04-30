'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight,
  Droplets, User, Heart, AlertCircle, Wind, Waves,
  Play, X, BookOpen, Clock, Activity,
} from 'lucide-react'
import Link from 'next/link'
import { F } from '../_sections/shared'


const STEPS = [
  { title: 'The Intention', description: 'Before beginning, silently state your intention to perform ablution in preparation for the Contact Prayer.', details: 'Pure intention (Niyyah) is the spiritual foundation of all worship in Submission.', icon: Heart, arabic: 'النِّيَّة' },
  { title: 'Wash Face', description: 'The first physical step is to wash your face completely.', details: 'Ensure water reaches all parts of the face, from hairline to chin and ear to ear.', icon: Droplets, arabic: 'غَسْلُ الْوَجْه', image: '/images/ablution/step-face.png' },
  { title: 'Wash Arms to Elbows', description: 'Wash your right arm up to and including the elbow, then repeat with the left arm.', details: 'The Quranic command specifies "your arms to the elbows" [5:6].', icon: Droplets, arabic: 'غَسْلُ الْيَدَيْن', image: '/images/ablution/step-arms.png' },
  { title: 'Wipe the Head', description: 'Wipe your head with wet hands.', details: 'The head is to be "wiped" (Masah) with wet hands, not washed under running water.', icon: User, arabic: 'مَسْحُ الرَّأْس', image: '/images/ablution/step-head.png' },
  { title: 'Wash Feet to Ankles', description: 'Wash your right foot up to the ankle, then repeat with the left foot.', details: 'This final step completes the physical purification required for the Contact Prayer.', icon: Droplets, arabic: 'غَسْلُ الرِّجْلَيْن', image: '/images/ablution/step-feet.png' },
]


const FOOTNOTES = [
  { title: 'Major Ablution (Ghusl)', text: 'If you were unclean due to sexual orgasm, you shall bathe.', icon: Waves },
  { title: 'Dry Ablution (Tayammum)', text: 'If you are ill, or traveling, or had any digestive excretion (urinary, fecal, or gas), or had (sexual) contact with the women, and you cannot find water, you shall observe the dry ablution (Tayammum) by touching clean dry soil, then rubbing your faces and hands.', icon: Wind },
  { title: 'Purpose of Purification', text: 'GOD does not wish to make the religion difficult for you; He wishes to cleanse you and to perfect His blessing upon you, that you may be appreciative.', icon: Heart },
]

const VIDEO_CAPTIONS = [
  { start: 0.0, end: 3.7, text: "We find this commandment in Sura number 5, verse number 6." },
  { start: 3.7, end: 7.1, text: "And I will quote the verse for you. It says:" },
  { start: 7.1, end: 8.9, text: "“O you who believe,", isVerse: true },
  { start: 8.9, end: 18.0, text: "when you get up for the Salat prayer, you shall wash your face, your arms to the elbows,", isVerse: true },
  { start: 18.0, end: 20.5, text: "wipe your hair, and wash your feet.”", isVerse: true },
  { start: 20.6, end: 25.84, text: "4 steps, and these are the words that came out of the prophet Muhammad’s mouth." },
  { start: 25.84, end: 27.78, text: "These are the words of God." },
  { start: 27.78, end: 32.26, text: "And God is saying 'you shall observe the ablution 4 steps.'" },
  { start: 32.26, end: 38.29, text: "Washing the face, arms to the elbows, wipe your head, and wash your feet." },
  { start: 38.29, end: 43.16, text: "These are the 4 steps as dictated in Quran." },
  { start: 43.16, end: 49.73, text: "However, like everything else, innovations, superstitions," },
  { start: 49.73, end: 53.96, text: "traditions crept into God’s commandment and Satan distorted the commandment." },
  { start: 53.96, end: 61.36, text: "Now, the vast majority of Muslims observe something like 9 or 10 steps in ablution." },
  { start: 61.36, end: 67.04, text: "And this is very serious because it simply means that there is some other god" },
  { start: 67.04, end: 74.02, text: "who told them to do the ablution 9 steps. They wash their hands, mouth, nose," },
  { start: 74.02, end: 79.74, text: "face, ears, neck. They have all kinds of innovations and additions." },
  { start: 79.74, end: 86.0, text: "And I would like to warn you that you must never increase the steps", isWarning: true },
  { start: 86.0, end: 93.04, text: "or decrease them, the steps of ablution. You must obey exactly what God told you in Quran.", isWarning: true },
  { start: 93.04, end: 98.8, text: "If you want to wash more, you might as well take a shower" },
  { start: 98.8, end: 100.99, text: "or do whatever you want, but outside the ablution." },
  { start: 100.99, end: 107.86, text: "If you are taking a shower or a bath, you can do the ablution" },
  { start: 107.86, end: 109.7, text: "after the shower or the bath while you are still in the shower." },
  { start: 109.7, end: 114.7, text: "But you have to go through the motions of ablution as I will show you now." },
  { start: 114.7, end: 120.26, text: "So, let me show you, demonstrate to you how to do the ablution." },
  { start: 120.26, end: 125.46, text: "First of all, you roll your sleeves so you can wash your arms to the elbows." },
  { start: 127.62, end: 134.9, text: "There we go. We are now demonstrating the ablution." },
  { start: 135.02, end: 145.18, text: "You go to the faucet, and the first step in Quran is wash your face. So, you wash your face." },
  { start: 145.18, end: 150.18, text: "Here we go. Bism Allah Al-rahman Al-raheem." },
  { start: 150.18, end: 153.66, text: "Okay, let me stop right here and remind you of something." },
  { start: 153.66, end: 161.78, text: "You should make an intention, that is you say 'I intend to observe the Wuḍū, or the ablution.'" },
  { start: 161.78, end: 168.5, text: "Before you do that and you say 'Bism Allah Al-rahman Al-raheem.' And you commemorate God in anyway you want." },
  { start: 168.5, end: 172.78, text: " You say 'Alhamdu Lillah', 'Subḥān Allāh', 'Allahu akbar,' anything you want to commemorate God." },
  { start: 172.78, end: 176.86, text: "But if you want to say it in Arabic, the intention should be;" },
  { start: 176.86, end: 181.78, text: "“nawayatu al-wuḍū, Bism Allah Al-rahman Al-raheem.”" },
  { start: 181.78, end: 185.3, text: "So, here we go. “Bism Allah Al-rahman Al-raheem, nawayatu al-Wuḍū.”" },
  { start: 185.3, end: 189.7, text: "Then the first step, you wash your face." },
  { start: 194.9, end: 201.86, text: "Okay, I washed my face twice, and I feel like I did a good job. So, this is good enough." },
  { start: 201.86, end: 205.38, text: "There is no set number of washing your face." },
  { start: 205.9, end: 210.22, text: "The second step, the arms to the elbows. So, here we go," },
  { start: 210.22, end: 224.38, text: "washing the arm to the elbow. Right arm and then the left arm, the same thing." },
  { start: 232.18, end: 236.3, text: "And this takes care of the second step." },
  { start: 236.3, end: 239.74, text: "The third step is you wipe your hair." },
  { start: 239.74, end: 247.7, text: "So, what I will do is I wet my hands and then I wipe my hair, my head, like this." },
  { start: 247.7, end: 254.98, text: "And this is the third step. The final step is wash your feet to the ankles." },
  { start: 254.98, end: 262.28, text: "So, you put your foot there wash it thoroughly. And this takes care of the right foot." },
  { start: 262.28, end: 266.5, text: "And then the left foot." },
  { start: 276.46, end: 279.78, text: "That's it. There you have it, the 4 steps of Wuḍū, very simple." },
  { start: 279.78, end: 283.38, text: "Don’t add any more steps, and don’t reduce the steps." },
  { start: 294.66, end: 300.26, text: "Now that you finished the 4 steps of Wuḍū, wash your face, your arms to the elbows," },
  { start: 300.26, end: 305.74, text: "wipe your head and wash your feet, you are ready for the Salat Prayer." },
]


// ── COMPONENT ─────────────────────────────────────────────────────────

export function AblutionSlideshow() {
  const [slide, setSlide] = useState(0)
  const [open, setOpen] = useState(false)
  const [showTranscription, setShowTranscription] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = STEPS[slide]
  const StepIcon = step.icon
  const activeCaption = VIDEO_CAPTIONS.find(c => currentTime >= c.start && currentTime <= c.end)

  // ── YouTube API Setup ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    // Load YouTube IFrame API if not already present
    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('yt-player', {
        videoId: 'Y8QnnhDGgtw',
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 1,
        },
        events: {
          onReady: () => {
            startTimer()
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              startTimer()
            } else {
              stopTimer()
            }
          }
        }
      })
    }

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer()
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      stopTimer()
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [open])

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 50)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const next = () => setSlide(p => (p + 1) % STEPS.length)
  const prev = () => setSlide(p => (p - 1 + STEPS.length) % STEPS.length)

  const openModal = () => { setOpen(true); setCurrentTime(0) }
  const closeModal = () => { setOpen(false); setCurrentTime(0) }

  return (
    <section className="relative py-16 border-t border-[var(--ed-rule)] bg-[var(--ed-bg)]">
      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col gap-12">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--ed-rule)] pb-12">
            <div className="space-y-4">
              <span 
                className="text-[11px] tracking-[0.2em] uppercase text-[var(--ed-accent)] font-bold"
                style={{ fontFamily: F.glacial }}
              >
                Purification Ritual
              </span>
              <h2 
                className="text-4xl md:text-6xl font-medium text-[var(--ed-fg)] leading-[1.1] tracking-tight"
                style={{ fontFamily: F.serif }}
              >
                The Ablution
              </h2>
            </div>
            <div className="flex items-center gap-6">
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
              <div className="flex items-center gap-2">
                <button onClick={prev} className="size-14 rounded-none border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 flex items-center justify-center hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] transition-all active:scale-95"><ChevronLeft size={24} /></button>
                <button onClick={next} className="size-14 rounded-none border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 flex items-center justify-center hover:bg-[var(--ed-fg)] hover:text-[var(--ed-bg)] transition-all active:scale-95"><ChevronRight size={24} /></button>
              </div>
            </div>
          </div>

          {/* ── Editorial modules ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1px bg-[var(--ed-rule)] border border-[var(--ed-rule)] max-w-6xl mx-auto shadow-2xl">
            {/* Left */}
            <div className="lg:col-span-6 flex flex-col border-r border-[var(--ed-rule)] bg-[var(--ed-bg)]">
              <div className="h-10 px-6 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)] flex items-center gap-3">
                <span 
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg)] font-bold"
                  style={{ fontFamily: F.glacial }}
                >
                  DECREE
                </span>
                <div className="h-3 w-px bg-[var(--ed-rule)]" />
                <span 
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg-muted)]"
                  style={{ fontFamily: F.glacial }}
                >
                  SURA 5:6
                </span>
              </div>
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div key={slide} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        <div className="h-px flex-1 bg-[var(--ed-rule)]" />
                        <span 
                          className="text-4xl text-[var(--ed-accent)] leading-none"
                          style={{ fontFamily: F.arabic }}
                        >
                          {step.arabic}
                        </span>
                        <div className="h-px flex-1 bg-[var(--ed-rule)]" />
                      </div>
                      <h3 
                        className="text-2xl md:text-3xl font-semibold text-[var(--ed-fg)] tracking-tight leading-tight text-center"
                        style={{ fontFamily: F.serif }}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <p 
                        className="text-xl text-[var(--ed-fg)] leading-relaxed text-center"
                        style={{ fontFamily: F.serif }}
                      >
                        {step.description}
                      </p>
                      <div className="max-w-md mx-auto py-6 border-t border-b border-[var(--ed-rule)] flex flex-col items-center gap-4">
                        <div 
                          className="text-[9px] uppercase tracking-[0.3em] text-[var(--ed-accent)] font-bold"
                          style={{ fontFamily: F.glacial }}
                        >
                          Scriptural Detail
                        </div>
                        <p 
                          className="text-sm italic text-[var(--ed-fg-muted)] leading-relaxed text-center px-4"
                          style={{ fontFamily: F.serif }}
                        >
                          {step.details}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {/* Right */}
            <div className="lg:col-span-6 bg-[var(--ed-surface)]/30 flex flex-col">
              <div className="h-10 px-4 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)] flex items-center justify-between">
                <div className="flex gap-1.5"><div className="size-2.5 rounded-full bg-[#ff5f56]" /><div className="size-2.5 rounded-full bg-[#ffbd2e]" /><div className="size-2.5 rounded-full bg-[#27c93f]" /></div>
                <div className="flex items-center gap-3">
                  <span 
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg)] font-bold"
                    style={{ fontFamily: F.glacial }}
                  >
                    EDITOR
                  </span>
                  <div className="h-3 w-px bg-[var(--ed-rule)]" />
                  <span 
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    PURIFICATION GUIDE
                  </span>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-center p-6 md:p-12 min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={slide} 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 1.02 }} 
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
                    className="w-full h-full relative"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--ed-bg)] border border-[var(--ed-rule)] shadow-inner group overflow-hidden">
                      {slide === 0 ? (
                        <div className="text-center space-y-10 p-8">
                          <div className="space-y-4">
                            <span 
                              className="text-6xl text-[var(--ed-accent)] block mb-4"
                              style={{ fontFamily: F.arabic }}
                            >
                              نويت الوضوء
                            </span>
                            <p 
                              className="text-2xl italic text-[var(--ed-fg)]"
                              style={{ fontFamily: F.serif }}
                            >
                              "Nawaytu al-wudu"
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 justify-center">
                            <div className="h-px w-8 bg-[var(--ed-rule)]" />
                             <span 
                               className="text-[10px] uppercase tracking-[0.5em] text-[var(--ed-fg-muted)] font-bold"
                               style={{ fontFamily: F.glacial }}
                             >
                               OR
                             </span>
                            <div className="h-px w-8 bg-[var(--ed-rule)]" />
                          </div>

                          <div className="space-y-4">
                            <p 
                              className="text-2xl italic text-[var(--ed-fg)]"
                              style={{ fontFamily: F.serif }}
                            >
                              "I intend to perform ablution"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full relative flex flex-col">
                          {step.image ? (
                            <>
                              <div className="flex-1 relative overflow-hidden">
                                <img 
                                  src={step.image} 
                                  alt={step.title}
                                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ed-bg)] via-transparent to-transparent opacity-60" />
                              </div>
                              <div className="p-6 bg-[var(--ed-bg)] border-t border-[var(--ed-rule)]">
                                <p 
                                  className="text-[11px] md:text-xs leading-relaxed text-[var(--ed-fg)] italic text-center px-4"
                                  style={{ fontFamily: F.serif }}
                                >
                                  "O you who believe, when you observe the Contact Prayers (Salat), you shall:{" "}
                                  <span className={cn("transition-all duration-500", slide === 1 ? "text-[var(--ed-accent)] font-bold not-italic underline underline-offset-4 decoration-[var(--ed-accent)]/40" : "opacity-40")}>
                                    (1) wash your faces
                                  </span>,{" "}
                                  <span className={cn("transition-all duration-500", slide === 2 ? "text-[var(--ed-accent)] font-bold not-italic underline underline-offset-4 decoration-[var(--ed-accent)]/40" : "opacity-40")}>
                                    (2) wash your arms to the elbows
                                  </span>,{" "}
                                  <span className={cn("transition-all duration-500", slide === 3 ? "text-[var(--ed-accent)] font-bold not-italic underline underline-offset-4 decoration-[var(--ed-accent)]/40" : "opacity-40")}>
                                    (3) wipe your heads
                                  </span>, and{" "}
                                  <span className={cn("transition-all duration-500", slide === 4 ? "text-[var(--ed-accent)] font-bold not-italic underline underline-offset-4 decoration-[var(--ed-accent)]/40" : "opacity-40")}>
                                    (4) wash your feet to the ankles
                                  </span>...{" "}
                                  <span className="font-glacial text-[10px] uppercase tracking-widest not-italic opacity-60 ml-1">
                                    Quran 5:6
                                  </span>"
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-10 h-full">
                              <div className="relative">
                                <div className="size-32 border border-[var(--ed-rule)] flex items-center justify-center bg-[var(--ed-surface)] relative z-10 transition-transform duration-700 group-hover:rotate-45">
                                  <StepIcon size={48} strokeWidth={1} className="text-[var(--ed-fg)] opacity-40 group-hover:opacity-80 group-hover:-rotate-45 transition-all duration-700" />
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
                                  Awaiting Demonstration
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="flex flex-col items-center gap-8 -mt-6">
            <button onClick={openModal} className="group flex items-center gap-4 px-8 py-4 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-500 shadow-xl">
              <div className="size-8 rounded-full border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Play size={14} fill="currentColor" /></div>
              <span 
                className="text-[11px] uppercase tracking-[0.3em] font-bold"
                style={{ fontFamily: F.glacial }}
              >
                Watch Video Guide
              </span>
            </button>
            <div className="flex flex-wrap justify-center gap-3">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`h-2 border border-[var(--ed-rule)] transition-all duration-700 ${i === slide ? 'w-16 bg-[var(--ed-fg)] border-[var(--ed-fg)]' : 'w-2 bg-transparent hover:w-8 hover:bg-[var(--ed-accent)]'}`} aria-label={`Step ${i + 1}`} />
              ))}
            </div>
          </div>

          {/* ── Footnotes ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[var(--ed-rule)]">
            {FOOTNOTES.map((n, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3"><n.icon size={14} className="text-[var(--ed-accent)]" /><span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg)] font-bold" style={{ fontFamily: F.glacial }}>{n.title}</span></div>
                <p 
                  className="text-xs text-[var(--ed-fg-muted)] leading-relaxed italic"
                  style={{ fontFamily: F.serif }}
                >
                  {n.text}
                </p>
              </div>
            ))}
          </div>

          {/* ── Verse ── */}
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto text-center border-t border-[var(--ed-rule)] pt-8">
            <span 
              className="text-[10px] uppercase tracking-[0.4em] text-[var(--ed-accent)] font-bold"
              style={{ fontFamily: F.glacial }}
            >
              Scriptural Compliance
            </span>
            <p 
              className="text-sm text-[var(--ed-fg-muted)] leading-relaxed italic opacity-80"
              style={{ fontFamily: F.serif }}
            >
              "O you who believe, when you observe the Contact Prayers (Salat), you shall: (1) wash your faces, (2) wash your arms to the elbows, (3) wipe your heads, and (4) wash your feet to the ankles. If you were unclean due to sexual orgasm, you shall bathe. If you are ill, or traveling, or had any digestive excretion (urinary, fecal, or gas), or had (sexual) contact with the women, and you cannot find water, you shall observe the dry ablution (Tayammum) by touching clean dry soil, then rubbing your faces and hands. GOD does not wish to make the religion difficult for you; He wishes to cleanse you and to perfect His blessing upon you, that you may be appreciative."
            </p>
            <Link 
              href="/quran/5:6"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ed-fg)] hover:text-[var(--ed-accent)] transition-colors"
              style={{ fontFamily: F.glacial }}
            >
              <span>Examine Verse 5:6</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          YOUTUBE EXHIBITION DISPLAY
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ed-bg)]/98 backdrop-blur-xl"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl mx-auto p-4 md:p-12 flex flex-col gap-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--ed-rule)] pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-[10px] uppercase tracking-[0.3em] text-[var(--ed-fg)] font-bold"
                      style={{ fontFamily: F.glacial }}
                    >
                      Ablution Guide
                    </span>
                  </div>
                  <h3 
                    className="text-2xl text-[var(--ed-fg)] italic"
                    style={{ fontFamily: F.serif }}
                  >
                    Visual Demonstration
                  </h3>
                </div>
                <button onClick={closeModal} className="size-12 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all border-none">
                  <X size={20} />
                </button>
              </div>

              {/* EXHIBITION DISPLAY */}
              <div className="flex flex-col gap-10">

                {/* The Display Case */}
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                  <div className="relative aspect-video bg-black border-[12px] border-[var(--ed-surface)] shadow-2xl ring-1 ring-[var(--ed-rule)] overflow-hidden">
                    <div id="yt-player" className="w-full h-full" />

                    {/* Display Glare Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] z-10" />
                  </div>

                  {/* Status Bar */}
                  <div className="h-10 px-4 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[var(--ed-fg-muted)]" />
                        <span 
                          className="text-[10px] text-[var(--ed-fg)]"
                          style={{ fontFamily: F.mono }}
                        >
                          {Math.floor(currentTime)}s
                        </span>
                      </div>
                      <div className="h-3 w-px bg-[var(--ed-rule)]" />
                      <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full animate-pulse ${showTranscription ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span 
                          className="text-[9px] uppercase tracking-widest text-[var(--ed-fg-muted)]"
                          style={{ fontFamily: F.glacial }}
                        >
                          Transcription {showTranscription ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="text-[9px] uppercase tracking-[0.2em] text-[var(--ed-accent)] font-bold"
                      style={{ fontFamily: F.glacial }}
                    >
                      Exhibition Mode
                    </div>
                  </div>
                </div>

                {/* Dedicated Caption Display (Directly Under) */}
                <div className="max-w-4xl mx-auto w-full space-y-6">
                  <div className="p-8 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 min-h-[140px] flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--ed-rule)] pb-3">
                        <span 
                          className="text-[10px] uppercase tracking-[0.4em] text-[var(--ed-fg)] font-bold"
                          style={{ fontFamily: F.glacial }}
                        >
                          Transcription
                        </span>
                        <button
                          onClick={() => setShowTranscription(!showTranscription)}
                          className={`px-3 py-1 text-[9px] uppercase tracking-widest transition-all ${showTranscription ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                          style={{ fontFamily: F.glacial }}
                        >
                          Toggle {showTranscription ? 'Off' : 'On'}
                        </button>
                      </div>

                      <div className="flex items-center justify-center min-h-[80px]">
                        <AnimatePresence mode="wait">
                          {!showTranscription ? (
                            <motion.p 
                              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} 
                              className="text-sm uppercase tracking-widest text-center"
                              style={{ fontFamily: F.glacial }}
                            >
                              Transcription Disabled
                            </motion.p>
                          ) : activeCaption ? (
                            <motion.p
                              key={activeCaption.text}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-2xl md:text-3xl leading-relaxed text-center max-w-3xl italic"
                              style={{ 
                                fontFamily: F.serif,
                                color: activeCaption.isVerse ? '#D4AF37' : activeCaption.isWarning ? '#EF4444' : 'var(--ed-fg)' 
                              }}
                            >
                              {activeCaption.text}
                            </motion.p>
                          ) : (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.3 }}
                              className="text-sm uppercase tracking-widest text-center"
                              style={{ fontFamily: F.glacial }}
                            >
                              Awaiting Audio Signal...
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Instructions footer */}
              <div className="flex items-center gap-4 justify-center pt-4 opacity-30">
                <div className="h-px w-24 bg-[var(--ed-rule)]" />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
