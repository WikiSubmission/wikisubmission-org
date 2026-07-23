import { buildPageMetadata } from '@/constants/metadata'
import { ChatPageClient } from '@/components/chat/chat-page-client'

export const metadata = buildPageMetadata({
  title: 'Chat — WikiSubmission',
  description: 'Ask AI about Submission, Scripture, or the mathematical miracle of 19.',
  url: '/chat',
})

export default function AskPage() {
  return <ChatPageClient />
}
