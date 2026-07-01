import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donate | WikiSubmission',
  description:
    'Support WikiSubmission to help us maintain and grow this platform for the global Submission community.',
  openGraph: {
    title: 'Donate | WikiSubmission',
    description:
      'Support WikiSubmission to help us maintain and grow this platform for the global Submission community.',
  },
}

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
