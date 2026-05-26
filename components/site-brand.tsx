'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
}

type SiteBrandProps = {
  onClick?: () => void
}

export function SiteBrand({ onClick }: SiteBrandProps) {
  const rootRef = useRef<HTMLAnchorElement | null>(null)
  const playedIntroRef = useRef(false)

  const playPop = useCallback(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const mark = root.querySelector('[data-brand-mark]')
    const wordmark = root.querySelector('[data-brand-wordmark]')

    gsap
      .timeline({ defaults: { ease: 'power2.out' } })
      .to(mark, { rotate: -8, scale: 1.08, duration: 0.18 })
      .to(wordmark, { letterSpacing: '0.005em', duration: 0.16 }, '<')
      .to([mark, wordmark], {
        rotate: 0,
        scale: 1,
        letterSpacing: '-0.015em',
        duration: 0.28,
        ease: 'power3.out',
      })
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (
      !root ||
      playedIntroRef.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    playedIntroRef.current = true
    const ctx = gsap.context(() => {
      gsap.set('[data-brand-wordmark]', { x: -14, opacity: 0 })
      gsap.set('[data-brand-mark]', { opacity: 0, scale: 0.7, rotate: -14 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to('[data-brand-mark]', {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.5,
        ease: 'back.out(1.6)',
      }).to(
        '[data-brand-wordmark]',
        { opacity: 1, x: 0, duration: 0.5 },
        '-=0.3'
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <Link
      ref={rootRef}
      href="/"
      onClick={onClick}
      onMouseEnter={playPop}
      onFocus={playPop}
      aria-label="WikiSubmission"
      dir="ltr"
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 'clamp(6px, 1.6vw, 10px)',
        direction: 'ltr',
        unicodeBidi: 'isolate',
        color: 'var(--ed-fg)',
        textDecoration: 'none',
        lineHeight: 1,
        minWidth: 0,
      }}
    >
      <span
        data-brand-mark
        style={{
          display: 'inline-flex',
          width: 'clamp(22px, 5vw, 30px)',
          height: 'clamp(22px, 5vw, 30px)',
          transformOrigin: '50% 55%',
          willChange: 'transform',
          flexShrink: 0,
        }}
      >
        <Image
          src="/brand-assets/logo-transparent.png"
          alt=""
          width={30}
          height={30}
          style={{ width: '100%', height: '100%' }}
        />
      </span>

      <span
        data-brand-wordmark
        aria-hidden="true"
        className="max-[380px]:hidden sm:inline-block"
        style={{
          display: 'inline-block',
          fontFamily: F.display,
          fontSize: 'clamp(16px, 4.2vw, 24px)',
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--ed-fg)',
          lineHeight: 1,
          paddingTop: 'clamp(1px, 0.4vw, 3px)',
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
        }}
      >
        WikiSubmission
      </span>
    </Link>
  )
}
