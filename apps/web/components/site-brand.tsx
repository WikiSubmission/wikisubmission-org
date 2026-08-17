'use client'

import { useEffect, useRef } from 'react'
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

  const animateHover = (hovered: boolean) => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mark = root.querySelector('[data-brand-mark]')
    const wordmark = root.querySelector('[data-brand-wordmark]')
    gsap.to(mark, {
      rotate: hovered ? 2.5 : 0,
      scale: hovered ? 1.04 : 1,
      duration: hovered ? 0.28 : 0.34,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(wordmark, {
      letterSpacing: hovered ? '0.01em' : '-0.015em',
      duration: 0.28,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <Link
      ref={rootRef}
      href="/"
      onClick={onClick}
      onMouseEnter={() => animateHover(true)}
      onMouseLeave={() => animateHover(false)}
      aria-label="WikiSubmission"
      className="site-brand"
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
          alignItems: 'center',
          justifyContent: 'center',
          width: 'clamp(30px, 7vw, 36px)',
          height: 'clamp(30px, 7vw, 36px)',
          transformOrigin: '50% 55%',
          willChange: 'transform',
          flexShrink: 0,
        }}
      >
        <Image
          src="/brand-assets/logo-mark.png"
          alt=""
          width={40}
          height={40}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </span>

      <span
        data-brand-wordmark
        aria-hidden="true"
        className="hidden min-[420px]:inline-flex"
        style={{
          alignItems: 'center',
          fontFamily: F.display,
          fontSize: 'clamp(17px, 4.6vw, 24px)',
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--ed-fg)',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
        }}
      >
        WikiSubmission
      </span>
    </Link>
  )
}
