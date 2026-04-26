import { buildPageMetadata } from '@/constants/metadata'
import { sanityPreviewServer, sanityServer, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { timingSafeEqual } from 'node:crypto'

export const SANITY_LANGUAGES = ['en', 'fr', 'ar', 'tr'] as const

export type SanityLanguage = typeof SANITY_LANGUAGES[number]

export function toSanityLanguage(locale: string): SanityLanguage {
  return (SANITY_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as SanityLanguage)
    : 'en'
}

export type BlogPost = {
  _id: string
  title?: string
  slug?: { current?: string }
  excerpt?: string
  publishedAt?: string
  updatedAt?: string
  language?: string
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

type PreviewSearchParams = {
  blog_id?: string | string[]
  preview?: string | string[]
}

const BLOG_INDEX_METADATA = buildPageMetadata({
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  url: 'https://wikisubmission.org/blog',
})

const POST_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  updatedAt,
  language,
  "category": categories[0]->name,
  "categoryRef": categories[0]._ref,
  body,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName,
  "authorPhotoUrl": author->photo.asset->url
`

const POST_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug && language == $language][0] {
  ${POST_FIELDS}
}`

const PREVIEW_POST_BY_ID_QUERY = `*[
  _type == "article" &&
  _id in [$documentId, "drafts." + $documentId]
][0] {
  ${POST_FIELDS}
}`

const RELATED_QUERY = `*[
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

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export function hasBlogPreviewParams(searchParams: PreviewSearchParams) {
  return Boolean(firstParam(searchParams.blog_id) || firstParam(searchParams.preview))
}

function normalizeDocumentId(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.replace(/^drafts\./, '')
}

function matchesSecret(secret: string, expectedSecret: string) {
  const provided = Buffer.from(secret)
  const expected = Buffer.from(expectedSecret)

  if (provided.length !== expected.length) return false

  return timingSafeEqual(provided, expected)
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function readingTime(body?: PortableTextBlock[]): string {
  if (!body) return ''
  const text = body
    .flatMap((block) => (block as { children?: { text?: string }[] }).children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export function getBlogIndexMetadata() {
  return BLOG_INDEX_METADATA
}

export function resolveBlogPreviewRequest(searchParams: PreviewSearchParams) {
  const documentId = normalizeDocumentId(firstParam(searchParams.blog_id))
  const providedSecret = firstParam(searchParams.preview)
  const expectedSecret = process.env.BLOG_PREVIEW_SECRET

  if (!documentId || !providedSecret || !expectedSecret || !sanityPreviewServer) {
    return null
  }

  if (!matchesSecret(providedSecret, expectedSecret)) {
    return null
  }

  return { documentId }
}

export async function fetchPublishedBlogPostBySlug(
  slug: string,
  language: SanityLanguage
) {
  let post = await sanityServer.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, {
    slug,
    language,
  })

  if (!post && language !== 'en') {
    post = await sanityServer.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, {
      slug,
      language: 'en',
    })
  }

  return post
}

export async function fetchPreviewBlogPostById(documentId: string) {
  if (!sanityPreviewServer) return null

  return sanityPreviewServer.fetch<BlogPost | null>(PREVIEW_POST_BY_ID_QUERY, {
    documentId,
  })
}

export async function fetchRelatedBlogPosts({
  categoryRef,
  excludeId,
  language,
}: {
  categoryRef?: string
  excludeId: string
  language: string
}) {
  if (!categoryRef) return []

  return sanityServer.fetch<RelatedBlogPost[]>(RELATED_QUERY, {
    categoryRef,
    excludeId,
    language,
  })
}

export function buildBlogPostMetadata(
  post: BlogPost,
  {
    preview = false,
    url,
  }: {
    preview?: boolean
    url?: string
  } = {}
): Metadata {
  const title = post.title?.trim() || 'Untitled article'
  const description = post.excerpt?.trim() || 'Read the latest article on WikiSubmission.'
  const metadataTitle = preview
    ? `${title} | Draft Preview | WikiSubmission`
    : `${title} | WikiSubmission`

  const base = buildPageMetadata({
    title: metadataTitle,
    description,
    ...(preview ? {} : { url }),
  })

  return {
    ...base,
    ...(preview
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
              'max-video-preview': -1,
              'max-image-preview': 'large' as const,
              'max-snippet': -1,
            },
          },
        }
      : {}),
    openGraph: {
      ...base.openGraph,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.authorName ? { authors: [post.authorName] } : {}),
    },
  }
}

export function BlogPostArticle({
  post,
  related = [],
  preview = false,
}: {
  post: BlogPost
  related?: RelatedBlogPost[]
  preview?: boolean
}) {
  const title = post.title?.trim() || 'Untitled article'
  const publishedRelated = related.filter((relatedPost) => relatedPost.slug?.current)

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-10 space-y-5">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Blog
          </Link>

          {preview && (
            <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Draft preview. This article is being loaded from unpublished Sanity content through a secret link.
            </div>
          )}

          <div className="space-y-3">
            {post.category && (
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {post.category}
              </span>
            )}
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-border/40 pt-5">
            {post.authorPhotoUrl && (
              <Image
                src={post.authorPhotoUrl}
                alt={post.authorName ?? ''}
                width={40}
                height={40}
                className="rounded-full shrink-0"
              />
            )}
            <div className="flex flex-col gap-0.5">
              {post.authorName && <span className="text-sm font-semibold">{post.authorName}</span>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                {post.publishedAt && post.body && <span>·</span>}
                {post.body && <span>{readingTime(post.body)}</span>}
              </div>
            </div>
          </div>

          {post.thumbnailUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
              <Image
                src={post.thumbnailUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {post.body?.length ? (
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-primary">
            <PortableText value={post.body} components={portableTextComponents} />
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">
            This article does not have any body content yet.
          </p>
        )}
      </div>

      {publishedRelated.length > 0 && (
        <section className="border-t border-border/40 bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline gap-6 mb-8">
              <h2 className="font-headline text-2xl font-bold shrink-0">
                Related
              </h2>
              <div className="h-px grow bg-border/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {publishedRelated.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/blog/${relatedPost.slug?.current}`}
                  className="group bg-background rounded-xl border border-border/40 overflow-hidden transition-colors hover:border-border/80"
                >
                  {relatedPost.thumbnailUrl && (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                      <Image
                        src={relatedPost.thumbnailUrl}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-1">
                    <h3 className="font-headline font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(relatedPost.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const portableTextComponents = {
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="font-headline">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-headline">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-headline">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="font-headline">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode
      value?: { href?: string; blank?: boolean }
    }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({
      value,
    }: {
      value: { asset?: { url?: string }; alt?: string }
    }) => {
      const url = urlFor(value)
      if (!url) return null
      return (
        <div className="my-8 rounded-xl overflow-hidden editorial-shadow">
          <Image
            src={url}
            alt={value.alt ?? ''}
            width={800}
            height={450}
            className="w-full object-cover"
          />
        </div>
      )
    },
  },
}
