'use client'

import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has stopped changing for `delayMs`.
 *
 * Use this to keep a network query off the keystroke path while the input stays
 * fully controlled: the input renders `value`, the query reads the debounced
 * copy. The first value is returned immediately so there is no initial delay.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    if (value === debounced) return
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
    // `debounced` is read to skip scheduling a no-op timer, but it must not
    // restart the timer when it settles — only a new `value` may do that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs])

  return debounced
}
