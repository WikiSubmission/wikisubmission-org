import { buildPageMetadata } from '@/constants/metadata'
import { fetchArticles } from '@/lib/blog-backend'
import { toBlogLanguage } from '@/lib/blog-queries'
import { getLocale } from 'next-intl/server'
import { HeroManifesto } from './_sections/hero'
import { ScriptureSection } from './_sections/scripture'
import { MiracleSection } from './_sections/miracle'
import { VerseOfTheDaySection } from './_sections/verse-of-day'
import { PracticesSection } from './_sections/practices'
import { JournalSection } from './_sections/journal'
import { ToolsSection } from './_sections/tools'
import { SupportSection } from './_sections/support'
import { ClosingSection } from './_sections/closing'
import { ContinueReadingSection } from './_sections/continue-reading'

export const metadata = buildPageMetadata({
  title: 'WikiSubmission',
  description:
    'WikiSubmission is a nonprofit building free, open-source tools for scripture: the Quran, the Bible, and the common ground between the world’s monotheistic faiths.',
  url: '/',
})

type LatestArticle = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
}

const LATEST_ARTICLE_COUNT = 6

export default async function Home() {
  const locale = await getLocale()

  let latestArticles: LatestArticle[] = []
  try {
    // Published articles come back newest-first from ws-backend's editorial store.
    const articles = await fetchArticles(toBlogLanguage(locale))
    latestArticles = articles.slice(0, LATEST_ARTICLE_COUNT)
  } catch {
    // non-critical — page renders without journal section
  }

  return (
    <div style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}>
      <HeroManifesto />
      <ContinueReadingSection />
      <ScriptureSection />
      <MiracleSection />
      <VerseOfTheDaySection />
      <PracticesSection />
      <JournalSection articles={latestArticles} />
      <ToolsSection />
      <SupportSection />
      <ClosingSection />
    </div>
  )
}

