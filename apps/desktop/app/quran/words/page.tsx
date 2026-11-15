'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WordLab } from '@web/app/quran/words/word-lab'

// The web app serves /quran/words/<root>; a static export cannot, so a root
// arrives as ?root= (the host redirects the path form here).
function WordLabFromQuery() {
  const root = useSearchParams().get('root') ?? undefined
  return <WordLab key={root ?? ''} initialLetters={root} />
}

export default function WordLabPage() {
  return (
    <Suspense fallback={null}>
      <WordLabFromQuery />
    </Suspense>
  )
}
