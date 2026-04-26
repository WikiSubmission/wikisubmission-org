import { buildPageMetadata } from '@/constants/metadata'
import CommunityClient from './community-client'

export const metadata = buildPageMetadata({
  title: 'Community | WikiSubmission',
  description:
    'Submitter communities worldwide — find an in-person group, an online circle, or a submitter-run publication.',
  url: '/community',
})

export default function CommunityPage() {
  return <CommunityClient />
}
