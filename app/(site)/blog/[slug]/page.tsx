import { sanityServer, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ArrowLeftIcon } from 'lucide-react'
import { getLocale } from 'next-intl/server'
import { buildPageMetadata } from '@/constants/metadata'

// Must match @sanity/document-internationalization supportedLanguages in studio
const SANITY_LANGUAGES = ['en', 'fr', 'ar', 'tr'] as const
type SanityLanguage = typeof SANITY_LANGUAGES[number]
function toSanityLanguage(locale: string): SanityLanguage {
  return (SANITY_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as SanityLanguage)
    : 'en'
}

const POST_QUERY = `*[_type == "article" && slug.current == $slug && language == $language][0] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  "category": categories[0]->name,
  "categoryRef": categories[0]._ref,
  body,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName,
  "authorPhotoUrl": author->photo.asset->url
}`

const RELATED_QUERY = `*[
  _type == "article" &&
  language == $language &&
  $categoryRef in categories[]._ref &&
  slug.current != $slug
] | order(publishedAt desc) [0...3] {
  _id,
  title,
  slug,
  publishedAt,
  "category": categories[0]->name,
  "thumbnailUrl": thumbnail.asset->url
}`

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  categoryRef?: string
  body?: PortableTextBlock[]
  thumbnailUrl?: string
  authorName?: string
  authorPhotoUrl?: string
}

type RelatedPost = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
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
    .flatMap((b) => (b as { children?: { text?: string }[] }).children ?? [])
    .map((c) => c.text ?? '')
    .join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const language = toSanityLanguage(locale)
  try {
    let post = await sanityServer.fetch<Post | null>(POST_QUERY, { slug, language })
    if (!post && language !== 'en') {
      post = await sanityServer.fetch<Post | null>(POST_QUERY, { slug, language: 'en' })
    }
    if (!post) return {}
    const base = buildPageMetadata({
      title: `${post.title} | WikiSubmission`,
      description: post.excerpt ?? '',
      url: `https://wikisubmission.org/blog/${slug}`,
      image: post.thumbnailUrl,
    })
    return {
      ...base,
      openGraph: {
        ...base.openGraph,
        type: 'article',
        ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
        ...(post.authorName ? { authors: [post.authorName] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const language = toSanityLanguage(locale)

  let post: Post | null = null
  try {
    post = await sanityServer.fetch<Post | null>(POST_QUERY, { slug, language })
    // Fallback to English for untranslated articles (preserves deep links)
    if (!post && language !== 'en') {
      post = await sanityServer.fetch<Post | null>(POST_QUERY, { slug, language: 'en' })
    }
  } catch (err) {
    console.error('[blog/slug] Sanity fetch failed:', err)
    notFound()
  }

  if (!post) notFound()

  let related: RelatedPost[] = []
  if (post.categoryRef) {
    try {
      related = await sanityServer.fetch<RelatedPost[]>(RELATED_QUERY, {
        slug,
        categoryRef: post.categoryRef,
        language,
      })
    } catch {
      // non-critical — page still renders without related posts
    }
  }

  return (
    <div className="min-h-screen">
      {/* ── Post header ───────────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-10 space-y-5">

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Blog
          </Link>

          <div className="space-y-3">
            {post.category && (
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {post.category}
              </span>
            )}
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Metadata bar */}
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
              {post.authorName && (
                <span className="text-sm font-semibold">{post.authorName}</span>
              )}
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
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {post.body && (
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-primary">
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          </article>
        )}
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-border/40 bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline gap-6 mb-8">
              <h2 className="font-headline text-2xl font-bold shrink-0">
                Related
              </h2>
              <div className="h-px grow bg-border/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p._id}
                  href={`/blog/${p.slug?.current}`}
                  className="group bg-background rounded-xl border border-border/40 overflow-hidden transition-colors hover:border-border/80"
                >
                  {p.thumbnailUrl && (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-1">
                    <h3 className="font-headline font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.publishedAt)}
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
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string; blank?: boolean } }) => (
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
