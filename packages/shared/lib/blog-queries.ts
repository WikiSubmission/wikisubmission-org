import type { PortableTextBlock } from '@portabletext/types'

// Shared blog data shapes. Both platforms read published articles from
// ws-backend's public editorial endpoints via blog-backend.ts; these types are
// the view model those responses are mapped onto. The names still say "Sanity"
// because they are the language codes the public blog supports, which predate
// the migration and are load-bearing across both apps.

export const SANITY_LANGUAGES = ['en', 'fr', 'ar', 'tr'] as const
export type SanityLanguage = (typeof SANITY_LANGUAGES)[number]

export function toSanityLanguage(locale: string): SanityLanguage {
  return (SANITY_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as SanityLanguage)
    : 'en'
}

// Index-card shape (list/grid). Slug is an object here to match the GROQ result.
export type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  snippets?: string[]
  publishedAt?: string
  category?: string
  categorySlug?: string
  thumbnailUrl?: string
  authorName?: string
}

// The search API flattens slug to a plain string.
export type SearchPost = Omit<Post, 'slug'> & { slug: string }

export type Category = {
  name: string
  slug: string
  count: number
}

// Full article shape (detail view).
export type BlogPost = {
  _id: string
  title?: string
  slug?: { current?: string }
  excerpt?: string
  publishedAt?: string
  updatedAt?: string
  language?: string
  enableScriptureRefs?: boolean
  category?: string
  categoryRef?: string
  body?: PortableTextBlock[]
  thumbnailUrl?: string
  authorName?: string
  authorPhotoUrl?: string
}

export type RelatedBlogPost = {
  _id: string
  title: string
  slug?: { current?: string }
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
}
