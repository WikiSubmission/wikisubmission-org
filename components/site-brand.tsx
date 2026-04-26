'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
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
    const wiki = root.querySelector('[data-brand-wiki]')
    const submission = root.querySelector('[data-brand-submission]')

    gsap
      .timeline({ defaults: { ease: 'power2.out' } })
      .to(mark, { rotate: -8, scale: 1.08, duration: 0.18 })
      .to(wiki, { y: -1, duration: 0.16 }, '<')
      .to(submission, { letterSpacing: '0.005em', duration: 0.16 }, '<')
      .to([mark, wiki, submission], {
        rotate: 0,
        scale: 1,
        y: 0,
        letterSpacing: '-0.025em',
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
      gsap.set('[data-brand-wiki]', { yPercent: 110, opacity: 0 })
      gsap.set('[data-brand-submission]', { x: -14, opacity: 0 })
      gsap.set('[data-brand-mark]', { opacity: 0, scale: 0.7, rotate: -14 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to('[data-brand-mark]', {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.5,
        ease: 'back.out(1.6)',
      })
        .to(
          '[data-brand-submission]',
          { opacity: 1, x: 0, duration: 0.5 },
          '-=0.3'
        )
        .to(
          '[data-brand-wiki]',
          { opacity: 1, yPercent: 0, duration: 0.55, ease: 'power3.out' },
          '-=0.25'
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
        gap: 12,
        direction: 'ltr',
        unicodeBidi: 'isolate',
        color: 'var(--ed-fg)',
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      <span
        data-brand-mark
        style={{
          display: 'inline-flex',
          transformOrigin: '50% 55%',
          willChange: 'transform',
        }}
      >
        <Image
          src="/brand-assets/logo-transparent.png"
          alt=""
          width={30}
          height={30}
        />
      </span>

      <span
        aria-hidden="true"
        className="max-[380px]:hidden sm:inline-flex"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            lineHeight: 1,
            paddingBottom: 1,
          }}
        >
          <span
            data-brand-wiki
            style={{
              display: 'inline-block',
              fontFamily: F.mono,
              fontSize: 9.5,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--ed-fg-muted)',
              willChange: 'transform, opacity',
            }}
          >
            Wiki
          </span>
        </span>
        <span
          data-brand-submission
          style={{
            display: 'inline-block',
            fontFamily: F.display,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: 'var(--ed-fg)',
            willChange: 'transform, opacity',
          }}
        >
          Submission
        </span>
      </span>
    </Link>
  )
}
