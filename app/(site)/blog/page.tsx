import { sanityClient, urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  openGraph: {
    title: 'Blog | WikiSubmission',
    description: 'Articles, reflections, and research from the WikiSubmission community.',
  },
}

// Adjust these field names to match your Sanity schema
const LATEST_QUERY = `*[_type == "post"] | order(publishedAt desc) [0...12] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  category,
  "mainImageUrl": mainImage.asset->url,
  "authorName": author->name,
  viewCount
}`

const FEATURED_QUERY = `*[_type == "post"] | order(viewCount desc) [0...3] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  category,
  "mainImageUrl": mainImage.asset->url,
  "authorName": author->name,
  viewCount
}`

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  mainImageUrl?: string
  authorName?: string
  viewCount?: number
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  const [latest, featured] = await Promise.all([
    sanityClient.fetch<Post[]>(LATEST_QUERY),
    sanityClient.fetch<Post[]>(FEATURED_QUERY),
  ])

  // Exclude featured posts from the grid to avoid duplicates
  const featuredIds = new Set(featured.map((p) => p._id))
  const grid = latest.filter((p) => !featuredIds.has(p._id))

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            Blog
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Latest Articles
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Research, reflections, and community writings on the Quran and Submission.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Featured / most-read */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-baseline gap-6 mb-8">
              <h2 className="font-headline text-2xl font-bold shrink-0">Most Read</h2>
              <div className="h-px grow bg-border/60" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                Featured
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((post, i) => (
                <FeaturedCard key={post._id} post={post} large={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Latest grid */}
        {grid.length > 0 && (
          <section>
            <div className="flex items-baseline gap-6 mb-8">
              <h2 className="font-headline text-2xl font-bold shrink-0">Recent</h2>
              <div className="h-px grow bg-border/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {grid.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {latest.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg font-headline font-bold">No posts yet</p>
            <p className="text-sm mt-2">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedCard({ post, large }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className={`group relative bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-1 ${large ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      {post.mainImageUrl && (
        <div className={`relative w-full overflow-hidden bg-muted ${large ? 'aspect-[16/9]' : 'aspect-video'}`}>
          <Image
            src={post.mainImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 space-y-3">
        {post.category && (
          <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
            {post.category}
          </span>
        )}
        <h3 className={`font-headline font-extrabold leading-snug group-hover:text-primary transition-colors ${large ? 'text-2xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && post.publishedAt && <span>·</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className="group bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-0.5"
    >
      {post.mainImageUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={post.mainImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 space-y-2">
        {post.category && (
          <span className="inline-block px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-base leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <p className="text-xs text-muted-foreground pt-1">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  )
}
