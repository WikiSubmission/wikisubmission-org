'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { meApi, type ActivityEntry, type ActivityKind } from '@/src/api/me-client'

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
    <section style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={titleStyle}>{t('title')}</h1>
        <p style={ledeStyle}>{t('lede')}</p>
      </header>

      {load.status === 'loading' && <p style={mutedStyle}>{t('loading')}</p>}
      {load.status === 'error' && <p style={mutedStyle}>{t('error')}</p>}
      {load.status === 'ready' && load.entries.length === 0 && (
        <p style={mutedStyle}>{t('empty')}</p>
      )}

      {load.status === 'ready' && load.entries.length > 0 && (
        <>
          <ul style={listStyle}>
            {load.entries.map((entry) => (
              <li key={entry.id} style={itemStyle}>
                <ActivityRow entry={entry} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={clearAll}
            disabled={clearing}
            style={dangerButtonStyle}
          >
            {t('clear')}
          </button>
        </>
      )}
    </section>
  )
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const t = useTranslations('meActivity')
  const label = kindLabel(t, entry.kind)
  const detail = entry.query ?? entry.verse_key ?? ''
  const href = activityHref(entry)
  const time = new Date(entry.created_at).toLocaleString()

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
      <div style={{ minWidth: 0 }}>
        <div style={kindStyle}>{label}</div>
        {href ? (
          <Link href={href} style={detailLinkStyle}>
            {detail}
          </Link>
        ) : (
          <span style={detailStyle}>{detail}</span>
        )}
      </div>
      <time style={timeStyle}>{time}</time>
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

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(32px, 5vw, 48px)',
  lineHeight: 1.1,
  margin: 0,
}

const ledeStyle: React.CSSProperties = {
  marginTop: 8,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}

const mutedStyle: React.CSSProperties = { color: 'var(--ed-fg-muted)', fontSize: 14 }

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  borderTop: '1px solid var(--ed-rule)',
}

const itemStyle: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid var(--ed-rule)',
}

const kindStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  marginBottom: 2,
}

const detailStyle: React.CSSProperties = {
  fontSize: 15,
  color: 'var(--ed-fg)',
  wordBreak: 'break-word',
}

const detailLinkStyle: React.CSSProperties = {
  ...detailStyle,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
}

const timeStyle: React.CSSProperties = {
  flexShrink: 0,
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  color: 'var(--ed-fg-muted)',
}

const dangerButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
  fontSize: 13,
  cursor: 'pointer',
}
