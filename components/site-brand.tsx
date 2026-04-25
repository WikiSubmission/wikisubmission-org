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
    const wiki = root.querySelector('[data-brand-wiki]')
    const submission = root.querySelector('[data-brand-submission]')

    gsap
      .timeline({ defaults: { ease: 'back.out(2.2)' } })
      .to(mark, { scale: 1.18, rotate: -5, duration: 0.16 })
      .to(wiki, { y: -2, scale: 1.06, duration: 0.16 }, '<0.03')
      .to(submission, { y: 2, scale: 1.03, duration: 0.16 }, '<0.04')
      .to([mark, wiki, submission], {
        scale: 1,
        y: 0,
        rotate: 0,
        duration: 0.22,
        ease: 'power2.out',
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
      gsap.fromTo(
        '[data-brand-mark]',
        { opacity: 0, scale: 0.82, rotate: -12 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.42, ease: 'back.out(2)' }
      )
      gsap.fromTo(
        '[data-brand-wiki]',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out', delay: 0.08 }
      )
      gsap.fromTo(
        '[data-brand-submission]',
        { opacity: 0, x: 8 },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out', delay: 0.16 }
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
        gap: 10,
        direction: 'ltr',
        unicodeBidi: 'isolate',
        fontFamily: F.display,
        fontSize: 23,
        fontWeight: 600,
        letterSpacing: '-0.025em',
        color: 'var(--ed-fg)',
        lineHeight: 1,
        textDecoration: 'none',
      }}
    >
      <span data-brand-mark style={{ display: 'inline-flex', transformOrigin: '50% 55%' }}>
        <Image src="/brand-assets/logo-transparent.png" alt="" width={28} height={28} />
      </span>
      <span
        aria-hidden="true"
        className="max-[380px]:hidden sm:inline whitespace-nowrap"
      >
        <span data-brand-wiki style={{ display: 'inline-block' }}>
          Wiki
        </span>
        <span data-brand-submission style={{ display: 'inline-block' }}>
          Submission
        </span>
      </span>
    </Link>
  )
}
