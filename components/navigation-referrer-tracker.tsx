'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const ME_PATH_RE = /^(\/[a-z]{2}(-[A-Z]{2})?)?\/me(\/|$)/

/**
 * Stores the last non-/me pathname in sessionStorage whenever the user
 * navigates into /me from outside. Used by the /me back button to exit the
 * profile area and return to wherever the user came from.
 */
export function NavigationReferrerTracker() {
  const pathname = usePathname()
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    if (
      prev !== null &&
      !ME_PATH_RE.test(prev) &&
      ME_PATH_RE.test(pathname)
    ) {
      sessionStorage.setItem('me.preReferrer', prev)
    }
    prevRef.current = pathname
  }, [pathname])

  return null
}
