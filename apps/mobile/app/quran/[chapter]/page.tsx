import { notFound } from 'next/navigation'
import { ChapterReader } from '@/components/quran-reader/chapter-reader'

// The Quran has a fixed 114 chapters, so the export pre-renders one static page
// per chapter. The reader itself fetches verses on the client (initialData is
// null), which keeps every chapter page identical at build time.
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

  return <ChapterReader chapterNumber={chapterNumber} initialData={null} />
}
