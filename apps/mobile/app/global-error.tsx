'use client'

import { useEffect } from 'react'
import { reportClientError } from '@/lib/crash-reporter'

/**
 * Last-resort boundary: catches throws in the root layout itself, where the
 * app shell (and its styling) may be gone — hence plain inline styles and a
 * full reload instead of reset(). Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    reportClientError(error, 'global-error')
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100dvh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'serif',
          background: '#F6F2EA',
          color: '#2A241C',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Something went wrong</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>
          The app hit an unexpected error and needs to reload.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          style={{
            border: '1px solid #C8A24B',
            background: '#C8A24B',
            color: '#fff',
            borderRadius: '9999px',
            padding: '0.5rem 1.5rem',
            fontSize: '0.875rem',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  )
}
