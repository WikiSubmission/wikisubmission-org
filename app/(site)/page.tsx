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

export const metadata = buildPageMetadata({
  title: 'WikiSubmission',
  description:
    'WikiSubmission is a faith-based nonprofit providing free and open-source tools for the Final Testament (Quran), Bible, and religious education.',
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
