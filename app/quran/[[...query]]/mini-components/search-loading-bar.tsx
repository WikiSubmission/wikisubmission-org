'use client'

import { cn } from '@/lib/utils'

export function SearchLoadingBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative h-[2px] w-full overflow-hidden rounded-full bg-border/40',
        className
      )}
    >
      <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary/70 animate-[search-loading_1.2s_ease-in-out_infinite]" />
    </div>
  )
}
