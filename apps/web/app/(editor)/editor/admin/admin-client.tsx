'use client'

/**
 * Grant editor. One expandable panel per user: module access (none / read /
 * write), per-version Quran grants (with approve), per-version Bible grants
 * and the word-by-word reference preference. Saving replaces the user's
 * grants atomically on the backend.
 */
import { useState, useTransition } from 'react'

import type {
  EditorGrantsInput,
  EditorVersionGrant,
  EditorialEditor,
} from '@/lib/editorial-content-client'
import { replaceEditorGrantsAction } from './actions'

const MODULES = [
  { key: 'quran', label: 'Quran' },
  { key: 'bible', label: 'Bible' },
  { key: 'article', label: 'Articles' },
  { key: 'community', label: 'Communities' },
  { key: 'author', label: 'Authors' },
  { key: 'category', label: 'Categories' },
  { key: 'appendix', label: 'Appendices' },
]

interface VersionOption {
  id: number
  name: string
}

interface AdminGrantsClientProps {
  editors: EditorialEditor[]
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
}

export function AdminGrantsClient({ editors, quranVersions, bibleVersions }: AdminGrantsClientProps) {
  const [openUserId, setOpenUserId] = useState<number | null>(null)

  return (
    <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 'var(--ed-radius)', background: 'var(--ed-surface)' }}>
      {editors.map((editor) => (
        <EditorRow
          key={editor.user_id}
          editor={editor}
          quranVersions={quranVersions}
          bibleVersions={bibleVersions}
          open={openUserId === editor.user_id}
          onToggle={() =>
            setOpenUserId(openUserId === editor.user_id ? null : editor.user_id)
          }
        />
      ))}
      {editors.length === 0 && (
        <p style={{ padding: 16, margin: 0, color: 'var(--ed-fg-muted)' }}>No users found.</p>
      )}
    </div>
  )
}

function grantSummary(editor: EditorialEditor): string {
  if (editor.role === 'admin') return 'admin — full access'
  const modules = Object.entries(editor.modules)
  if (modules.length === 0) return 'no grants'
  return modules
    .map(([m, w]) => `${m}${w ? ' (write)' : ' (read)'}`)
    .join(', ')
}

function EditorRow({
  editor,
  quranVersions,
  bibleVersions,
  open,
  onToggle,
}: {
  editor: EditorialEditor
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--ed-rule)' }}>
      <button
        type="button"
        className="row"
        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0 }}
        onClick={onToggle}
      >
        <div className="row-top">
          <span className="row-title">{editor.display_name || editor.email}</span>
          {editor.role === 'admin' && <span className="badge admin">admin</span>}
          {!editor.is_active && <span className="badge">deactivated</span>}
        </div>
        <div className="row-meta">
          <span>{editor.email}</span>
          <span className="sep">·</span>
          <span>{grantSummary(editor)}</span>
        </div>
      </button>
      {open && (
        <GrantPanel editor={editor} quranVersions={quranVersions} bibleVersions={bibleVersions} />
      )}
    </div>
  )
}

type ModuleState = 'none' | 'read' | 'write'

interface GrantState {
  modules: Record<string, ModuleState>
  quran: Record<number, { access: ModuleState; approve: boolean }>
  bible: Record<number, ModuleState>
  reference: number | null
}

function initialState(editor: EditorialEditor): GrantState {
  const modules: Record<string, ModuleState> = {}
  for (const { key } of MODULES) {
    const grant = editor.modules[key]
    modules[key] = grant === undefined ? 'none' : grant ? 'write' : 'read'
  }
  const quran: GrantState['quran'] = {}
  for (const g of editor.quran_versions) {
    quran[g.version_id] = { access: g.can_write ? 'write' : 'read', approve: g.can_approve ?? false }
  }
  const bible: GrantState['bible'] = {}
  for (const g of editor.bible_versions) {
    bible[g.version_id] = g.can_write ? 'write' : 'read'
  }
  return {
    modules,
    quran,
    bible,
    reference: editor.quran_reference_version_id ?? null,
  }
}

function toInput(state: GrantState): EditorGrantsInput {
  const modules: Record<string, boolean> = {}
  for (const [key, access] of Object.entries(state.modules)) {
    if (access !== 'none') modules[key] = access === 'write'
  }
  const quran: EditorVersionGrant[] = Object.entries(state.quran)
    .filter(([, g]) => g.access !== 'none' || g.approve)
    .map(([id, g]) => ({
      version_id: Number(id),
      can_write: g.access === 'write',
      can_approve: g.approve,
    }))
  const bible: EditorVersionGrant[] = Object.entries(state.bible)
    .filter(([, access]) => access !== 'none')
    .map(([id, access]) => ({ version_id: Number(id), can_write: access === 'write' }))
  return {
    modules,
    quran_versions: quran,
    bible_versions: bible,
    quran_reference_version_id: state.reference,
  }
}

function GrantPanel({
  editor,
  quranVersions,
  bibleVersions,
}: {
  editor: EditorialEditor
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
}) {
  const [state, setState] = useState<GrantState>(() => initialState(editor))
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

  const save = () => {
    startTransition(async () => {
      const result = await replaceEditorGrantsAction(editor.user_id, toInput(state))
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDirty(false)
      setMessage('Grants saved.')
    })
  }

  const isAdmin = editor.role === 'admin'

  return (
    <div style={{ padding: '4px 16px 18px', borderTop: '1px solid var(--ed-rule)' }}>
      {isAdmin && (
        <p style={{ fontSize: 13, color: 'var(--ed-fg-muted)' }}>
          This user is an admin and bypasses grants; anything set here only
          applies if the admin role is ever removed.
        </p>
      )}

      <div className="block-head" style={{ marginTop: 12 }}>
        <h3>Modules</h3>
      </div>
      {MODULES.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
          <span style={{ width: 130, fontSize: 13.5 }}>{label}</span>
          <TriState
            value={state.modules[key]}
            disabled={pending}
            onChange={(v) => patch((p) => ({ ...p, modules: { ...p.modules, [key]: v } }))}
          />
        </div>
      ))}

      {state.modules.quran !== 'none' && quranVersions.length > 0 && (
        <>
          <div className="block-head" style={{ marginTop: 18 }}>
            <h3>Quran versions</h3>
            <span className="spacer" />
            <span className="hint">access refines the module grant · approve covers publish requests</span>
          </div>
          {quranVersions.map((v) => {
            const grant = state.quran[v.id] ?? { access: 'none' as ModuleState, approve: false }
            return (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ width: 220, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.name}
                </span>
                <TriState
                  value={grant.access}
                  disabled={pending}
                  onChange={(access) =>
                    patch((p) => ({ ...p, quran: { ...p.quran, [v.id]: { ...grant, access } } }))
                  }
                />
                <button
                  type="button"
                  className={`fchip${grant.approve ? ' is-on' : ''}`}
                  disabled={pending}
                  onClick={() =>
                    patch((p) => ({
                      ...p,
                      quran: { ...p.quran, [v.id]: { ...grant, approve: !grant.approve } },
                    }))
                  }
                >
                  approver
                </button>
              </div>
            )
          })}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0 0' }}>
            <span style={{ width: 220, fontSize: 13.5 }}>Word-by-word reference</span>
            <select
              className="selectbox"
              style={{ maxWidth: 280 }}
              value={state.reference === null ? '' : String(state.reference)}
              disabled={pending}
              onChange={(e) =>
                patch((p) => ({
                  ...p,
                  reference: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            >
              <option value="">Default</option>
              {quranVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {state.modules.bible !== 'none' && bibleVersions.length > 0 && (
        <>
          <div className="block-head" style={{ marginTop: 18 }}>
            <h3>Bible versions</h3>
          </div>
          {bibleVersions.map((v) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <span style={{ width: 220, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.name}
              </span>
              <TriState
                value={state.bible[v.id] ?? 'none'}
                disabled={pending}
                onChange={(access) => patch((p) => ({ ...p, bible: { ...p.bible, [v.id]: access } }))}
              />
            </div>
          ))}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <button type="button" className="btn primary sm" disabled={pending || !dirty} onClick={save}>
          {pending ? 'Saving…' : 'Save grants'}
        </button>
        {message && <span className="status-label pub">{message}</span>}
        {error && <span className="status-label changes">{error}</span>}
      </div>
    </div>
  )
}

function TriState({
  value,
  disabled,
  onChange,
}: {
  value: ModuleState
  disabled: boolean
  onChange: (v: ModuleState) => void
}) {
  const options: Array<{ v: ModuleState; label: string }> = [
    { v: 'none', label: 'None' },
    { v: 'read', label: 'Read' },
    { v: 'write', label: 'Write' },
  ]
  return (
    <span className="filterbar">
      {options.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          className={`fchip${value === v ? ' is-on' : ''}`}
          disabled={disabled}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </span>
  )
}
