import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { Children, type ReactNode } from 'react'
import { ScriptureText } from '@/components/scripture-text'
import { urlFor } from '@/lib/sanity'
import type { BlogPost, RelatedBlogPost } from '@/lib/blog-queries'
import { BlogReadingProgressBar } from './blog-reading-progress-bar'

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

/**
 * Article detail view. Shared verbatim between the web blog route and the
 * mobile More tab. Data (post + related) is fetched by the caller: the web app
 * fetches server-side, mobile fetches client-side via the shared Sanity CDN
 * client. The `hrefForRelated`/`backHref` props let each platform point links
 * at its own route shape.
 */
export function BlogPostArticle({
  post,
  related = [],
  preview = false,
  backHref = '/blog',
  hrefForRelated = (slug: string) => `/blog/${slug}`,
}: {
  post: BlogPost
  related?: RelatedBlogPost[]
  preview?: boolean
  backHref?: string
  hrefForRelated?: (slug: string) => string
}) {
  const title = post.title?.trim() || 'Untitled article'
  const publishedRelated = related.filter((relatedPost) => relatedPost.slug?.current)
  const scriptureRefsEnabled = post.enableScriptureRefs ?? true
  const portableTextComponents = buildPortableTextComponents(scriptureRefsEnabled)
  const articleBodyId = 'blog-article-body'

  return (
    <div className="min-h-screen pb-32 md:pb-40">
      <BlogReadingProgressBar targetId={articleBodyId} />

      {/* ── Top breadcrumb / back link ─────────────────────────────────── */}
      <nav
        aria-label="Article navigation"
        className="px-6 md:px-12 max-w-[1200px] mx-auto pt-6 pb-2 text-[13px]"
      >
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4 rtl-flip" />
          <span>All articles</span>
        </Link>
      </nav>

      {/* ── Title block (centered, magazine style) ──────────────────────── */}
      <section className="px-6 md:px-12 pt-8 pb-10 max-w-[760px] mx-auto text-center">
        {preview && (
          <div className="mb-8 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 text-left">
            Draft preview. This article is being loaded from unpublished Sanity content through a secret link.
          </div>
        )}

        {post.category && (
          <span className="inline-block mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {post.category}
          </span>
        )}

        <h1 className="font-headline text-[clamp(36px,5vw,64px)] tracking-[-0.02em] leading-[1.08] mb-6">
          {title}
        </h1>

        {post.excerpt && (
          <p className="italic text-[20px] md:text-[22px] leading-[1.4] text-muted-foreground max-w-[50ch] mx-auto mb-9">
            {post.excerpt}
          </p>
        )}

        <dl className="flex flex-wrap justify-center gap-x-10 gap-y-5 text-left">
          {post.authorName && (
            <div className="flex flex-col gap-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Author
              </dt>
              <dd className="flex items-center gap-2 text-[14px] text-foreground">
                {post.authorPhotoUrl && (
                  <Image
                    src={post.authorPhotoUrl}
                    alt=""
                    aria-hidden
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                )}
                <span>{post.authorName}</span>
              </dd>
            </div>
          )}
          {post.publishedAt && (
            <div className="flex flex-col gap-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Published
              </dt>
              <dd className="text-[14px] text-foreground">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </dd>
            </div>
          )}
          {post.body && (
            <div className="flex flex-col gap-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Read time
              </dt>
              <dd className="text-[14px] text-foreground">{readingTime(post.body)}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Cover image ─────────────────────────────────────────────────── */}
      {post.thumbnailUrl && (
        <div className="max-w-[680px] mx-auto px-6 mb-12">
          <div className="rounded-2xl overflow-hidden bg-muted">
            <Image
              src={post.thumbnailUrl}
              alt={title}
              width={1200}
              height={675}
              sizes="(max-width: 680px) 100vw, 680px"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <article id={articleBodyId} className="max-w-[680px] mx-auto px-6">
        {post.body?.length ? (
          <PortableText value={post.body} components={portableTextComponents} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This article does not have any body content yet.
          </p>
        )}
      </article>

      {/* ── Article footer (signature + share-back) ─────────────────────── */}
      <div className="max-w-[680px] mx-auto px-6 mt-16 pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-primary hover:text-primary/80 transition-colors self-start sm:self-auto"
          >
            <ArrowLeftIcon className="size-3.5 rtl-flip" /> All articles
          </Link>
          <div className="flex items-center gap-3">
            {post.authorPhotoUrl && (
              <Image
                src={post.authorPhotoUrl}
                alt={post.authorName ?? ''}
                width={24}
                height={24}
                className="rounded-full object-cover shrink-0"
              />
            )}
            <div className="text-[13px] leading-tight">
              {post.authorName && (
                <div className="font-semibold text-foreground">{post.authorName}</div>
              )}
              {post.publishedAt && (
                <div className="text-muted-foreground/80">
                  {formatDate(post.publishedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related ─────────────────────────────────────────────────────── */}
      {publishedRelated.length > 0 && (
        <section className="px-6 md:px-12 max-w-[1200px] mx-auto mt-20 pt-12 border-t border-border/50">
          <div className="text-center mb-12 md:mb-14">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Continue reading
            </span>
            <h2 className="font-headline text-[clamp(28px,3.2vw,40px)] tracking-[-0.02em] leading-[1.1]">
              More from the blog
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedRelated.map((relatedPost) => (
              <Link
                key={relatedPost._id}
                href={hrefForRelated(relatedPost.slug!.current!)}
                className="group flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden transition-colors hover:border-border"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                  {relatedPost.thumbnailUrl && (
                    <Image
                      src={relatedPost.thumbnailUrl}
                      alt={relatedPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-headline text-base tracking-[-0.01em] leading-snug group-hover:text-muted-foreground transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/80">
                    {formatDate(relatedPost.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function wrapStringChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child, i) =>
    typeof child === 'string' ? (
      <ScriptureText key={i} text={child} from="blog post" />
    ) : (
      child
    ),
  )
}

function buildPortableTextComponents(scriptureRefsEnabled: boolean) {
  const renderText = (children: ReactNode) =>
    scriptureRefsEnabled ? wrapStringChildren(children) : children

  return {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="mb-6 leading-[1.7] text-[19px] text-foreground/85">{renderText(children)}</p>
    ),
    h1: ({ children }: { children?: ReactNode }) => (
      <h1 className="font-headline text-[40px] mt-14 mb-5 tracking-[-0.02em] leading-[1.1]">
        {renderText(children)}
      </h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="font-headline text-[34px] mt-14 mb-4 tracking-[-0.02em] leading-[1.15]">
        {renderText(children)}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="font-headline text-[24px] mt-10 mb-3 tracking-[-0.015em] leading-[1.2]">
        {renderText(children)}
      </h3>
    ),
    h4: ({ children }: { children?: ReactNode }) => (
      <h4 className="font-headline text-[19px] mt-8 mb-2 tracking-[-0.01em]">
        {renderText(children)}
      </h4>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="my-9 pl-6 border-l-2 border-primary italic text-[22px] leading-[1.45]">
        {renderText(children)}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-6 space-y-2 pl-5 list-disc marker:text-primary text-[19px] leading-[1.7] text-foreground/85">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-6 space-y-2 pl-5 list-decimal marker:text-primary text-[19px] leading-[1.7] text-foreground/85">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => <li>{renderText(children)}</li>,
    number: ({ children }: { children?: ReactNode }) => <li>{renderText(children)}</li>,
  },
  marks: {
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children?: ReactNode }) => (
      <code className="px-1.5 py-0.5 rounded text-[15px] font-mono bg-muted text-foreground">
        {children}
      </code>
    ),
    link: ({
      children,
      value,
    }: {
      children?: ReactNode
      value?: { href?: string; blank?: boolean }
    }) => {
      const isExternal = value?.href?.startsWith('http')
      return (
        <a
          href={value?.href}
          target={isExternal || value?.blank ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({
      value,
    }: {
      value: { asset?: { url?: string }; alt?: string; caption?: string }
    }) => {
      const url = urlFor(value)
      if (!url) return null
      return (
        <figure className="my-10">
          <div className="relative w-full rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio: '16 / 9' }}>
            <Image
              src={url}
              alt={value.alt ?? ''}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2.5 text-center text-[13px] text-muted-foreground/80">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  }
}
