import { sanityClient } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ArrowLeftIcon } from 'lucide-react'

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  category,
  body,
  "mainImageUrl": mainImage.asset->url,
  "authorName": author->name,
  "authorImageUrl": author->image.asset->url,
}`

const RELATED_QUERY = `*[_type == "post" && slug.current != $slug && category == $category] | order(publishedAt desc) [0...3] {
  _id,
  title,
  slug,
  publishedAt,
  category,
  "mainImageUrl": mainImage.asset->url,
}`

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  body?: PortableTextBlock[]
  mainImageUrl?: string
  authorName?: string
  authorImageUrl?: string
}

type RelatedPost = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt?: string
  category?: string
  mainImageUrl?: string
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityClient.fetch<Post | null>(POST_QUERY, { slug })
  if (!post) return {}
  return {
    title: `${post.title} | WikiSubmission`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.mainImageUrl ? [post.mainImageUrl] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await sanityClient.fetch<Post | null>(POST_QUERY, { slug })
  if (!post) notFound()

  const related = post.category
    ? await sanityClient.fetch<RelatedPost[]>(RELATED_QUERY, {
        slug,
        category: post.category,
      })
    : []

  return (
    <div className="min-h-screen">
      {/* Hero image */}
      {post.mainImageUrl && (
        <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden">
          <Image
            src={post.mainImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="space-y-4 mb-10">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
              {post.category}
            </span>
          )}
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 pt-2">
            {post.authorImageUrl && (
              <Image
                src={post.authorImageUrl}
                alt={post.authorName ?? ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            )}
            <div className="text-sm text-muted-foreground">
              {post.authorName && (
                <span className="font-medium text-foreground">
                  {post.authorName}
                </span>
              )}
              {post.publishedAt && (
                <span className="ml-2">{formatDate(post.publishedAt)}</span>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        {post.body && (
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-primary">
            <PortableText value={post.body} components={portableTextComponents} />
          </article>
        )}
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-border/40 bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-baseline gap-6 mb-8">
              <h2 className="font-headline text-2xl font-bold shrink-0">Related</h2>
              <div className="h-px grow bg-border/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p._id}
                  href={`/blog/${p.slug?.current}`}
                  className="group bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  {p.mainImageUrl && (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                      <Image
                        src={p.mainImageUrl}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
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
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic">
        {children}
      </blockquote>
    ),
  },
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string } }) => {
      const url = value?.asset?.url
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
