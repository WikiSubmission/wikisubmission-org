import type { PortableTextBlock } from '@portabletext/types'

// Shared blog data shapes. Both platforms read published articles from
// ws-backend's public editorial endpoints via blog-backend.ts; these types are
// the view model those responses are mapped onto.

/**
 * The language reads fall back to when the reader's locale has nothing
 * published, and the value a locale normalizes to when it is missing or
 * malformed. The backend reads an empty `language` as "every language", which
 * would put several scripts on one page, so a read must never send one.
 */
export const DEFAULT_BLOG_LANGUAGE = 'en'

/**
 * A content language code. Every language the editorial registry can publish to
 * is valid, so this is deliberately a plain string and not a fixed union.
 */
export type BlogLanguage = string

/** Shape of a BCP-47 code: two or three letters, optional subtags. */
const LANGUAGE_CODE = /^[a-z]{2,3}(?:-[a-z0-9]+)*$/

/**
 * Normalize a UI locale into a content language code.
 *
 * This does not restrict which languages are readable. The blog used to accept
 * only en/fr/ar/tr and clamp everything else to English, so an article
 * published in German was invisible to a German reader even though /editor
 * offers the full language registry. Unknown codes now pass through, and
 * blog-backend falls back to English only when the language turns up empty, so
 * a newly published language reaches readers with no frontend change.
 */
export function toBlogLanguage(locale: string | null | undefined): BlogLanguage {
  const code = locale?.trim().toLowerCase() ?? ''
  return LANGUAGE_CODE.test(code) ? code : DEFAULT_BLOG_LANGUAGE
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
