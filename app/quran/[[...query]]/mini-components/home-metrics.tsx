'use client'

import { useQuranMetrics } from '@/hooks/use-quran-metrics'
import { HistoryIcon, SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomeScreenMetrics() {
  const quranMetrics = useQuranMetrics()

  // Get the last 10 navigation entries in reverse order (most recent first)
  const recentNavigation = [...quranMetrics.recentlyNavigated]
    .reverse()
    .slice(0, 10)

  if (recentNavigation.length === 0) {
    return null
  }

  return (
    <main className="flex justify-between items-start">
      <div className="flex flex-wrap gap-1">
        {recentNavigation.map((entry, index) => {
          // Build the URL and display text based on entry type
          let url: string
          let displayText: string

          if (entry.type === 'query') {
            url = `/quran/?q=${encodeURIComponent(entry.query)}`
            displayText = `${entry.query}`
          } else if (entry.type === 'verse') {
            url = `/quran/${entry.chapter}?verse=${entry.verse}`
            displayText = `${entry.chapter}:${entry.verse}`
          } else {
            // entry.type === 'chapter'
            url = `/quran/${entry.chapter}`
            displayText = `Sura ${entry.chapter}`
          }

          return (
            <a
              key={`${entry.type}-${index}`}
              href={url}
              className="hover:cursor-pointer w-fit"
            >
              <div className="flex rounded-lg px-2 py-1 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-1 text-violet-500 hover:text-violet-600">
                  {entry.type === 'query' ? (
                    <SearchIcon className="size-3" />
                  ) : (
                    <HistoryIcon className="size-3" />
                  )}
                  <p className="text-xs">{displayText}</p>
                </div>
              </div>
            </a>
          )
        })}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => quranMetrics.clearHistory()}
        className="h-6 w-6"
      >
        <XIcon className="size-3 text-red-500" />
      </Button>
    </main>
  )
}
