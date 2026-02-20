import type { Metadata as _Metadata } from 'next'

export const Metadata: _Metadata = {
  title: 'WikiSubmission',
  description:
    'WikiSubmission is a faith-based nonprofit providing free and open-source tools for the Final Testament (Quran), Bible, and religious education.',
  keywords: [
    'Quran',
    'Bible',
    'Scripture',
    'Submission',
    'God Alone',
    'Zikr',
    'Prayer Times',
    'Open Source Religion',
  ],
  metadataBase: new URL('https://wikisubmission.org'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'WikiSubmission',
    description:
      'Access the Final Testament at WikiSubmission – a free and open source platform for Submission.',
    url: 'https://wikisubmission.org',
    siteName: 'WikiSubmission',
    images: [
      {
        url: '/brand-assets/logo-transparent.png',
        width: 1200,
        height: 630,
        alt: 'WikiSubmission Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WikiSubmission',
    description:
      'Access the Final Testament at WikiSubmission – a free and open source platform for Submission.',
    images: ['/brand-assets/logo-transparent.png'],
  },
}
