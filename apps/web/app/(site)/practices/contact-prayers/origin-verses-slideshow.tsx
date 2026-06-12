'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Copy, Check } from 'lucide-react'
import { F, Arrow } from '../../_sections/shared/server'
import { wsApi } from '@/src/api/client'
import { parseQuranRef } from '@/lib/scripture-parser'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const ROTATE_MS = 7000

function ProgressBar({
  progressKey,
  durationMs,
  reducedMotion,
}: {
  progressKey: number
  durationMs: number
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const el = ref.current
    if (!el) return
    gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: 1, duration: durationMs / 1000, ease: 'none' },
    )
  }, [progressKey, durationMs, reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--ed-accent)',
        transformOrigin: 'left center',
        transform: 'scaleX(0)',
        zIndex: 10,
        opacity: 0.6,
      }}
    />
  )
}

function VerseText({
  verseKey,
  text,
  reducedMotion,
}: {
  verseKey: string
  text: string
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLParagraphElement | null>(null)
  const prevKeyRef = useRef(verseKey)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prevKeyRef.current === verseKey || reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 })
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      )
    }
    prevKeyRef.current = verseKey
  }, [verseKey, reducedMotion])

  return (
    <p
      ref={ref}
      style={{
        fontFamily: F.display,
        fontSize: 'clamp(20px, 4vw, 26px)',
        lineHeight: 1.4,
        color: 'var(--ed-fg)',
        letterSpacing: '-0.015em',
        maxWidth: '52ch',
        margin: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          color: 'var(--ed-accent)',
          fontSize: '1.4em',
          lineHeight: 0,
          marginRight: 6,
          fontFamily: F.display,
        }}
      >
        &ldquo;
      </span>
      {text}
    </p>
  )
}

export function OriginVersesSlideshow({ refs }: { refs: string[] }) {
  const [verses, setVerses] = useState<{ ref: string; text: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const fetched = await Promise.all(
          refs.map(async (ref) => {
            const parsed = parseQuranRef(ref)
            if (!parsed) return { ref, text: 'Invalid reference.' }

            const { data } = await wsApi.GET('/quran', {
              params: {
                query: {
                  chapter_number_start: parsed.cn,
                  verse_start: parsed.vs,
                  verse_end: parsed.ve,
                  langs: ['en'],
                },
              },
            })

            const verseData = data?.chapters?.[0]?.verses?.[0]
            const text = verseData?.tr?.en?.tx || 'Translation not available.'

            return { ref, text }
          })
        )
        setVerses(fetched)
      } catch (err) {
        console.error('Failed to fetch verses', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [refs])

  useEffect(() => {
    if (loading || verses.length === 0 || reducedMotion) return
    const tm = setInterval(() => {
      setIdx((p) => (p + 1) % verses.length)
      setProgressKey((k) => k + 1)
    }, ROTATE_MS)
    return () => clearInterval(tm)
  }, [verses.length, loading, reducedMotion])

  if (loading) {
    return (
      <div className="w-full h-72 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 animate-pulse flex flex-col items-center justify-center my-10 gap-3">
        <div className="h-4 w-32 bg-[var(--ed-rule)] rounded-full mb-4" />
        <div className="h-6 w-3/4 max-w-lg bg-[var(--ed-rule)] rounded-full" />
        <div className="h-6 w-2/3 max-w-md bg-[var(--ed-rule)] rounded-full" />
      </div>
    )
  }

  if (verses.length === 0) return null

  const v = verses[idx]

  const handleCopy = () => {
    navigator.clipboard.writeText(`${v.text}\n— Quran ${v.ref}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="my-10"
      style={{
        border: '1px solid var(--ed-rule)',
        borderRadius: 0,
        backgroundColor: 'var(--ed-surface)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ProgressBar progressKey={progressKey} durationMs={ROTATE_MS} reducedMotion={reducedMotion} />

      <div
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{
          padding: 'clamp(16px, 3vw, 22px) clamp(20px, 4vw, 32px)',
          borderBottom: '1px solid var(--ed-rule)',
        }}
      >
        <div
          style={{
            fontFamily: F.glacial,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
          }}
        >
          Quranic Evidence · The Religion of Abraham
        </div>
      </div>

      <div
        style={{
          padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'baseline',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: F.glacial,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ed-accent)',
            }}
          >
            {v.ref}
          </span>

          <button
            onClick={handleCopy}
            className="ml-auto flex size-11 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
            title="Copy verse"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>

        <VerseText verseKey={String(idx)} text={v.text} reducedMotion={reducedMotion} />
      </div>

      <div
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{
          padding: 'clamp(16px, 3vw, 20px) clamp(20px, 4vw, 32px)',
          borderTop: '1px solid var(--ed-rule)',
          backgroundColor: 'var(--ed-bg-alt)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href={`/quran/${v.ref}`}
            className="ed-btn-primary"
            style={{ fontFamily: F.serif, padding: '10px 18px' }}
          >
            Read Chapter
            <Arrow />
          </Link>
        </div>

        <div aria-label="Verse rotation" style={{ display: 'flex', gap: 2 }}>
          {verses.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIdx(i)
                setProgressKey((k) => k + 1)
              }}
              aria-label={`Go to verse ${i + 1}`}
              aria-current={i === idx ? 'true' : undefined}
              className="flex size-11 items-center justify-center"
            >
              <span
                style={{
                  width: i === idx ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background:
                    i === idx ? 'var(--ed-accent)' : 'var(--ed-rule)',
                  transition: 'all 180ms',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
