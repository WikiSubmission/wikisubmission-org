'use client'

import { useEffect, useRef } from 'react'

export interface HotkeyOptions {
  /** Require Cmd (macOS) or Ctrl (elsewhere). Default true. */
  mod?: boolean
  shift?: boolean
  /** Fire even when the user is typing in an input, textarea, or contenteditable. */
  allowInEditable?: boolean
  enabled?: boolean
}

function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/**
 * Binds a single keyboard shortcut on `document`.
 *
 * Listens in the bubble phase and does not call `stopPropagation`, so a page that
 * needs the same key can still handle it — the capture-phase, propagation-stopping
 * listener this replaces in the Word Lab is exactly the pattern to avoid.
 *
 * `handler` is read through a ref, so an inline arrow does not rebind the
 * listener on every render.
 */
export function useHotkey(
  key: string,
  handler: (event: KeyboardEvent) => void,
  { mod = true, shift = false, allowInEditable = false, enabled = true }: HotkeyOptions = {},
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return
    const wanted = key.toLowerCase()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== wanted) return
      const hasMod = event.metaKey || event.ctrlKey
      if (mod !== hasMod) return
      if (shift !== event.shiftKey) return
      if (event.altKey) return
      if (!allowInEditable && !mod && isEditable(event.target)) return
      event.preventDefault()
      handlerRef.current(event)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, mod, shift, allowInEditable, enabled])
}
