'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

type Article = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  category?: string
  thumbnailUrl?: string
}

export function JournalSection({ articles }: { articles: Article[] }) {
  const t = useTranslations('homePage.journal')
  if (articles.length === 0) return null

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        <div
          style={{ gap: 24 }}
          className="grid grid-cols-3 max-md:grid-cols-1"
        >
          {articles.slice(0, 3).map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug?.current}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                textDecoration: 'none',
                transition: 'transform 250ms',
              }}
              className="group"
            >
              {/* Visual */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  backgroundColor: 'var(--ed-surface)',
                  border: '1px solid var(--ed-rule)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                {post.thumbnailUrl ? (
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'repeating-linear-gradient(45deg, transparent, transparent 12px, color-mix(in oklab, var(--ed-fg), transparent 92%) 12px, color-mix(in oklab, var(--ed-fg), transparent 92%) 13px)',
                    }}
                  />
                )}
                {post.category && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      padding: '4px 10px',
                      backgroundColor: 'var(--ed-surface)',
                      border: '1px solid var(--ed-rule)',
                      fontFamily: F.mono,
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--ed-accent)',
                    }}
                  >
                    {post.category}
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h3
                  style={{
                    fontFamily: F.display,
                    fontSize: 22,
                    fontWeight: 500,
                    lineHeight: 1.15,
                    letterSpacing: '-0.015em',
                    color: 'var(--ed-fg)',
                  }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p
                    style={{
                      fontFamily: F.serif,
                      fontSize: 14,
                      color: 'var(--ed-fg-muted)',
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt}
                  </p>
                )}
                {post.publishedAt && (
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 10.5,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--ed-fg-muted)',
                      marginTop: 4,
                    }}
                  >
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* All writing link */}
        <Link href="/blog" className="ed-cta" style={{ marginTop: 40, display: 'inline-flex' }}>
          {t('allWriting')} <Arrow />
        </Link>
      </div>
    </section>
  )
}
