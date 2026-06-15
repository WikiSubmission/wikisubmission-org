import CollectionsScreen from '@/components/me/collections-screen'

// Auth is enforced by the /me layout. A deep-linked collection arrives via ?id=.
export default function CollectionsPage() {
  return <CollectionsScreen />
}
