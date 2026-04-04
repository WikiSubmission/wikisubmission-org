import { Suspense } from 'react'
import { Metadata } from 'next'
import { buildPageMetadata } from '@/constants/metadata'
import { AskInterface } from './client-components/ask-interface'

export const metadata: Metadata = buildPageMetadata({
  title: 'SubmitterAI | WikiSubmission',
  description:
    'Ask questions about the Quran, Submission, and Islamic practice — answered by AI with verse references and sources.',
  url: '/ask',
})

export default function AskPage() {
  return (
    <Suspense>
      <AskInterface />
    </Suspense>
  )
}
