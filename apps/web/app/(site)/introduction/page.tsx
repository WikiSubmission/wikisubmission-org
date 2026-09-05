import { ArticleAnimations } from '@/components/article-animations'
import { buildPageMetadata } from '@/constants/metadata'
import { IntroductionContent } from '@/content/library/introduction'

export const metadata = buildPageMetadata({
  title: 'Introduction | WikiSubmission',
  description:
    "An introduction to the Final Testament — God's final message to humanity, the purification and consolidation of all scriptures into one universal religion of Submission.",
  url: '/introduction',
})

export default function IntroductionPage() {
  return (
    <ArticleAnimations>
      <main className="min-h-screen py-12 sm:py-20 px-4 sm:px-6 md:px-8">
        <IntroductionContent />
      </main>
    </ArticleAnimations>
  )
}
