'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

/** Drag distance (after resistance) that arms a refresh on release. */
const TRIGGER_PX = 64
/** Content offset held while the refresh runs. */
const HOLD_PX = 52
/** Pull resistance: content follows the finger at this fraction. */
const RESISTANCE = 0.45
const MAX_PULL_PX = 96

/**
 * Touch-driven pull-to-refresh for the Today screen. The page scrolls at the
 * window level, so a downward drag that starts at scrollY 0 is a pull: the
 * content follows with resistance while a spinner fades in above it; past
 * the threshold, release runs `onRefresh` with the content held down until
 * it settles. Mouse/trackpad users are unaffected (touch events only).
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown>
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [refreshing, setRefreshing] = useState(false)
  const refreshingRef = useRef(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const spinner = spinnerRef.current
    if (!wrap || !spinner) return

    let startY: number | null = null
    let pull = 0

    const setPull = (next: number) => {
      pull = next
      gsap.set(wrap, { y: pull })
      gsap.set(spinner, {
        autoAlpha: Math.min(1, pull / TRIGGER_PX),
        rotation: (pull / TRIGGER_PX) * 180,
      })
    }

    const reset = () => {
      startY = null
      if (pull === 0) return
      gsap.to(wrap, { y: 0, duration: 0.3, ease: 'power2.out' })
      gsap.to(spinner, { autoAlpha: 0, duration: 0.2 })
      pull = 0
    }

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || window.scrollY > 0) return
      startY = e.touches[0]?.clientY ?? null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (startY === null || refreshingRef.current) return
      const dy = (e.touches[0]?.clientY ?? startY) - startY
      if (dy <= 0 || window.scrollY > 0) {
        if (pull > 0) reset()
        return
      }
      // Own the gesture: without this the webview rubber-bands instead.
      e.preventDefault()
      setPull(Math.min(MAX_PULL_PX, dy * RESISTANCE))
    }

    const onTouchEnd = () => {
      if (startY === null) return
      const armed = pull >= TRIGGER_PX
      startY = null
      if (!armed) {
        reset()
        return
      }
      refreshingRef.current = true
      setRefreshing(true)
      gsap.to(wrap, { y: HOLD_PX, duration: 0.2, ease: 'power2.out' })
      const spin = gsap.to(spinner, { rotation: '+=360', duration: 0.8, ease: 'none', repeat: -1 })
      void onRefresh()
        .catch(() => {})
        .finally(() => {
          spin.kill()
          refreshingRef.current = false
          setRefreshing(false)
          pull = HOLD_PX
          reset()
        })
    }

    // touchmove must be non-passive to preventDefault the native overscroll.
    wrap.addEventListener('touchstart', onTouchStart, { passive: true })
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })
    wrap.addEventListener('touchend', onTouchEnd)
    wrap.addEventListener('touchcancel', onTouchEnd)
    return () => {
      wrap.removeEventListener('touchstart', onTouchStart)
      wrap.removeEventListener('touchmove', onTouchMove)
      wrap.removeEventListener('touchend', onTouchEnd)
      wrap.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onRefresh])

  if (reducedMotion) {
    // Reduced motion: no gesture-driven animation; the 5-minute auto-refetch
    // and explicit retry buttons still cover refresh.
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div
        ref={spinnerRef}
        aria-hidden={!refreshing}
        className="pointer-events-none absolute inset-x-0 top-2 z-0 flex justify-center"
        style={{ visibility: 'hidden' }}
      >
        <RefreshCw className="text-primary size-5" aria-label="Refreshing" />
      </div>
      <div ref={wrapRef} className="relative z-10">
        {children}
      </div>
    </div>
  )
}
