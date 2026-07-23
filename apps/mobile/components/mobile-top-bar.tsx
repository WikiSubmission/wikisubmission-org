'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { haptic } from '@/lib/haptics'

interface MobileTopBarProps {
  title: string
  showBack: boolean
}

/**
 * Contextual top bar. On a tab root it shows the section title; on a pushed
 * screen it shows a back chevron. Safe-area aware for the status bar / notch.
 */
export function MobileTopBar({ title, showBack }: MobileTopBarProps) {
  const router = useRouter()

  return (
    <header
      className="glass-nav bg-background/80 mobile-top-bar fixed inset-x-0 top-0 z-40 border-b"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        {showBack ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              haptic('light')
              router.back()
            }}
            className="text-foreground hover:bg-muted -ml-1 flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : null}
        <h1 className="font-display truncate text-lg">{title}</h1>
      </div>
    </header>
  )
}
