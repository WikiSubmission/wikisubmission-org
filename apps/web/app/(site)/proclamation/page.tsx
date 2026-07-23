import { buildPageMetadata } from '@/constants/metadata'
import { ProclamationContent } from '@/content/library/proclamation'

export const metadata = buildPageMetadata({
  title: 'Proclamation | WikiSubmission',
  description:
    'Proclaiming One Unified Religion for All the People — Rashad Khalifa, November 1989',
  url: '/proclamation',
})

export default function ProclamationPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <ProclamationContent />
    </main>
  )
}
