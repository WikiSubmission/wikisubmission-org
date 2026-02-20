'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FaApple } from 'react-icons/fa'
import { X } from 'lucide-react'

interface AppPromptProps {
  trackId?: string
}

export function AppPrompt({ trackId }: AppPromptProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    // Check if user has dismissed it this session
    const isDismissed = sessionStorage.getItem('app-prompt-dismissed')

    if (isIOS && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500) // Slight delay for better UX
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  const handleOpenInApp = () => {
    const deepLink = trackId
      ? `wikisubmission://music/track/${trackId}`
      : 'wikisubmission://music'

    // Fallback to App Store if app not installed (optional, but good)
    // For deep links, it usually just fails silently or shows an error if not handled.
    // We'll just trigger the deep link.
    window.location.href = deepLink
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('app-prompt-dismissed', 'true')
  }

  return (
    <div className="w-full max-w-5xl px-4 mt-2">
      <div className="relative flex items-center justify-between gap-4 p-3 bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-zinc-800 to-black rounded-xl flex items-center justify-center shadow-inner">
            <FaApple className="w-7 h-7 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">
              Open in WikiSubmission
            </h4>
            <p className="text-xs text-muted-foreground">
              Continue listening in the app
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full px-6 h-9 text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
            onClick={handleOpenInApp}
          >
            OPEN
          </Button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
