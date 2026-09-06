import { SearchHeader } from '@/components/quran-reader/search-header'
import { SearchResultsSkeleton } from '@/components/quran-reader/search-results-skeleton'
import { CONTENT_WIDTH_CLASS, type ContentWidth } from '@/lib/quran-typography'

export function VerseListSkeleton({
  queryText,
  width,
}: {
  queryText: string
  width: ContentWidth
}) {
  const maxW = CONTENT_WIDTH_CLASS[width]
  return (
    <div className={`${maxW} mx-auto space-y-4`}>
      <SearchHeader query={queryText} loading />
      <SearchResultsSkeleton />
    </div>
  )
}
