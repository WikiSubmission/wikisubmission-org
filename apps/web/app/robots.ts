import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/test', '/dashboard', '/api'],
      },
    ],
    sitemap: [
      'https://wikisubmission.org/sitemap.xml',
      'https://wikisubmission.org/llms.txt',
    ],
  }
}
