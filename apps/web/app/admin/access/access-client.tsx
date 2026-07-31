'use client'

/**
 * The unified access console. One expandable panel per user covering all three
 * areas of access:
 *
 *   Role      — member / editor / admin (admins bypass every grant below)
 *   Games     — a global "all games" tier plus a per-game row for each game
 *   Editorial — per-module, and for Quran/Bible a per-version row with the
 *               separate approver capability and the word-by-word reference
 *
 * Saving issues at most two calls: PATCH /users/{id} when the role changed, and
 * PUT /editorial/admin/editors/{id} for everything else (which the backend
 * applies atomically, revoking anything absent from the request).
 *
 * Admin-only surface; the backend re-checks on every call. Replaces the old
 * role-plus-one-checkbox table and the separate /editor/admin grant editor.
 */
import { useMemo, useState, useTransition } from 'react'

import type {
  EditorGame,
  EditorialEditor,
} from '@/lib/editorial-content-client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STATUS_META } from '@/components/editor/content/status'
import {
  Chip,
  GrantRow,
  GrantSectionHeading,
  NativeSelect,
  TriState,
  type GrantLevel,
} from '@/components/admin/grants/grant-controls'
import {
  CONTENT_MODULES,
  grantStateToInput,
  grantSummary,
  initialGrantState,
  type GrantState,
} from '@/components/admin/grants/grant-state'
import { saveAccessAction } from './actions'

export type UserRole = 'admin' | 'editor' | 'member'

const ROLE_OPTIONS: Array<{ v: UserRole; label: string }> = [
  { v: 'member', label: 'Member' },
  { v: 'editor', label: 'Editor' },
  { v: 'admin', label: 'Admin' },
]

interface VersionOption {
  id: number
  name: string
}

interface AccessClientProps {
  editors: EditorialEditor[]
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  games: EditorGame[]
  loadError: string | null
}

export function AccessClient({
  editors,
  quranVersions,
  bibleVersions,
  games,
  loadError,
}: AccessClientProps) {
  const [openUserId, setOpenUserId] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return editors
    return editors.filter(
      (e) =>
        e.email.toLowerCase().includes(q) ||
        (e.display_name ?? '').toLowerCase().includes(q)
    )
  }, [editors, query])

  return (
    <section className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <p className="m-0 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-1.5 mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(32px,5vw,48px)]">
          Access
        </h1>
        <p className="max-w-[640px] text-[15px] leading-relaxed text-muted-foreground">
          Grant access per area. Admins get everything and bypass the grants
          below. Everyone else sees only what is granted here — a games grant
          can cover every game or just one, and Quran access can be scoped to
          individual versions.
        </p>
      </header>

      {loadError && (
        <p className="mb-3 text-[14px] text-destructive">{loadError}</p>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by email or name…"
        aria-label="Filter users"
        className="mb-4 h-9 w-full max-w-[320px] rounded-[2px] border border-input bg-transparent px-3 font-[family-name:var(--font-source-serif)] text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />

      <div className="overflow-hidden rounded-[3px] border border-border bg-card">
        {filtered.map((editor) => (
          <EditorRow
            key={editor.user_id}
            editor={editor}
            quranVersions={quranVersions}
            bibleVersions={bibleVersions}
            games={games}
            open={openUserId === editor.user_id}
            onToggle={() =>
              setOpenUserId(
                openUserId === editor.user_id ? null : editor.user_id
              )
            }
          />
        ))}
        {filtered.length === 0 && (
          <p className="m-0 p-4 text-[16px] text-muted-foreground">
            {editors.length === 0
              ? 'No users found.'
              : 'No users match that filter.'}
          </p>
        )}
      </div>
    </section>
  )
}

function EditorRow({
  editor,
  quranVersions,
  bibleVersions,
  games,
  open,
  onToggle,
}: {
  editor: EditorialEditor
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  games: EditorGame[]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-source-serif)] text-[17px] font-medium text-foreground">
            {editor.display_name || editor.email}
          </span>
          {editor.role === 'admin' && (
            <Badge className="font-[family-name:var(--font-glacial)] text-[11px] uppercase tracking-[0.1em]">
              admin
            </Badge>
          )}
          {editor.role === 'editor' && (
            <Badge
              variant="outline"
              className="font-[family-name:var(--font-glacial)] text-[11px] uppercase tracking-[0.1em]"
            >
              editor
            </Badge>
          )}
          {!editor.is_active && (
            <Badge
              variant="outline"
              className="font-[family-name:var(--font-glacial)] text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
            >
              deactivated
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[12.5px] text-muted-foreground">
          <span>{editor.email}</span>
          <span className="opacity-45">·</span>
          <span>{grantSummary(editor)}</span>
        </div>
      </button>
      {open && (
        <AccessPanel
          editor={editor}
          quranVersions={quranVersions}
          bibleVersions={bibleVersions}
          games={games}
        />
      )}
    </div>
  )
}

function AccessPanel({
  editor,
  quranVersions,
  bibleVersions,
  games,
}: {
  editor: EditorialEditor
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  games: EditorGame[]
}) {
  const [role, setRole] = useState<UserRole>(normalizeRole(editor.role))
  const [state, setState] = useState<GrantState>(() =>
    initialGrantState(editor)
  )
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (updater: (prev: GrantState) => GrantState) => {
    setState(updater)
    setDirty(true)
    setMessage(null)
    setError(null)
  }

  const changeRole = (next: UserRole) => {
    setRole(next)
    setDirty(true)
    setMessage(null)
    setError(null)
  }

  const save = () => {
    startTransition(async () => {
      const result = await saveAccessAction({
        userId: editor.user_id,
        // Omitted when unchanged so a grants-only edit does not touch the role.
        role: role === normalizeRole(editor.role) ? undefined : role,
        grants: grantStateToInput(state),
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDirty(false)
      setMessage('Access saved.')
    })
  }

  const isAdmin = role === 'admin'

  return (
    <div className="border-t border-border px-4 pt-1 pb-[18px]">
      <GrantSectionHeading>Role</GrantSectionHeading>
      <GrantRow label="Site role">
        <span className="inline-flex gap-1.5">
          {ROLE_OPTIONS.map(({ v, label }) => (
            <Chip
              key={v}
              active={role === v}
              disabled={pending}
              onClick={() => changeRole(v)}
            >
              {label}
            </Chip>
          ))}
        </span>
      </GrantRow>

      {isAdmin && (
        <p className="mt-3 text-[15px] leading-snug text-muted-foreground">
          Admins bypass every grant below; anything set here only takes effect
          if the admin role is removed.
        </p>
      )}

      <GrantSectionHeading hint="a per-game grant works on its own — the global tier is not required">
        Games
      </GrantSectionHeading>
      <GrantRow label="All games" labelWidth="w-[220px]">
        <TriState
          value={state.allGames}
          disabled={pending}
          onChange={(allGames) => patch((p) => ({ ...p, allGames }))}
        />
      </GrantRow>
      {games.map((game) => (
        <GrantRow
          key={game.key}
          label={game.name}
          labelWidth="w-[220px]"
          indent
        >
          <TriState
            value={state.games[game.key] ?? 'none'}
            disabled={pending}
            onChange={(access) =>
              patch((p) => ({
                ...p,
                games: { ...p.games, [game.key]: access },
              }))
            }
          />
        </GrantRow>
      ))}
      {games.length === 0 && (
        <p className="m-0 py-1.5 text-[14px] text-muted-foreground">
          No games are registered yet.
        </p>
      )}

      <GrantSectionHeading>Editorial</GrantSectionHeading>
      {CONTENT_MODULES.map(({ key, label }) => (
        <div key={key}>
          <GrantRow label={label} labelWidth="w-[220px]">
            <TriState
              value={state.modules[key]}
              disabled={pending}
              onChange={(v) =>
                patch((p) => ({ ...p, modules: { ...p.modules, [key]: v } }))
              }
            />
          </GrantRow>

          {/* Version rows refine their module grant, so they only make sense
              once the module itself is granted. */}
          {key === 'quran' && state.modules.quran !== 'none' && (
            <>
              {quranVersions.map((v) => {
                const grant = state.quran[v.id] ?? {
                  access: 'none' as GrantLevel,
                  approve: false,
                }
                return (
                  <GrantRow
                    key={v.id}
                    label={v.name}
                    labelWidth="w-[220px]"
                    indent
                  >
                    <TriState
                      value={grant.access}
                      disabled={pending}
                      onChange={(access) =>
                        patch((p) => ({
                          ...p,
                          quran: { ...p.quran, [v.id]: { ...grant, access } },
                        }))
                      }
                    />
                    <Chip
                      active={grant.approve}
                      disabled={pending}
                      onClick={() =>
                        patch((p) => ({
                          ...p,
                          quran: {
                            ...p.quran,
                            [v.id]: { ...grant, approve: !grant.approve },
                          },
                        }))
                      }
                    >
                      approver
                    </Chip>
                  </GrantRow>
                )
              })}
              <GrantRow
                label="Word-by-word reference"
                labelWidth="w-[220px]"
                indent
              >
                <NativeSelect
                  className="max-w-[280px]"
                  value={
                    state.reference === null ? '' : String(state.reference)
                  }
                  disabled={pending}
                  onChange={(raw) =>
                    patch((p) => ({
                      ...p,
                      reference: raw === '' ? null : Number(raw),
                    }))
                  }
                >
                  <option value="">Default</option>
                  {quranVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </NativeSelect>
              </GrantRow>
            </>
          )}

          {key === 'bible' &&
            state.modules.bible !== 'none' &&
            bibleVersions.map((v) => (
              <GrantRow key={v.id} label={v.name} labelWidth="w-[220px]" indent>
                <TriState
                  value={state.bible[v.id] ?? 'none'}
                  disabled={pending}
                  onChange={(access) =>
                    patch((p) => ({
                      ...p,
                      bible: { ...p.bible, [v.id]: access },
                    }))
                  }
                />
              </GrantRow>
            ))}
        </div>
      ))}

      <div className="mt-[18px] flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          disabled={pending || !dirty}
          onClick={save}
        >
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
        {message && (
          <span
            className={cn(
              'font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.12em]',
              STATUS_META.published.text
            )}
          >
            {message}
          </span>
        )}
        {error && (
          <span
            className={cn(
              'font-[family-name:var(--font-glacial)] text-[12px] uppercase tracking-[0.12em]',
              STATUS_META.changed.text
            )}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

/** The backend's role column is a plain string; fall back to the least privilege. */
function normalizeRole(role: string): UserRole {
  return role === 'admin' || role === 'editor' ? role : 'member'
}
