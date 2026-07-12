'use client'

import { Fragment, useLayoutEffect, useRef } from 'react'
import { EASE_SETTLE, gsap } from '@/lib/gsap'

/**
 * "Being written" text reveal for the zikr strip: words surface one after
 * another out of an ink blur, like script settling onto parchment.
 *
 * The stagger is strictly PER-WORD, never per-letter: splitting Arabic (or any
 * cursive script) into per-letter spans breaks glyph shaping and ligatures,
 * while word boundaries are always safe. Direction comes from dir="auto" on
 * the container.
 */

/** Cap the total reveal so long zikr texts don't take forever to finish. */
const MAX_TOTAL_STAGGER_S = 1.6
const WORD_STAGGER_S = 0.14
const WORD_DURATION_S = 0.7

export function ZikrRevealText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const words = text.split(/\s+/).filter(Boolean)
  const stagger = Math.min(
    WORD_STAGGER_S,
    words.length > 1 ? MAX_TOTAL_STAGGER_S / (words.length - 1) : WORD_STAGGER_S,
  )

  useLayoutEffect(() => {
    const spans = rootRef.current?.querySelectorAll<HTMLElement>('[data-word]')
    if (!spans || spans.length === 0) return
    const tween = gsap.fromTo(
      spans,
      { autoAlpha: 0, y: 5, filter: 'blur(5px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: WORD_DURATION_S,
        ease: EASE_SETTLE,
        stagger,
      },
    )
    return () => {
      tween.kill()
    }
  }, [text, stagger])

  return (
    <span dir="auto" className={className} ref={rootRef}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {/* The space lives outside the inline-block span; inside it would
              collapse and the words would run together. Words start hidden so
              the first painted frame is the tween's from-state. */}
          <span data-word className="inline-block" style={{ visibility: 'hidden' }}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
