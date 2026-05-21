'use client'

import { use } from 'react'
import { CollectionsMasterDetail } from '@/components/me/collections-master-detail'

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <div className="flex flex-col gap-6">
      <CollectionsMasterDetail initialId={parseInt(id, 10)} />
    </div>
  )
}
