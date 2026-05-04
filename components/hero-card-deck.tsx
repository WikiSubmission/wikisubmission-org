'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'

const FRONT = { rotate: 3, scale: 1, x: 0, y: 0 }
const BACK = { rotate: -5, scale: 0.93, x: -16, y: 16 }

export function HeroCardDeck() {
  const [front, setFront] = useState(0)
  const quoteRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => setFront((v) => 1 - v), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const quoteEl = quoteRef.current
    const logoEl = logoRef.current
    if (!quoteEl || !logoEl) return
    const quoteTarget = front === 1 ? FRONT : BACK
    const logoTarget = front === 0 ? FRONT : BACK
    gsap.to(quoteEl, {
      ...quoteTarget,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(logoEl, {
      ...logoTarget,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [front])

  return (
    <div
      className="relative w-full max-w-sm mx-auto md:mx-0 pt-6 pl-6 pb-10 cursor-pointer select-none"
      onClick={() => setFront((v) => 1 - v)}
      title="Click to flip"
    >
      <div className="relative w-full aspect-square">
        {/* Quote card */}
        <div
          ref={quoteRef}
          style={{ zIndex: front === 1 ? 10 : 0 }}
          className="absolute inset-0 rounded-2xl border border-primary/15 overflow-hidden"
          onClick={front === 1 ? (e) => e.stopPropagation() : undefined}
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background" />
          <span className="absolute top-0 right-3 text-[7rem] leading-none text-primary/8 font-serif select-none pointer-events-none">
            &ldquo;
          </span>
          <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/80 italic">
              Surely, those who believe, those who are Jewish, the Christians,
              and the converts; anyone who{' '}
              <span className="not-italic font-semibold text-primary/80">
                (1) believes in GOD
              </span>
              , and{' '}
              <span className="not-italic font-semibold text-primary/80">
                (2) believes in the Last Day
              </span>
              , and{' '}
              <span className="not-italic font-semibold text-primary/80">
                (3) leads a righteous life
              </span>
              , will receive their recompense from their Lord; They have nothing
              to fear, nor will they grieve.
            </p>
            <Link
              href="/quran/2?verse=62"
              className="inline-flex items-center self-start mt-4 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Quran 2:62, 5:69
            </Link>
          </div>
        </div>

        {/* Logo card */}
        <div
          ref={logoRef}
          style={{ zIndex: front === 0 ? 10 : 0 }}
          className="absolute inset-0 bg-surface-container rounded-2xl editorial-shadow group"
        >
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <Image
              src="/brand-assets/logo-transparent.png"
              alt="WikiSubmission"
              width={280}
              height={280}
              className={`w-full h-full object-contain transition-all duration-500 ${
                front === 0
                  ? 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'
                  : 'grayscale opacity-30'
              }`}
            />
          </div>
        </div>

        <div className="absolute -bottom-4 -left-4 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              setFront(i)
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              front === i
                ? 'bg-primary scale-125'
                : 'bg-border hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
