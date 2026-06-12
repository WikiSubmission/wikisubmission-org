import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { WordLab } from './word-lab'

export function WordLabPageShell({ initialLetters }: { initialLetters?: string }) {
  return (
    <>
      <div className="quran-fixed-headers">
        <SiteNav />
      </div>
      <main className="pt-16">
        <WordLab initialLetters={initialLetters} />
      </main>
      <SiteFooter />
    </>
  )
}
