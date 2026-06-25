import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'
import withSerwistInit from '@serwist/next'

// In a pnpm workspace the app lives at apps/web; point output-file tracing at
// the monorepo root (two levels up) so standalone traces hoisted dependencies.
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../')

// Revision for the precached /offline fallback. Tied to the commit so the
// fallback is re-fetched on each deploy rather than served stale forever.
const buildRevision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  'dev'

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.wikisubmission.org https://cdn.sanity.io https://img.youtube.com https://www.masjidtucson.org https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://avatars.discordapp.com",
      "font-src 'self'",
      "connect-src 'self' https://ws-backend.wikisubmission.org https://cdn.wikisubmission.org https://cdn.sanity.io https://audio.qurancdn.com https://cloudflareinsights.com",
      "media-src 'self' blob: https://cdn.wikisubmission.org https://audio.qurancdn.com",
      "worker-src 'self' blob:",
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  allowedDevOrigins: ['192.168.1.68'],
  webpack: (config) => {
    // react-scan@0.5.6 ships a broken ESM named export that webpack cannot
    // compile, and it is a dev-only re-render overlay we do not ship. Alias it
    // to an empty module in every mode so neither dev nor prod builds choke.
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-scan': false,
    }
    return config
  },
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
        destination: '/legal/privacy-policy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/legal/terms-of-use',
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

// Serwist builds the service worker from app/sw.ts. It runs only under the
// Webpack build (production `next build --webpack`); it is disabled in dev so
// Turbopack `next dev` is unaffected and there is no stale SW during HMR.
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  // Precache the offline fallback document so a cold offline launch returns 200.
  additionalPrecacheEntries: [{ url: '/offline', revision: buildRevision }],
})

export default withSerwist(withBundleAnalyzer(withNextIntl(nextConfig)))
