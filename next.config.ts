import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  // turbopack: {
  //   root: "./",
  // },
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
      // /appendix/0 → introduction
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
        source: '/appendix/:path*',
        destination: '/appendices/:path*',
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
