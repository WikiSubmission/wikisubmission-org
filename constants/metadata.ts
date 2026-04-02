import type { Metadata as _Metadata } from 'next'

/**
 * Builds a complete Metadata object with consistent OG + Twitter cards.
 * The OG image is always the dynamic /og route keyed by title — ensuring
 * a consistent branded template across every page.
 */
export function buildPageMetadata({
  title,
  description,
  url,
  image,
}: {
  title: string
  description: string
  url?: string
  image?: string
}): _Metadata {
  const img = image ?? `/og?title=${encodeURIComponent(title)}`
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      siteName: 'WikiSubmission',
      images: [{ url: img, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: img, width: 1200, height: 630 }],
    },
  }
}

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
    images: [{ url: '/og?title=WikiSubmission', width: 1200, height: 630, alt: 'WikiSubmission' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WikiSubmission',
    description:
      'Access the Final Testament at WikiSubmission – a free and open source platform for Submission.',
    images: [{ url: '/og?title=WikiSubmission', width: 1200, height: 630 }],
  },
}
