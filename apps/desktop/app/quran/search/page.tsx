import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { QuranQueryView } from '@/components/quran/quran-query-view'

// Verse references, ranges, lists and text search all land here as ?q=. The
// web app serves these from /quran/<query>; a static export cannot, so links
// are rewritten by lib/desktop-links.ts.
export default function QuranSearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <QuranQueryView />
    </Suspense>
  )
}
