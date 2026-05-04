'use client'
import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
  glacial: 'var(--font-glacial), sans-serif',
  arabic: 'var(--font-amiri), "Scheherazade New", serif',
}

function DividerLine() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let triggered = false
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !triggered) {
            triggered = true
            gsap.fromTo(
              el,
              { scaleX: 0 },
              { scaleX: 1, duration: 1, ease: 'circ.out', delay: 0.2 },
            )
            observer.disconnect()
          }
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--ed-accent)',
        opacity: 0.3,
        transformOrigin: 'left center',
        transform: 'scaleX(0)',
      }}
    />
  )
}

export function SectionDivider({
  num,
  title,
  sub,
}: {
  num: string
  title: string
  sub: string
}) {
  return (
    <div
      className="grid-cols-1 gap-y-3 sm:grid-cols-[auto_auto_1fr_auto] sm:gap-x-5 sm:gap-y-0"
      style={{
        display: 'grid',
        alignItems: 'baseline',
        marginBottom: 64,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontSize: 14,
          fontStyle: 'italic',
          color: 'var(--ed-accent)',
          letterSpacing: '0.1em',
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: 'clamp(28px, 5vw, 32px)',
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
        }}
      >
        {title}
      </span>
      <div
        className="hidden sm:block"
        style={{ height: 1, backgroundColor: 'var(--ed-rule)', position: 'relative' }}
      >
        <DividerLine />
      </div>
      <span
        style={{
          fontFamily: F.glacial,
          fontSize: 11,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.18em',
          color: 'var(--ed-fg-muted)',
          fontWeight: 600,
        }}
      >
        {sub}
      </span>
    </div>
  )
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}
