'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { haptic } from '@/lib/haptics'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { EASE_SETTLE, gsap } from '@/lib/gsap'

interface MobileTopBarProps {
  title: string
  showBack: boolean
}

/**
 * Contextual top bar. On a tab root it shows the section title; on a pushed
 * screen it shows a back chevron. Safe-area aware for the status bar / notch.
 */
export function MobileTopBar({ title, showBack }: MobileTopBarProps) {
  const router = useRouter()
  const t = useTranslations('meHeader')
  const reducedMotion = usePrefersReducedMotion()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const firstTitleRef = useRef(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 16))
    }
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', sync)
    }
  }, [])

  useLayoutEffect(() => {
    const heading = titleRef.current
    if (!heading || reducedMotion || firstTitleRef.current) {
      firstTitleRef.current = false
      return
    }
    const rtlMultiplier = document.documentElement.dir === 'rtl' ? -1 : 1
    gsap.fromTo(
      heading,
      { autoAlpha: 0, x: (showBack ? 10 : -8) * rtlMultiplier },
      { autoAlpha: 1, x: 0, duration: 0.3, ease: EASE_SETTLE, overwrite: 'auto' },
    )
  }, [reducedMotion, showBack, title])

  useLayoutEffect(() => {
    const back = backRef.current
    if (!back || reducedMotion) return
    const rtlMultiplier = document.documentElement.dir === 'rtl' ? -1 : 1
    gsap.fromTo(
      back,
      { autoAlpha: 0, x: -8 * rtlMultiplier, scale: 0.94 },
      { autoAlpha: 1, x: 0, scale: 1, duration: 0.28, ease: EASE_SETTLE },
    )
  }, [reducedMotion, showBack])

  return (
    <header
      className="glass-nav bg-background/80 mobile-top-bar fixed inset-x-0 top-0 z-40 border-b"
      data-scrolled={scrolled ? 'true' : 'false'}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: scrolled
          ? 'color-mix(in oklab, var(--background), transparent 8%)'
          : 'color-mix(in oklab, var(--background), transparent 20%)',
        boxShadow: scrolled ? '0 10px 28px -24px rgba(0,0,0,0.55)' : 'none',
      }}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        {showBack ? (
          <button
            ref={backRef}
            type="button"
            aria-label={t('back')}
            onClick={() => {
              haptic('light')
              router.back()
            }}
            className="mobile-header-action text-foreground hover:bg-muted -ms-1 flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <ChevronLeft className="rtl-flip size-5" aria-hidden="true" />
          </button>
        ) : null}
        <h1 ref={titleRef} className="font-display truncate text-lg">
          {title}
        </h1>
      </div>
    </header>
  )
}
