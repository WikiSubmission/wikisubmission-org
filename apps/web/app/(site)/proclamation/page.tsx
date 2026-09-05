import { ArticleAnimations } from '@/components/article-animations'
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
    <ArticleAnimations>
      <main className="min-h-screen py-12 sm:py-20 px-4 sm:px-6 md:px-8">
        <ProclamationContent />
      </main>
    </ArticleAnimations>
  )
}

