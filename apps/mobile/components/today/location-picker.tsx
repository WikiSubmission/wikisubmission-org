'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { FEATURED_CITIES } from '@/lib/prayer-times'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface LocationPickerProps {
  current: string
  onSelect: (location: string) => void
}

/** Compact location chooser: featured-city chips plus a free-text search. */
export function LocationPicker({ current, onSelect }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  function choose(location: string) {
    haptic('light')
    onSelect(location)
    setOpen(false)
    setQuery('')
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (query.trim()) choose(query)
  }

  return (
    <div className="border-border/50 bg-background/55 rounded-2xl border backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <MapPin className="text-primary size-4 shrink-0" aria-hidden="true" />
        <span className="truncate text-sm font-medium">{current}</span>
        <ChevronDown
          className={cn(
            'text-muted-foreground ml-auto size-4 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-border/40 space-y-3 border-t px-4 py-3">
          <form onSubmit={submit} className="relative">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city…"
              className="border-border/60 bg-background/70 focus:ring-primary/40 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => choose(city)}
                className="border-border/60 hover:bg-primary/10 hover:text-primary rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
