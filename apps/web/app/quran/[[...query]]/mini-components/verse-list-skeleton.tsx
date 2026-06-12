import { SearchHeader } from './search-header'
import { SearchResultsSkeleton } from './search-results-skeleton'
import { ZOOM_WIDTH_CLASS, type ZoomLevel } from '@/lib/quran-zoom'

export function VerseListSkeleton({
  queryText,
  zoom,
}: {
  queryText: string
  zoom: ZoomLevel
}) {
  const maxW = ZOOM_WIDTH_CLASS[zoom]
  return (
    <div className={`${maxW} mx-auto space-y-4`}>
      <SearchHeader query={queryText} loading />
      <SearchResultsSkeleton />
    </div>
  )
}
