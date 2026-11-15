import { notFound } from 'next/navigation'
import { ChapterReaderClient } from '@/components/quran/chapter-reader-client'

// One static page per chapter. Verses load on the client from the local
// backend, so every page is identical at build time apart from its number.
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ chapter: String(i + 1) }))
}

export const dynamicParams = false

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter } = await params
  const chapterNumber = Number(chapter)
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) {
    notFound()
  }
  return (
    <main>
      <ChapterReaderClient chapterNumber={chapterNumber} />
    </main>
  )
}
