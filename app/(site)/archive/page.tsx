import ArchiveClient from './archive-client'
import { Metadata } from 'next'

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  if (q) {
    return {
      title: `${q} | Archive | WikiSubmission`,
      description: `Search results for "${q}" in the WikiSubmission media archive`,
    }
  }
  return {
    title: 'Archive | WikiSubmission',
    description: 'Search sermons, programs, and newsletters from the Submission community.',
    openGraph: {
      title: 'Archive | WikiSubmission',
      description: 'Search sermons, programs, and newsletters from the Submission community.',
    },
  }
}

export default function ArchivePage() {
  return <ArchiveClient />
}
