'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Trash2, ArrowRight, BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { meApi, type ActivityEntry, type ActivityKind } from '@/src/api/me-client'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; entries: ActivityEntry[] }

export function ActivityClient() {
  const t = useTranslations('meActivity')
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [clearing, setClearing] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let active = true
    meApi.activity
      .list({ limit: 100 })
      .then(({ data }) => {
        if (active) setLoad({ status: 'ready', entries: data })
      })
      .catch(() => {
        if (active) setLoad({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [tick])

  async function clearAll() {
    if (clearing) return
    if (!window.confirm(t('clearConfirm'))) return
    setClearing(true)
    try {
      await meApi.activity.clear()
      setLoad({ status: 'loading' })
      setTick((n) => n + 1)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="max-w-[840px] mx-auto py-2">
      {/* ── Masthead ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--ed-rule)] mb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-2">
            <Clock size={13} />
            <span>Devotional Record</span>
          </div>
          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            {t('title')}
          </h1>
          <p
            style={{ fontFamily: F.serif }}
            className="m-0 mt-2 text-[14px] text-[var(--ed-fg-muted)] leading-relaxed"
          >
            {t('lede')}
          </p>
        </div>

        {load.status === 'ready' && load.entries.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-[var(--ed-rule)] hover:border-red-500/50 hover:text-red-500 text-[12px] font-mono text-[var(--ed-fg-muted)] transition-colors cursor-pointer shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>{t('clear')}</span>
          </button>
        )}
      </div>

      {load.status === 'loading' && (
        <div className="py-12 text-center text-[13px] font-mono text-[var(--ed-fg-muted)]">
          {t('loading')}
        </div>
      )}

      {load.status === 'error' && (
        <div className="py-8 text-center text-[13px] font-mono text-red-500">
          {t('error')}
        </div>
      )}

      {load.status === 'ready' && load.entries.length === 0 && (
        <div className="rounded-[10px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-8 sm:p-12 text-center max-w-lg mx-auto w-full my-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
            <BookOpen size={22} />
          </div>

          <h3
            style={{ fontFamily: F.display }}
            className="m-0 text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            No reading activity recorded yet
          </h3>

          <p
            style={{ fontFamily: F.serif }}
            className="mt-2 text-[14px] text-[var(--ed-fg-muted)] leading-relaxed"
          >
            As you browse scriptures, search verses, and study chapters, your devotional timeline will be recorded here.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <Link
              href="/quran/1"
              className="ed-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[14px] no-underline group"
              style={{ fontFamily: F.serif }}
            >
              <span>Start Reading The Holy Qur’an</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {load.status === 'ready' && load.entries.length > 0 && (
        <div className="divide-y divide-[var(--ed-rule)]">
          {load.entries.map((entry) => (
            <div key={entry.id} className="py-3.5">
              <ActivityRow entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const t = useTranslations('meActivity')
  const label = kindLabel(t, entry.kind)
  const detail = entry.query ?? entry.verse_key ?? ''
  const href = activityHref(entry)
  const time = new Date(entry.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-[var(--ed-accent)] mb-0.5">
          {label}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-[14.5px] text-[var(--ed-fg)] hover:text-[var(--ed-accent)] hover:underline font-medium transition-colors"
            style={{ fontFamily: F.serif }}
          >
            {detail}
          </Link>
        ) : (
          <span className="text-[14.5px] text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
            {detail}
          </span>
        )}
      </div>
      <time className="shrink-0 font-mono text-[11px] text-[var(--ed-fg-muted)]">
        {time}
      </time>
    </div>
  )
}

function kindLabel(t: ReturnType<typeof useTranslations>, kind: ActivityKind): string {
  switch (kind) {
    case 'search':
      return t('kindSearch')
    case 'browse_chapter':
      return t('kindBrowseChapter')
    case 'browse_verse':
      return t('kindBrowseVerse')
    case 'browse_verse_range':
      return t('kindBrowseVerseRange')
  }
}

function activityHref(entry: ActivityEntry): string | null {
  if (entry.kind === 'search' && entry.query) {
    return `/quran?q=${encodeURIComponent(entry.query)}`
  }
  if (entry.kind === 'browse_chapter' && entry.verse_key) {
    const [chapter, verse] = entry.verse_key.split(':')
    return verse ? `/quran/${chapter}?verse=${verse}` : `/quran/${chapter}`
  }
  if ((entry.kind === 'browse_verse' || entry.kind === 'browse_verse_range') && entry.query) {
    return `/quran/${encodeURIComponent(entry.query)}`
  }
  return null
}
