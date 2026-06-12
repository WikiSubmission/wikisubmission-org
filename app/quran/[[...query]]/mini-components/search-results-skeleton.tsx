'use client'

export function SearchResultsSkeleton() {
  return (
    <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden divide-y divide-border/30">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-5 sm:px-8 sm:py-6 space-y-3 animate-pulse"
        >
          <div className="h-5 w-12 rounded-full bg-muted/60" />
          <div className="space-y-2">
            <div className="h-3 w-11/12 rounded bg-muted/50" />
            <div className="h-3 w-10/12 rounded bg-muted/40" />
            <div className="h-3 w-7/12 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  )
}
