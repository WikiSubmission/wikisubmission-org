import type { Metadata } from 'next'
import { WordLabPageShell } from '../shell'
import { rootToLatin } from '@/lib/transliteration'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letters: string }>
}): Promise<Metadata> {
  const { letters } = await params
  const decoded = decodeURIComponent(letters)
  const tr = rootToLatin(decoded)
  return {
    title: `${decoded} (${tr}) — Word Lab — WikiSubmission`,
    description: `Derived forms, occurrences, and morphology for the Arabic root ${decoded} (${tr}).`,
  }
}

export default async function WordLabRootPage({
  params,
}: {
  params: Promise<{ letters: string }>
}) {
  const { letters } = await params
  return <WordLabPageShell initialLetters={decodeURIComponent(letters)} />
}
