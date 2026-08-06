import { buildPageMetadata } from '@/constants/metadata'
import { sanityServer } from '@/lib/sanity'
import { getLocale } from 'next-intl/server'
import { HeroManifesto } from './_sections/hero'
import { ScriptureSection } from './_sections/scripture'
import { MiracleSection } from './_sections/miracle'
import { VerseOfTheDaySection } from './_sections/verse-of-day'
import { PracticesSection } from './_sections/practices'
import { JournalSection } from './_sections/journal'
import { ToolsSection } from './_sections/tools'
import { ClosingSection } from './_sections/closing'
import { ContinueReadingSection } from './_sections/continue-reading'

export const metadata = buildPageMetadata({
  title: 'WikiSubmission',
  description:
    'WikiSubmission is a nonprofit building free, open-source tools for scripture: the Quran, the Bible, and the common ground between the world’s monotheistic faiths.',
  url: '/',
})

const LATEST_ARTICLES_QUERY = `*[_type == "article" && language == $language] | order(publishedAt desc) [0...3] {
  _id, title, slug, excerpt, publishedAt,
  "category": categories[0]->name,
  "thumbnailUrl": thumbnail.asset->url
}`

type LatestArticle = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
}

export default async function Home() {
  const locale = await getLocale()
  const language = ['en', 'fr', 'ar', 'tr'].includes(locale) ? locale : 'en'

  let latestArticles: LatestArticle[] = []
  try {
    latestArticles = await sanityServer.fetch<LatestArticle[]>(
      LATEST_ARTICLES_QUERY,
      { language }
    )
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
      <ClosingSection />
    </div>
  )
}
