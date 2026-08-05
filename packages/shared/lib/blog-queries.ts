import type { PortableTextBlock } from '@portabletext/types'

// Shared blog data shapes and GROQ queries. The web app fetches these through
// its server-only Sanity client (apps/web/lib/sanity.ts); the mobile static
// export fetches the same queries client-side via the shared CDN client
// (packages/shared/lib/blog-client.ts). Keeping the strings in one place stops
// the two platforms from drifting.

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

export const ALL_ARTICLES_QUERY = `*[_type == "article" && language == $language] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  "category": categories[0]->name,
  "categorySlug": categories[0]->slug.current,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName
}`

export const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc) {
  name,
  "slug": slug.current,
  "count": count(*[_type == "article" && language == $language && references(^._id)])
}`

const POST_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  updatedAt,
  language,
  enableScriptureRefs,
  "category": categories[0]->name,
  "categoryRef": categories[0]._ref,
  body,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName,
  "authorPhotoUrl": author->photo.asset->url
`

export const POST_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug && language == $language][0] {
  ${POST_FIELDS}
}`

export const PREVIEW_POST_BY_ID_QUERY = `*[
  _type == "article" &&
  _id in [$documentId, "drafts." + $documentId]
][0] {
  ${POST_FIELDS}
}`

export const RELATED_QUERY = `*[
  _type == "article" &&
  language == $language &&
  $categoryRef in categories[]._ref &&
  _id != $excludeId
] | order(publishedAt desc) [0...3] {
  _id,
  title,
  slug,
  publishedAt,
  "category": categories[0]->name,
  "thumbnailUrl": thumbnail.asset->url
}`
