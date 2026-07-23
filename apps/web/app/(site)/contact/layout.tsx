import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | WikiSubmission',
  description:
    'Get in touch with the WikiSubmission team for questions, feedback, or support.',
  openGraph: {
    title: 'Contact Us | WikiSubmission',
    description:
      'Get in touch with the WikiSubmission team for questions, feedback, or support.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
