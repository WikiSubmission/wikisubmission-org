'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from '@/lib/gsap'

export interface GsapPresenceProps {
  /** Whether the content should be shown. Flipping to false plays the exit
   *  tween and unmounts the wrapper when it completes. */
  show: boolean
  /** Tween-from vars for the enter animation (autoAlpha implied 0 if absent). */
  enterFrom: gsap.TweenVars
  /** Tween-to vars for the enter animation. */
  enterTo: gsap.TweenVars
  /** Tween-to vars for the exit animation (autoAlpha implied 0 if absent). */
  exitTo: gsap.TweenVars
  /** Wrapper element; defaults to an inline-block span so the presence
   *  wrapper doesn't disturb flex/inline layouts. */
  as?: 'div' | 'span'
  className?: string
  children: ReactNode
}

/**
 * Mount/unmount presence animation on a single wrapper element — the GSAP
 * counterpart of the framer-motion `<AnimatePresence>{show && <motion.el>}`
 * pattern used across the mobile app. Content stays mounted while the exit
 * tween runs, then unmounts.
 */
export function GsapPresence({
  show,
  enterFrom,
  enterTo,
  exitTo,
  as: Tag = 'span',
  className,
  children,
}: GsapPresenceProps) {
  const [rendered, setRendered] = useState(show)
  const elRef = useRef<HTMLDivElement | HTMLSpanElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useLayoutEffect(() => {
    if (show) setRendered(true)
  }, [show])

  useLayoutEffect(() => {
    const el = elRef.current
    if (!el || !rendered) return
    tweenRef.current?.kill()
    if (show) {
      tweenRef.current = gsap.fromTo(
        el,
        { autoAlpha: 0, ...enterFrom },
        { autoAlpha: 1, ...enterTo },
      )
    } else {
      tweenRef.current = gsap.to(el, {
        autoAlpha: 0,
        ...exitTo,
        onComplete: () => setRendered(false),
      })
    }
    return () => {
      tweenRef.current?.kill()
      tweenRef.current = null
    }
    // Enter/exit vars are stable per call site; `show`/`rendered` drive the cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, rendered])

  if (!rendered) return null
  return (
    <Tag
      // Start hidden so the first painted frame is the tween's from-state.
      style={{ visibility: 'hidden' }}
      className={className}
      ref={(node: HTMLDivElement | HTMLSpanElement | null) => {
        elRef.current = node
      }}
    >
      {children}
    </Tag>
  )
}
