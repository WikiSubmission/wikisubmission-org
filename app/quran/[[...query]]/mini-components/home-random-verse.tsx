import { Fonts } from '@/constants/fonts'
import { ws } from '@/lib/wikisubmission-sdk'
import { ChevronRight } from 'lucide-react'

export default async function HomeScreenRandomVerse() {
  const randomVerse = await ws.Quran.randomVerse()

  if (!randomVerse.data) {
    return null
  }

  return (
    <main className="max-w-lg mx-auto">
      <a
        href={`/quran/${randomVerse.data.chapter_number}?verse=${randomVerse.data.verse_number}`}
        className="hover:cursor-pointer"
      >
        <div className="bg-muted/50 p-4 rounded-2xl space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground tracking-wider">
                RANDOM VERSE
              </p>

              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            <p>
              <strong>[{randomVerse.data.verse_id}]</strong>{' '}
              {randomVerse.data.ws_quran_text.english}
            </p>
          </div>
          <p
            className={`text-xl leading-relaxed space-y-2 text-right ${Fonts.amiri.className}`}
          >
            {randomVerse.data.ws_quran_text.arabic}
          </p>
        </div>
      </a>
    </main>
  )
}
