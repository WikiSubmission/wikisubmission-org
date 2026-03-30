import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * GSAP border-glow animation for the chapter verse container.
 *
 * Tunable constants at the top — adjust to taste:
 */

/** Violet intensity while loading (0–1). */
const LOADING_GLOW_OPACITY = 0.55
/** Speed of one pulse cycle in seconds. */
const LOADING_PULSE_DURATION = 0.9
/** Duration of the completion flash in seconds. */
const DONE_FLASH_DURATION = 1.3

export function useChapterBorderLoader(
  containerRef: React.RefObject<HTMLDivElement | null>,
  loading: boolean,
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prevLoading = useRef<boolean | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    tlRef.current?.kill()

    if (loading) {
      // Pulsing violet glow — breathes in and out while verses are loading.
      tlRef.current = gsap
        .timeline({ repeat: -1, yoyo: true })
        .fromTo(
          el,
          {
            boxShadow: `0 0 0 1px oklch(0.60 0.22 290 / 0.08)`,
          },
          {
            boxShadow: `0 0 0 2px oklch(0.60 0.22 290 / ${LOADING_GLOW_OPACITY}), 0 0 24px oklch(0.60 0.22 290 / 0.20)`,
            duration: LOADING_PULSE_DURATION,
            ease: 'sine.inOut',
          },
        )
    } else if (prevLoading.current === true) {
      // Completion: burst of violet then settle back to no shadow.
      gsap
        .timeline()
        .fromTo(
          el,
          {
            boxShadow: `0 0 0 2px oklch(0.60 0.22 290 / 0.90), 0 0 32px oklch(0.60 0.22 290 / 0.40)`,
          },
          {
            boxShadow: `0 0 0 0px oklch(0.60 0.22 290 / 0)`,
            duration: DONE_FLASH_DURATION,
            ease: 'expo.out',
          },
        )
    }

    prevLoading.current = loading

    return () => { tlRef.current?.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]) // containerRef is a stable ref object — intentionally omitted

  // Kill on unmount
  useEffect(() => () => { tlRef.current?.kill() }, [])
}
