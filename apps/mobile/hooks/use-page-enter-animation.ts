'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import { activeTab, normalizePath, TABS } from '@/constants/navigation'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { gsap } from '@/lib/gsap'
import { useStartupZikr } from '@/lib/startup-zikr-context'

interface EnterVariant {
  x?: number
  y?: number
  duration: number
}

const DEFAULT_VARIANT: EnterVariant = { y: 10, duration: 0.28 }

/** Per-route accents used when no direction can be inferred. */
const ROUTE_VARIANTS: Record<string, EnterVariant> = {
  '/zakat': { y: 18, duration: 0.36 },
}

function depthOf(pathname: string): number {
  return normalizePath(pathname).split('/').filter(Boolean).length
}

function tabIndexOf(pathname: string): number {
  const tab = activeTab(pathname)
  return tab ? TABS.findIndex((t) => t.key === tab.key) : -1
}

/**
 * Direction-aware enter variant: tab switches slide horizontally in the
 * direction of travel along the tab bar, drilling deeper slides in from the
 * right, backing out slides in from the left, and anything else falls back
 * to the default fade/rise.
 */
function enterVariantFor(prev: string | null, pathname: string): EnterVariant {
  const normalized = normalizePath(pathname)
  if (prev !== null) {
    const prevDepth = depthOf(prev)
    const nextDepth = depthOf(pathname)
    const prevTab = tabIndexOf(prev)
    const nextTab = tabIndexOf(pathname)
    if (prevTab !== -1 && nextTab !== -1 && prevTab !== nextTab) {
      return { x: nextTab > prevTab ? 24 : -24, duration: 0.28 }
    }
    if (nextDepth > prevDepth) return { x: 24, duration: 0.28 }
    if (nextDepth < prevDepth) return { x: -24, duration: 0.28 }
  }
  return ROUTE_VARIANTS[normalized] ?? DEFAULT_VARIANT
}

/**
 * Enter-only page transition: on every route change the target element fades
 * in from the direction of travel. Enter-only because App Router swaps the
 * tree synchronously — exit animations would need freezing the outgoing page,
 * which fights the router.
 *
 * clearProps at the end is load-bearing: a lingering transform on <main>
 * would turn it into a containing block and re-anchor position:fixed
 * descendants (verse minimap, sheets).
 */
export function usePageEnterAnimation(targetRef: RefObject<HTMLElement | null>) {
  const pathname = usePathname()
  const reducedMotion = usePrefersReducedMotion()
  const { phase } = useStartupZikr()
  const prevPathRef = useRef<string | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const startupBusy = phase === 'overlay' || phase === 'flying'

  useEffect(() => {
    const prev = prevPathRef.current
    prevPathRef.current = pathname
    // The cold-start paint animates via the zikr overlay flight instead.
    if (prev === null) return
    if (reducedMotion || startupBusy) return
    const el = targetRef.current
    if (!el) return

    tweenRef.current?.kill()
    const { x = 0, y = 0, duration } = enterVariantFor(prev, pathname)
    tweenRef.current = gsap.fromTo(
      el,
      { autoAlpha: 0, x, y },
      {
        autoAlpha: 1,
        x: 0,
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
