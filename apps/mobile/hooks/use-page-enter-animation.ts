'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useStartupZikr } from '@/lib/startup-zikr-context'

interface EnterVariant {
  y: number
  duration: number
}

const DEFAULT_VARIANT: EnterVariant = { y: 10, duration: 0.28 }

/** Per-route accents on top of the default fade/rise. */
const ROUTE_VARIANTS: Record<string, EnterVariant> = {
  '/zakat': { y: 18, duration: 0.36 },
}

function enterVariantFor(pathname: string): EnterVariant {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return ROUTE_VARIANTS[normalized] ?? DEFAULT_VARIANT
}

/**
 * Enter-only page transition: on every route change the target element fades
 * and rises in. Enter-only because App Router swaps the tree synchronously —
 * exit animations would need freezing the outgoing page, which fights the
 * router.
 *
 * clearProps at the end is load-bearing: a lingering transform on <main>
 * would turn it into a containing block and re-anchor position:fixed
 * descendants (verse minimap, sheets).
 */
export function usePageEnterAnimation(targetRef: RefObject<HTMLElement | null>) {
  const pathname = usePathname()
  const reducedMotion = usePrefersReducedMotion()
  const { phase } = useStartupZikr()
  const firstRenderRef = useRef(true)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const startupBusy = phase === 'overlay' || phase === 'flying'

  useEffect(() => {
    // The cold-start paint animates via the zikr overlay flight instead.
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    if (reducedMotion || startupBusy) return
    const el = targetRef.current
    if (!el) return

    tweenRef.current?.kill()
    const { y, duration } = enterVariantFor(pathname)
    tweenRef.current = gsap.fromTo(
      el,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
    return () => {
      tweenRef.current?.kill()
      tweenRef.current = null
      gsap.set(el, { clearProps: 'transform,opacity,visibility' })
    }
    // Re-run on navigation only; reducedMotion/startupBusy just gate it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
}
