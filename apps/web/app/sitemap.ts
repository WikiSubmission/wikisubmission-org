import { MetadataRoute } from 'next'
import { fetchArticles } from '@/lib/blog-backend'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wikisubmission.org'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/quran`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/music`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/practices`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/introduction`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/miracle`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/proclamation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/downloads`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Dynamic Quran Chapters (1-114)
  const quranChapters: MetadataRoute.Sitemap = Array.from({ length: 114 }, (_, i) => ({
    url: `${baseUrl}/quran/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))

  // Appendices (1-38)
  const appendices: MetadataRoute.Sitemap = Array.from({ length: 38 }, (_, i) => ({
    url: `${baseUrl}/appendices/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Published blog posts from ws-backend's editorial store
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const posts = await fetchArticles('en')
    blogPosts = posts
      .filter((p) => p.slug.current)
      .map((p) => ({
        url: `${baseUrl}/blog/${p.slug.current}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
  } catch {
    // non-critical — sitemap still works without blog posts
  }

  return [...staticPages, ...quranChapters, ...appendices, ...blogPosts]
}
