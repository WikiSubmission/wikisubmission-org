'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wraps static article content (Server Components) with GSAP entrance and
 * scroll-triggered animations. Three effects:
 *
 * 1. Header entrance — fades + slides up on page load (not scroll).
 * 2. Section reveals — each `<section>`, `<blockquote>`, and `[data-card]`
 *    element fades in with a stagger as the article enters the viewport.
 * 3. Parallax — any element with `data-parallax` attribute drifts upward
 *    while the user scrolls past it.
 */
export function ArticleAnimations({
  children,
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      const header = el.querySelector('header')
      if (header) {
        gsap.from(header, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'expo.out',
        })
      }

      // 2. Section / blockquote / card stagger reveals
      const revealTargets = el.querySelectorAll(
        'section, blockquote, [data-card]',
      )
      if (revealTargets.length > 0) {
        gsap.from(revealTargets, {
          opacity: 0,
          y: 22,
          duration: 0.65,
          stagger: 0.09,
          ease: 'sine.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            once: true,
          },
        })
      }

      // 3. Parallax decorative elements
      el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((node) => {
        gsap.to(node, {
          y: -36,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return <div ref={containerRef}>{children}</div>
}
