'use client'

/**
 * Grant editor. One expandable panel per user: module access (none / read /
 * write), per-version Quran grants (with approve), per-version Bible grants
 * and the word-by-word reference preference. Saving replaces the user's
 * grants atomically on the backend.
 *
 * Built on shadcn primitives (Button, Badge) over semantic tokens; the brand
 * type is preserved via font-family utilities. This is an admin-only surface —
 * the backend re-checks the admin role on every save (see actions.ts).
 */
import { useState, useTransition, type ReactNode } from 'react'

import type {
  EditorGrantsInput,
  EditorVersionGrant,
  EditorialEditor,
} from '@/lib/editorial-content-client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STATUS_META } from '@/components/editor/content/status'
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
    <div className="overflow-hidden rounded-[3px] border border-border bg-card">
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
        <p className="m-0 p-4 text-[14px] text-muted-foreground">No users found.</p>
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
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-source-serif)] text-[15px] font-medium text-foreground">
            {editor.display_name || editor.email}
          </span>
          {editor.role === 'admin' && (
            <Badge className="font-[family-name:var(--font-glacial)] text-[9.5px] uppercase tracking-[0.1em]">
              admin
            </Badge>
          )}
          {!editor.is_active && (
            <Badge
              variant="outline"
              className="font-[family-name:var(--font-glacial)] text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground"
            >
              deactivated
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
          <span>{editor.email}</span>
          <span className="opacity-45">·</span>
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

function GrantSectionHeading({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mt-[18px] mb-3 flex items-baseline gap-3 border-b border-border pb-2">
      <h3 className="font-[family-name:var(--font-cormorant)] text-[20px] leading-none text-foreground">
        {children}
      </h3>
      {hint && (
        <span className="ml-auto font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
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
    <div className="border-t border-border px-4 pt-1 pb-[18px]">
      {isAdmin && (
        <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
          This user is an admin and bypasses grants; anything set here only
          applies if the admin role is ever removed.
        </p>
      )}

      <GrantSectionHeading>Modules</GrantSectionHeading>
      {MODULES.map(({ key, label }) => (
        <GrantRow key={key} label={label}>
          <TriState
            value={state.modules[key]}
            disabled={pending}
            onChange={(v) => patch((p) => ({ ...p, modules: { ...p.modules, [key]: v } }))}
          />
        </GrantRow>
      ))}

      {state.modules.quran !== 'none' && quranVersions.length > 0 && (
        <>
          <GrantSectionHeading hint="access refines the module grant · approve covers publish requests">
            Quran versions
          </GrantSectionHeading>
          {quranVersions.map((v) => {
            const grant = state.quran[v.id] ?? { access: 'none' as ModuleState, approve: false }
            return (
              <GrantRow key={v.id} label={v.name} labelWidth="w-[220px]">
                <TriState
                  value={grant.access}
                  disabled={pending}
                  onChange={(access) =>
                    patch((p) => ({ ...p, quran: { ...p.quran, [v.id]: { ...grant, access } } }))
                  }
                />
                <Chip
                  active={grant.approve}
                  disabled={pending}
                  onClick={() =>
                    patch((p) => ({
                      ...p,
                      quran: { ...p.quran, [v.id]: { ...grant, approve: !grant.approve } },
                    }))
                  }
                >
                  approver
                </Chip>
              </GrantRow>
            )
          })}

          <GrantRow label="Word-by-word reference" labelWidth="w-[220px]">
            <NativeSelect
              className="max-w-[280px]"
              value={state.reference === null ? '' : String(state.reference)}
              disabled={pending}
              onChange={(raw) =>
                patch((p) => ({ ...p, reference: raw === '' ? null : Number(raw) }))
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

      {state.modules.bible !== 'none' && bibleVersions.length > 0 && (
        <>
          <GrantSectionHeading>Bible versions</GrantSectionHeading>
          {bibleVersions.map((v) => (
            <GrantRow key={v.id} label={v.name} labelWidth="w-[220px]">
              <TriState
                value={state.bible[v.id] ?? 'none'}
                disabled={pending}
                onChange={(access) => patch((p) => ({ ...p, bible: { ...p.bible, [v.id]: access } }))}
              />
            </GrantRow>
          ))}
        </>
      )}

      <div className="mt-[18px] flex items-center gap-3">
        <Button type="button" size="sm" disabled={pending || !dirty} onClick={save}>
          {pending ? 'Saving…' : 'Save grants'}
        </Button>
        {message && (
          <span
            className={cn(
              'font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.12em]',
              STATUS_META.published.text,
            )}
          >
            {message}
          </span>
        )}
        {error && (
          <span
            className={cn(
              'font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.12em]',
              STATUS_META.changed.text,
            )}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

function GrantRow({
  label,
  labelWidth = 'w-[130px]',
  children,
}: {
  label: string
  labelWidth?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={cn('shrink-0 truncate text-[13.5px] text-foreground', labelWidth)}>{label}</span>
      {children}
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
    <span className="inline-flex gap-1.5">
      {options.map(({ v, label }) => (
        <Chip key={v} active={value === v} disabled={disabled} onClick={() => onChange(v)}>
          {label}
        </Chip>
      ))}
    </span>
  )
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      className="h-8 font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.1em]"
    >
      {children}
    </Button>
  )
}

function NativeSelect({
  value,
  disabled,
  onChange,
  className,
  children,
}: {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  className?: string
  children: ReactNode
}) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-[2px] border border-input bg-transparent px-3 py-1 font-[family-name:var(--font-source-serif)] text-[14px] shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  )
}
