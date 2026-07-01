'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchResult from '@/components/quran-reader/result-search'

// Full-text Quran search lives inside the reader (the mobile IA has no search
// tab). This is a single static route in the export; the query travels in the
// `?q=` param and is read client-side. The shared SearchResult fetches and
// renders verse / word / note matches exactly as on web.
function SearchScreen() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <SearchResult props={{ query }} />
    </div>
  )
}

export default function QuranSearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchScreen />
    </Suspense>
  )
}
