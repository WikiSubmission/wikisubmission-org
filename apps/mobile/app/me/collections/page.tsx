'use client'

import CollectionsScreen from '@/components/me/collections-screen'

// A deep-linked collection arrives via ?id=; the master-detail handles selection
// from there.
export default function CollectionsPage() {
  return <CollectionsScreen />
}
