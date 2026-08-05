'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  meApi,
  type GameLeaderboardEntry,
  type GameLeaderboardScope,
} from '@/src/api/me-client'

type Board =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; entries: GameLeaderboardEntry[] }

export function GamesLeaderboard() {
  const t = useTranslations('games')
  const [scope, setScope] = useState<Extract<GameLeaderboardScope, 'global' | 'weekly'>>('global')
  const [board, setBoard] = useState<Board>({ status: 'loading' })

  useEffect(() => {
    let active = true
    meApi.games
      .getLeaderboard({ scope, limit: 50 })
      .then(({ data }) => {
        if (active) setBoard({ status: 'ready', entries: data })
      })
      .catch(() => {
        if (active) setBoard({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [scope])

  function changeScope(next: Extract<GameLeaderboardScope, 'global' | 'weekly'>) {
    setBoard({ status: 'loading' })
    setScope(next)
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Tab active={scope === 'global'} onClick={() => changeScope('global')} label={t('tabGlobal')} />
        <Tab active={scope === 'weekly'} onClick={() => changeScope('weekly')} label={t('tabWeekly')} />
      </div>

      <div style={{ marginTop: 20 }}>
        {board.status === 'loading' && <p style={muted}>{t('loadingPassages')}</p>}
        {board.status === 'error' && <p style={muted}>{t('leaderboardError')}</p>}
        {board.status === 'ready' && board.entries.length === 0 && <p style={muted}>{t('emptyBoard')}</p>}
        {board.status === 'ready' && board.entries.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={th}>{t('rankCol')}</th>
                <th style={th}>{t('playerCol')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{t('scoreCol')}</th>
              </tr>
            </thead>
            <tbody>
              {board.entries.map((e) => (
                <tr key={`${e.rank}-${e.user_id}`} style={{ borderTop: '1px solid var(--ed-rule)' }}>
                  <td style={{ ...td, width: 56, color: 'var(--ed-fg-muted)' }}>{e.rank}</td>
                  <td style={td}>{e.display_name?.trim() || t('anonymous')}</td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '8px 16px',
        borderRadius: 2,
        cursor: 'pointer',
        fontSize: 13,
        border: `1px solid ${active ? 'var(--ed-fg)' : 'var(--ed-rule)'}`,
        background: active ? 'var(--ed-fg)' : 'var(--ed-surface)',
        color: active ? 'var(--ed-bg)' : 'var(--ed-fg)',
      }}
    >
      {label}
    </button>
  )
}

const muted: React.CSSProperties = { color: 'var(--ed-fg-muted)' }

const th: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  padding: '0 8px 10px',
  fontWeight: 400,
}

const td: React.CSSProperties = {
  padding: '12px 8px',
  fontSize: 15,
}
