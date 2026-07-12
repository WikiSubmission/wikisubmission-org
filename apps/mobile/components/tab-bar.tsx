'use client'

import { useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeTab, TABS } from '@/constants/navigation'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { gsap } from '@/lib/gsap'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

/**
 * Fixed bottom tab bar — the primary navigation surface on mobile. Safe-area
 * aware so it clears the home indicator on notched devices, and gives a light
 * haptic tap on selection. A small pill slides along the top edge to the
 * active tab.
 */
export function TabBar() {
  const pathname = usePathname()
  const current = activeTab(pathname)
  const reducedMotion = usePrefersReducedMotion()

  const listRef = useRef<HTMLUListElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const positionedRef = useRef(false)

  const activeKey = current?.key ?? null
  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!list || !indicator) return
    if (!activeKey) {
      gsap.set(indicator, { autoAlpha: 0 })
      positionedRef.current = false
      return
    }
    const item = list.querySelector<HTMLElement>(`[data-tab="${activeKey}"]`)
    if (!item) return
    const x = item.offsetLeft + item.offsetWidth / 2
    if (!positionedRef.current || reducedMotion) {
      // First paint (or reduced motion): appear in place, no travel.
      gsap.set(indicator, { x, xPercent: -50, autoAlpha: 1 })
      positionedRef.current = true
      return
    }
    gsap.to(indicator, {
      x,
      xPercent: -50,
      autoAlpha: 1,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [activeKey, reducedMotion])

  return (
    <nav
      aria-label="Primary"
      className="glass-nav bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto max-w-md">
        {/* Active-tab pill; positioned by the effect above. */}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="bg-primary absolute -top-px left-0 h-0.5 w-10 rounded-full"
          style={{ visibility: 'hidden' }}
        />
        <ul ref={listRef} className="flex h-16 items-stretch">
          {TABS.map((tab) => {
            const isActive = current?.key === tab.key
            const Icon = tab.icon
            return (
              <li key={tab.key} className="flex-1" data-tab={tab.key}>
                <Link
                  href={tab.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => haptic('light')}
                  className={cn(
                    'flex h-full flex-col items-center justify-center gap-1 text-[0.625rem] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
