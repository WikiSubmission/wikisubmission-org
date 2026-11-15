import { Suspense } from 'react'
import { QuranHub } from '@/components/quran/quran-hub'

export default function QuranPage() {
  return (
    <Suspense fallback={null}>
      <QuranHub />
    </Suspense>
  )
}
