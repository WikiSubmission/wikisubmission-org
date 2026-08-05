'use client'

// Small client island so the offline page can stay a static, precacheable
// Server Component while still offering an interactive retry.
export function OfflineRetry() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      }}
    >
      Try again
    </button>
  )
}
