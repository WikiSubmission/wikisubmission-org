'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CollectionsMasterDetail } from '@/components/me/collections-master-detail'

export default function CollectionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to profile
      </Link>
      <CollectionsMasterDetail />
    </div>
  )
}
