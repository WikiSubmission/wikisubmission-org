import type { Metadata } from 'next'
import { OfflineRetry } from './offline-retry'

export const metadata: Metadata = {
  title: 'Offline | WikiSubmission',
  robots: { index: false, follow: false },
}

// Served by the service worker when a navigation fails offline. It must render
// with zero network so it stays fully self-contained (no data fetching, no
// dynamic imports). A 200 offline response is required by Google Play Vitals.
export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--primary-container)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 2 22 22" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
          <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
          <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
          <path d="M5 13a10 10 0 0 1 5.24-2.76" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="max-w-sm text-balance text-sm opacity-70">
          This page is not available without a connection. Pages you have
          already visited remain readable. Reconnect to load everything else.
        </p>
      </div>

      <OfflineRetry />
    </main>
  )
}
