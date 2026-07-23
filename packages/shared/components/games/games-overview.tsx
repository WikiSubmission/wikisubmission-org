'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { meApi, type GameStats, type GameHistoryEntry } from '@/src/api/me-client'

export function GamesOverview() {
  const t = useTranslations('games')
  const [stats, setStats] = useState<GameStats | null>(null)
  const [history, setHistory] = useState<GameHistoryEntry[] | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([meApi.games.getStats(), meApi.games.getHistory({ limit: 5 })])
      .then(([s, h]) => {
        if (!active) return
        setStats(s.data)
        setHistory(h.data)
      })
      .catch(() => {
        // Overview is non-critical: stay hidden on failure rather than block the lobby.
      })
    return () => {
      active = false
    }
  }, [])

  // Hide entirely until the player has a record — keeps the lobby clean for newcomers.
  if (!stats || stats.total_attempts === 0) return null

  return (
    <section style={{ marginTop: 48, borderTop: '1px solid var(--ed-rule)', paddingTop: 32 }}>
      <h2 style={sectionHeading}>{t('statsTitle')}</h2>
      <div style={statGrid}>
        <Stat label={t('statTotalAttempts')} value={stats.total_attempts} />
        <Stat label={t('statBestScore')} value={stats.best_score} />
        <Stat label={t('statVariantsCompleted')} value={stats.variants_completed} />
      </div>

      {history && history.length > 0 && (
        <>
          <h2 style={{ ...sectionHeading, marginTop: 32 }}>{t('historyTitle')}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            {history.map((h) => (
              <li
                key={h.attempt_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  border: '1px solid var(--ed-rule)',
                  borderRadius: 2,
                  fontSize: 14,
                }}
              >
                <span style={{ ...mono, textTransform: 'capitalize' }}>
                  {t(`difficulty${cap(h.difficulty)}` as Parameters<typeof t>[0])}
                </span>
                <span style={{ ...mono, color: 'var(--ed-fg-muted)', textTransform: 'capitalize' }}>
                  {t(`size${cap(h.size)}` as Parameters<typeof t>[0])}
                </span>
                <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  {h.score}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 2, padding: '16px 18px' }}>
      <div
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 36,
          lineHeight: 1,
          color: 'var(--ed-accent)',
        }}
      >
        {value}
      </div>
      <div style={{ ...mono, marginTop: 6 }}>{label}</div>
    </div>
  )
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 24,
  fontWeight: 500,
  margin: '0 0 16px',
}

const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}
