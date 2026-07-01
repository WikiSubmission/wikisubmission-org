import type { Metadata as _Metadata } from 'next'

const SITE_LOGO_IMAGE = '/brand-assets/logo-transparent.png'
const SITE_LOGO_SIZE = { width: 512, height: 512 }

/**
 * Builds a complete Metadata object with consistent OG + Twitter cards.
 *
 * By default, the OG image is the site logo and the Twitter card is the
 * compact "summary" variant — link previews surface the logo in a corner
 * and emphasize the title/description rather than a full-bleed image.
 *
 * Pages that legitimately want a large preview image (e.g. blog posts)
 * can pass an explicit `image` plus `twitterCard: 'summary_large_image'`.
 */
export function buildPageMetadata({
  title,
  description,
  url,
  image,
  imageSize,
  imageAlt,
  twitterCard,
}: {
  title: string
  description: string
  url?: string
  image?: string
  imageSize?: { width: number; height: number }
  imageAlt?: string
  twitterCard?: 'summary' | 'summary_large_image'
}): _Metadata {
  const usingCustomImage = Boolean(image)
  const img = image ?? SITE_LOGO_IMAGE
  const card = twitterCard ?? (usingCustomImage ? 'summary_large_image' : 'summary')
  const size = imageSize ?? (usingCustomImage ? { width: 1200, height: 630 } : SITE_LOGO_SIZE)
  const alt = imageAlt ?? (usingCustomImage ? title : 'WikiSubmission')
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      siteName: 'WikiSubmission',
      images: [{ url: img, width: size.width, height: size.height, alt }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card,
      title,
      description,
      images: [{ url: img }],
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
  applicationName: 'WikiSubmission',
  // Standalone PWA hints. Next auto-injects the manifest link from app/manifest.ts.
  appleWebApp: {
    capable: true,
    title: 'WikiSubmission',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
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
        url: SITE_LOGO_IMAGE,
        width: SITE_LOGO_SIZE.width,
        height: SITE_LOGO_SIZE.height,
        alt: 'WikiSubmission',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'WikiSubmission',
    description:
      'Access the Final Testament at WikiSubmission – a free and open source platform for Submission.',
    images: [{ url: SITE_LOGO_IMAGE }],
  },
}
