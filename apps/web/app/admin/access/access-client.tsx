'use client'

import { useState } from 'react'
import type { AdminUser } from '@/lib/admin-users-client'
import { ThemedSelect } from '@/components/ui/themed-select'
import { setGamesEditorAction, setRoleAction } from './actions'

interface AccessClientProps {
  initialUsers: AdminUser[]
  initialError: string | null
}

type Pending = { kind: 'role' | 'games'; userId: number } | null

const ROLE_OPTIONS = [
  { value: 'member', label: 'member' },
  { value: 'editor', label: 'editor' },
  { value: 'admin', label: 'admin' },
] as const

export function AccessClient({ initialUsers, initialError }: AccessClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [pending, setPending] = useState<Pending>(null)
  const [error, setError] = useState<string | null>(initialError)

  function patchUser(updated: AdminUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  async function toggleGamesEditor(user: AdminUser) {
    const granted = user.permissions?.games_editor === true
    setPending({ kind: 'games', userId: user.id })
    setError(null)
    const result = await setGamesEditorAction(user.id, !granted)
    setPending(null)
    if (!result.ok) setError(result.error)
    else patchUser(result.data)
  }

  async function changeRole(user: AdminUser, role: 'admin' | 'editor' | 'member') {
    if (role === user.role) return
    setPending({ kind: 'role', userId: user.id })
    setError(null)
    const result = await setRoleAction(user.id, role)
    setPending(null)
    if (!result.ok) setError(result.error)
    else patchUser(result.data)
  }

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 24 }}>
        <p style={kicker}>Administration</p>
        <h1 style={heading}>Access</h1>
        <p style={lede}>
          Grant or revoke per-feature access. Admins get every section. Non-admins with a
          permission row see only the section they have been granted; everything else is hidden.
        </p>
      </header>

      {error && <p style={errorStyle}>{error}</p>}

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Role</th>
              <th style={th}>Games editor</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isPendingRole = pending?.kind === 'role' && pending.userId === user.id
              const isPendingGames = pending?.kind === 'games' && pending.userId === user.id
              const gamesGranted = user.permissions?.games_editor === true
              return (
                <tr key={user.id} style={{ borderTop: '1px solid var(--ed-rule)' }}>
                  <td style={td}>
                    <div style={emailStyle}>{user.email}</div>
                    {user.display_name && <div style={subStyle}>{user.display_name}</div>}
                    {!user.is_active && <div style={subStyle}>inactive</div>}
                  </td>
                  <td style={td}>
                    <ThemedSelect
                      value={user.role}
                      disabled={isPendingRole}
                      onChange={(nextRole) =>
                        changeRole(user, nextRole as 'admin' | 'editor' | 'member')
                      }
                      options={ROLE_OPTIONS.map((opt) => ({ ...opt }))}
                      aria-label={`Set role for ${user.email}`}
                    />
                  </td>
                  <td style={td}>
                    <button
                      type="button"
                      onClick={() => toggleGamesEditor(user)}
                      disabled={isPendingGames}
                      style={gamesGranted ? buttonOn : buttonOff}
                    >
                      {gamesGranted ? 'Granted' : 'Grant'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const wrap: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
}

const kicker: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  margin: 0,
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(32px, 5vw, 48px)',
  margin: '6px 0 12px',
}

const lede: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 15,
  lineHeight: 1.55,
  maxWidth: 640,
}

const tableWrap: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  background: 'var(--ed-surface)',
  overflow: 'hidden',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  fontWeight: 400,
  borderBottom: '1px solid var(--ed-rule)',
}

const td: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'middle',
  fontSize: 14,
}

const emailStyle: React.CSSProperties = { color: 'var(--ed-fg)' }
const subStyle: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 12,
  marginTop: 2,
}

const buttonBase: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 2,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const buttonOn: React.CSSProperties = {
  ...buttonBase,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
}

const buttonOff: React.CSSProperties = {
  ...buttonBase,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
}

const errorStyle: React.CSSProperties = {
  color: '#b91c1c',
  marginBottom: 12,
  fontSize: 14,
}
