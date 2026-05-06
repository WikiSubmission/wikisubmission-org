import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { WordLab } from './word-lab'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Word Lab — WikiSubmission',
  description:
    'Search every Arabic root in the Quran by Arabic letters or by Latin transliteration. Drill into derived forms, occurrences, and morphology.',
}

export default function WordLabPage() {
  return (
    <>
      <div className="quran-fixed-headers">
        <SiteNav />
      </div>
      <main className="pt-16">
        <WordLab />
      </main>
      <SiteFooter />
    </>
  )
}
