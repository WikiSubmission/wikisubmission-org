'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CollectionsMasterDetail } from '@/components/me/collections-master-detail'

// Collections master-detail. A deep-linked collection arrives via `?id=` (a
// single static route in the export); the master-detail handles selection
// internally from there.
function CollectionsScreenInner() {
  const sp = useSearchParams()
  const raw = sp.get('id')
  const id = raw ? Number.parseInt(raw, 10) : NaN

  return (
    <div className="flex flex-col gap-6">
      <CollectionsMasterDetail initialId={Number.isFinite(id) ? id : undefined} />
    </div>
  )
}

export default function CollectionsScreen() {
  return (
    <Suspense fallback={null}>
      <CollectionsScreenInner />
    </Suspense>
  )
}
