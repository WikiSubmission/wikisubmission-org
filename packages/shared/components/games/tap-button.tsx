'use client'

import { useRef } from 'react'

/** One physical tap must never produce two actions, and never zero. */
const TAP_DEDUPE_MS = 700

/**
 * A button that reacts to the first tap, every time.
 *
 * While a Fill-the-Blank round is being played the Android soft keyboard is
 * open. Tapping a button below the verse blurs the focused input, which closes
 * the keyboard, resizes the visual viewport and moves the button out from under
 * the finger — pointerdown and pointerup land on different elements, so no
 * click is generated and the tap is silently swallowed. That is why submitting
 * used to take several taps.
 *
 * Acting on pointerdown makes the first tap count, and preventing its default
 * keeps focus (and the keyboard) where it is so nothing shifts mid-gesture.
 * onClick is kept for keyboard and assistive activation; the timestamp guard
 * collapses the pointerdown/click pair of a single gesture into one action.
 */
export function TapButton({
  onTap,
  disabled,
  style,
  ariaLabel,
  children,
}: {
  onTap: () => void
  disabled?: boolean
  style?: React.CSSProperties
  ariaLabel?: string
  children: React.ReactNode
}) {
  const lastFired = useRef(0)

  const fire = () => {
    if (disabled) return
    const now = Date.now()
    if (now - lastFired.current < TAP_DEDUPE_MS) return
    lastFired.current = now
    onTap()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ ...style, ...(disabled ? { cursor: 'progress', opacity: 0.75 } : {}) }}
      onPointerDown={(event) => {
        event.preventDefault()
        fire()
      }}
      onClick={fire}
    >
      {children}
    </button>
  )
}
