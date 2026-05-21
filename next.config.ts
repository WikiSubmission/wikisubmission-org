import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    // unsafe-inline / unsafe-eval are required by Next.js App Router without
    // nonce configuration. frame-ancestors and object-src are the high-value
    // protections here (clickjacking and plugin injection).
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.wikisubmission.org https://cdn.sanity.io https://img.youtube.com https://www.masjidtucson.org https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://avatars.discordapp.com",
      "font-src 'self'",
      "connect-src 'self' https://ws-backend.wikisubmission.org https://cdn.sanity.io https://audio.qurancdn.com",
      "media-src 'self' blob: https://cdn.wikisubmission.org https://audio.qurancdn.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  allowedDevOrigins: ['192.168.1.68'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'library.wikisubmission.org',
      },
      {
        protocol: 'https',
        hostname: 'www.masjidtucson.org',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: '/legal/privacy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/legal/terms',
        permanent: true,
      },
      {
        source: '/index',
        destination:
          'https://library.wikisubmission.org/file/quran-the-final-testament-index',
        permanent: true,
      },
      {
        source: '/library/:path*',
        destination: 'https://library.wikisubmission.org/:path*',
        permanent: true,
      },
      {
        source: '/appendices',
        destination: '/quran#appendices',
        permanent: false,
      },
      {
        source: '/dashboard/quran/search/:query*',
        destination: '/quran/:query*',
        permanent: true,
      },
      {
        source: '/dashboard/quran/:query*',
        destination: '/quran/:query*',
        permanent: true,
      },
      {
        source: '/appendix/0',
        destination: '/introduction',
        permanent: true,
      },
      {
        source: '/appendices/0',
        destination: '/introduction',
        permanent: true,
      },
      {
        source: '/appendix/:path*',
        destination: '/appendices/:path*',
        permanent: true,
      },
      {
        source: '/prayer-times',
        destination: '/practices',
        permanent: true,
      },
    ]
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = createNextIntlPlugin()

export default withBundleAnalyzer(withNextIntl(nextConfig))
