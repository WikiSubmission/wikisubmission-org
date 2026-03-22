import PracticesClient from './practices-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practices | WikiSubmission',
  description:
    'Prayer times, Ramadan schedule, and Zakat calculator for any location.',
  openGraph: {
    title: 'Practices | WikiSubmission',
    description:
      'Prayer times, Ramadan schedule, and Zakat calculator for any location.',
  },
}

export default function Page() {
  return <PracticesClient />
}
