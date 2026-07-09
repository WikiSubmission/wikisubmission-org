'use client'

/**
 * Generic editing surface for one content document, driven by the module's
 * FieldDef schema (module-defs.ts). Handles draft saving, publish/unpublish,
 * delete and slug auto-generation. The backend re-validates everything; this
 * form only provides friendly ergonomics.
 */
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  deleteContentDocAction,
  publishContentDocAction,
  saveContentDocAction,
  unpublishContentDocAction,
} from '@/app/(editor)/editor/content-actions'
import type { EditorialContentModule, EditorialContentStatus } from '@/lib/editorial-content-client'
import type { ContentModuleDef, FieldDef } from './module-defs'
import { PTEditor } from './pt-editor'

type Fields = Record<string, unknown>

interface DocFormProps {
  module: EditorialContentModule
  def: ContentModuleDef
  docId: number | null
  initialFields: Fields
  initialStatus: EditorialContentStatus | null
  translationGroup?: string | null
  canWrite: boolean
  options: Record<string, Array<{ value: string; label: string }>>
}

function slugify(source: string): string {
  return source
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

const STATUS_LABEL: Record<EditorialContentStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'draft' },
  changed: { label: 'Unpublished changes', cls: 'changes' },
  published: { label: 'Published', cls: 'pub' },
}

export function DocForm({
  module,
  def,
  docId: initialDocId,
  initialFields,
  initialStatus,
  translationGroup,
  canWrite,
  options,
}: DocFormProps) {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>(initialFields)
  const [docId, setDocId] = useState<number | null>(initialDocId)
  const [status, setStatus] = useState<EditorialContentStatus | null>(initialStatus)
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(initialDocId !== null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const disabled = !canWrite || pending

  const set = (key: string, value: unknown) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-derive the slug from its source fields until it is hand-edited.
      if (!slugTouched) {
        const slugDef = flatFields(def.fields).find((f) => f.kind === 'slug')
        if (slugDef && slugDef.kind === 'slug' && key !== slugDef.key) {
          const source = slugDef.from
            .split(' ')
            .map((k) => (typeof next[k] === 'string' ? (next[k] as string) : ''))
            .join(' ')
          if (source.trim()) next[slugDef.key] = slugify(source)
        }
      }
      return next
    })
    setDirty(true)
    setError(null)
  }

  const save = () => {
    startTransition(async () => {
      const result = await saveContentDocAction(module, docId, fields, translationGroup)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDirty(false)
      setStatus(result.data.status)
      setFields(result.data.fields as Fields)
      if (docId === null) {
        setDocId(result.data.id)
        router.replace(`/editor/${module}/${result.data.id}`)
      }
    })
  }

  const publish = (direction: 'publish' | 'unpublish') => {
    if (docId === null) return
    startTransition(async () => {
      const action = direction === 'publish' ? publishContentDocAction : unpublishContentDocAction
      const result = await action(module, docId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setStatus(result.data.status)
    })
  }

  const destroy = () => {
    if (docId === null) return
    if (!window.confirm(`Delete this ${def.labelSingular.toLowerCase()}? This also removes the published version.`)) {
      return
    }
    startTransition(async () => {
      const result = await deleteContentDocAction(module, docId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push(`/editor/${module}`)
    })
  }

  const statusInfo = status ? STATUS_LABEL[status] : null

  return (
    <div>
      <div className="dh">
        <div className="dh-main">
          <p className="dh-eyebrow">{def.labelSingular}</p>
          <h1>{docId === null ? `New ${def.labelSingular.toLowerCase()}` : titleOf(def, fields)}</h1>
          {statusInfo && (
            <p className="dh-sub">
              <span className={`status-label ${statusInfo.cls}`}>{statusInfo.label}</span>
              {dirty && <span className="status-label changes"> · unsaved edits</span>}
            </p>
          )}
        </div>
        <div className="dh-actions">
          {canWrite && (
            <>
              <button type="button" className="btn primary" disabled={pending || !dirty} onClick={save}>
                {pending ? 'Working…' : docId === null ? 'Create draft' : 'Save draft'}
              </button>
              {docId !== null && status !== 'published' && (
                <button type="button" className="btn accent" disabled={pending || dirty} title={dirty ? 'Save first' : undefined} onClick={() => publish('publish')}>
                  Publish
                </button>
              )}
              {docId !== null && status !== 'draft' && (
                <button type="button" className="btn" disabled={pending} onClick={() => publish('unpublish')}>
                  Unpublish
                </button>
              )}
              {docId !== null && (
                <button type="button" className="btn danger" disabled={pending} onClick={destroy}>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && <p className="field"><span className="err">{error}</span></p>}
      {!canWrite && <p className="dh-sub">Read only — you have not been granted write access to this module.</p>}

      <FieldList
        defs={def.fields}
        fields={fields}
        set={set}
        disabled={disabled}
        options={options}
        onSlugTouched={() => setSlugTouched(true)}
      />
    </div>
  )
}

function titleOf(def: ContentModuleDef, fields: Fields): string {
  const title = def.titleKeys
    .map((k) => (typeof fields[k] === 'string' ? (fields[k] as string) : ''))
    .filter(Boolean)
    .join(' ')
    .trim()
  return title || 'Untitled'
}

function flatFields(defs: FieldDef[]): FieldDef[] {
  return defs.flatMap((d) => (d.kind === 'row' ? d.fields : [d]))
}

interface FieldListProps {
  defs: FieldDef[]
  fields: Fields
  set: (key: string, value: unknown) => void
  disabled: boolean
  options: Record<string, Array<{ value: string; label: string }>>
  onSlugTouched: () => void
}

function FieldList({ defs, fields, set, disabled, options, onSlugTouched }: FieldListProps) {
  // Sections gate the fields that follow them until the next section.
  let visible = true
  const rendered: React.ReactNode[] = []
  defs.forEach((fieldDef, i) => {
    if (fieldDef.kind === 'section') {
      visible = !fieldDef.when || fields[fieldDef.when.key] === fieldDef.when.equals
      if (visible) {
        rendered.push(
          <div className="block-head" key={`s${i}`}>
            <h3>{fieldDef.label}</h3>
            <span className="spacer" />
            {fieldDef.desc && <span className="hint">{fieldDef.desc}</span>}
          </div>,
        )
      }
      return
    }
    if (!visible) return
    if (fieldDef.kind === 'row') {
      rendered.push(
        <div className="field-row" key={`r${i}`}>
          {fieldDef.fields.map((sub) => (
            <Field key={keyOf(sub)} def={sub} fields={fields} set={set} disabled={disabled} options={options} onSlugTouched={onSlugTouched} />
          ))}
        </div>,
      )
      return
    }
    rendered.push(
      <Field key={keyOf(fieldDef)} def={fieldDef} fields={fields} set={set} disabled={disabled} options={options} onSlugTouched={onSlugTouched} />,
    )
  })
  return <>{rendered}</>
}

function keyOf(def: FieldDef): string {
  return 'key' in def ? def.key : Math.random().toString(36)
}

interface FieldProps {
  def: FieldDef
  fields: Fields
  set: (key: string, value: unknown) => void
  disabled: boolean
  options: Record<string, Array<{ value: string; label: string }>>
  onSlugTouched: () => void
}

function Field({ def, fields, set, disabled, options, onSlugTouched }: FieldProps) {
  if (def.kind === 'row' || def.kind === 'section') return null
  const value = fields[def.key]

  const label = (
    <label>
      {def.label}
      {'required' in def && def.required ? '' : <span className="opt"> — optional</span>}
    </label>
  )
  const desc = 'desc' in def && def.desc ? <p className="desc">{def.desc}</p> : null

  switch (def.kind) {
    case 'text':
      return (
        <div className="field">
          {label}
          <input
            className={`input${def.mono ? ' mono' : ''}${def.title ? ' title-input' : ''}`}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => set(def.key, e.target.value)}
          />
          {desc}
        </div>
      )
    case 'slug':
      return (
        <div className="field">
          {label}
          <input
            className="input mono"
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => {
              onSlugTouched()
              set(def.key, slugify(e.target.value) || e.target.value.toLowerCase())
            }}
          />
          {desc}
        </div>
      )
    case 'textarea':
      return (
        <div className="field">
          {label}
          <textarea
            className="textarea"
            rows={def.rows ?? 3}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => set(def.key, e.target.value)}
          />
          {desc}
        </div>
      )
    case 'select': {
      const opts = def.options ?? (def.optionsKey ? (options[def.optionsKey] ?? []) : [])
      const numeric = def.key.endsWith('_id')
      return (
        <div className="field">
          {label}
          <select
            className="selectbox"
            value={value === null || value === undefined ? '' : String(value)}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value
              set(def.key, raw === '' ? null : numeric ? Number(raw) : raw)
            }}
          >
            <option value="">—</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {desc}
        </div>
      )
    }
    case 'multiselect': {
      const opts = options[def.optionsKey] ?? []
      const selected = Array.isArray(value) ? (value as unknown[]).map(String) : []
      const toggle = (v: string) => {
        const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]
        set(
          def.key,
          next.map((x) => (Number.isInteger(Number(x)) ? Number(x) : x)),
        )
      }
      return (
        <div className="field">
          {label}
          <div className="filterbar">
            {opts.length === 0 && <span className="hint">Nothing to pick yet.</span>}
            {opts.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`fchip${selected.includes(o.value) ? ' is-on' : ''}`}
                disabled={disabled}
                onClick={() => toggle(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          {desc}
        </div>
      )
    }
    case 'number':
      return (
        <div className="field">
          {label}
          <input
            className="input mono"
            inputMode="numeric"
            value={value === null || value === undefined ? '' : String(value)}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value.trim()
              if (raw === '') {
                set(def.key, null)
                return
              }
              const n = Number(raw)
              if (Number.isInteger(n)) set(def.key, n)
            }}
          />
          {desc}
        </div>
      )
    case 'toggle':
      return (
        <div className="field">
          {label}
          <div className="filterbar">
            <button
              type="button"
              className={`fchip${value === true ? ' is-on' : ''}`}
              disabled={disabled}
              onClick={() => set(def.key, true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`fchip${value === false || value === undefined || value === null ? ' is-on' : ''}`}
              disabled={disabled}
              onClick={() => set(def.key, false)}
            >
              No
            </button>
          </div>
          {desc}
        </div>
      )
    case 'tags': {
      const text = Array.isArray(value) ? (value as unknown[]).join(', ') : ''
      return (
        <div className="field">
          {label}
          <input
            className="input"
            defaultValue={text}
            disabled={disabled}
            onBlur={(e) => {
              const tags = e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
              set(def.key, tags)
            }}
          />
          {desc}
        </div>
      )
    }
    case 'pt':
      return (
        <div className="field">
          {label}
          {desc}
          <PTEditor
            initialValue={value}
            disabled={disabled}
            onChange={(blocks) => set(def.key, blocks)}
          />
        </div>
      )
    default:
      return null
  }
}
