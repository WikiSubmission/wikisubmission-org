'use client'

import { useEffect } from 'react'

export function ReactScanInit() {
  useEffect(() => {
    import('react-scan')
      .then((mod) => {
        // react-scan is aliased to an empty module in the build; only invoke
        // scan when it is actually present.
        if (typeof mod?.scan === 'function') {
          mod.scan({ enabled: true })
        }
      })
      .catch(() => {})
  }, [])
  return null
}
