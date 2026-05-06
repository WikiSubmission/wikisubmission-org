import { WordLabPageShell } from './shell'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Word Lab — WikiSubmission',
  description:
    'Search every Arabic root in the Quran by Arabic letters or by Latin transliteration. Drill into derived forms, occurrences, and morphology.',
}

export default function WordLabPage() {
  return <WordLabPageShell />
}
