import { Suspense } from 'react'
import { TopicIndexView } from '@/components/quran/topic-index-view'

export default function QuranIndexPage() {
  return (
    <Suspense fallback={null}>
      <TopicIndexView />
    </Suspense>
  )
}
