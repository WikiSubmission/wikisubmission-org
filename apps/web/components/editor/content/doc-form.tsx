'use client'

/**
 * Generic editing surface for one content document, driven by the module's
 * FieldDef schema (module-defs.ts). Handles draft saving, publish/unpublish,
 * delete and slug auto-generation. The backend re-validates everything; this
 * form only provides friendly ergonomics.
 *
 * Presentation is composed from shadcn primitives (Button, Input, Textarea,
 * Label, Badge) on semantic tokens; the editorial brand type (glacial labels,
 * Cormorant titles, Source Serif body) is preserved via font-family utilities.
 */
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type ReactNode } from 'react'

import {
  deleteContentDocAction,
  publishContentDocAction,
  saveContentDocAction,
  unpublishContentDocAction,
} from '@/app/(editor)/editor/content-actions'
import type { EditorialContentModule, EditorialContentStatus } from '@/lib/editorial-content-client'
import { cn } from '@/lib/utils'
import { sanitizeUrl } from '@/lib/safe-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_META } from './status'
import type { ContentModuleDef, FieldDef } from './module-defs'
import { PTEditor } from './pt-editor'
import { uploadEditorialImage } from './upload-image'

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

  const statusMeta = status ? STATUS_META[status] : null

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start gap-x-5 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {def.labelSingular}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[34px] leading-[1.05] text-foreground">
            {docId === null ? `New ${def.labelSingular.toLowerCase()}` : titleOf(def, fields)}
          </h1>
          {statusMeta && (
            <p className="mt-2 flex items-center gap-2 font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.12em]">
              <span className={statusMeta.text}>{statusMeta.label}</span>
              {dirty && (
                <span className={STATUS_META.changed.text}>· unsaved edits</span>
              )}
            </p>
          )}
        </div>
        {canWrite && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button type="button" disabled={pending || !dirty} onClick={save}>
              {pending ? 'Working…' : docId === null ? 'Create draft' : 'Save draft'}
            </Button>
            {docId !== null && status !== 'published' && (
              <Button
                type="button"
                variant="secondary"
                disabled={pending || dirty}
                title={dirty ? 'Save first' : undefined}
                onClick={() => publish('publish')}
              >
                Publish
              </Button>
            )}
            {docId !== null && status !== 'draft' && (
              <Button type="button" variant="outline" disabled={pending} onClick={() => publish('unpublish')}>
                Unpublish
              </Button>
            )}
            {docId !== null && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive hover:text-white"
                disabled={pending}
                onClick={destroy}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </header>

      {error && (
        <p role="alert" className="mb-4 text-[13px] text-destructive">
          {error}
        </p>
      )}
      {!canWrite && (
        <p className="mb-4 text-[14px] text-muted-foreground">
          Read only — you have not been granted write access to this module.
        </p>
      )}

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
  const rendered: ReactNode[] = []
  defs.forEach((fieldDef, i) => {
    if (fieldDef.kind === 'section') {
      visible = !fieldDef.when || fields[fieldDef.when.key] === fieldDef.when.equals
      if (visible) {
        rendered.push(
          <div
            key={`s${i}`}
            className="mt-8 mb-4 flex items-baseline gap-3 border-b border-border pb-2.5 first:mt-0"
          >
            <h3 className="font-[family-name:var(--font-cormorant)] text-[22px] leading-none text-foreground">
              {fieldDef.label}
            </h3>
            {fieldDef.desc && (
              <span className="ml-auto font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
                {fieldDef.desc}
              </span>
            )}
          </div>,
        )
      }
      return
    }
    if (!visible) return
    if (fieldDef.kind === 'row') {
      rendered.push(
        <div key={`r${i}`} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
  return <div className="flex flex-col gap-[18px]">{rendered}</div>
}

function keyOf(def: FieldDef): string {
  return 'key' in def ? def.key : Math.random().toString(36)
}

interface FieldShellProps {
  label: string
  optional: boolean
  desc?: string
  children: ReactNode
}

/** Brand field frame: glacial uppercase label, control, muted italic hint. */
function FieldShell({ label, optional, desc, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-baseline justify-between gap-2.5 font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.13em] text-muted-foreground">
        <span>{label}</span>
        {optional && (
          <span className="font-[family-name:var(--font-cormorant)] text-[13px] normal-case italic tracking-normal">
            optional
          </span>
        )}
      </Label>
      {children}
      {desc && (
        <p className="font-[family-name:var(--font-source-serif)] text-[13.5px] italic leading-snug text-muted-foreground">
          {desc}
        </p>
      )}
    </div>
  )
}

const CONTROL_FONT = 'font-[family-name:var(--font-source-serif)] text-[15px]'
const MONO_FONT = 'font-[family-name:var(--font-jetbrains)] text-[13px]'

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
  const optional = !('required' in def && def.required)
  const desc = 'desc' in def && def.desc ? def.desc : undefined

  switch (def.kind) {
    case 'text':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          {def.title ? (
            <Input
              className="h-auto rounded-none border-0 border-b border-border bg-transparent px-0 py-2 font-[family-name:var(--font-cormorant)] text-[26px] font-medium tracking-[-0.02em] shadow-none focus-visible:border-primary focus-visible:ring-0"
              value={typeof value === 'string' ? value : ''}
              disabled={disabled}
              onChange={(e) => set(def.key, e.target.value)}
            />
          ) : (
            <Input
              className={cn(def.mono ? MONO_FONT : CONTROL_FONT)}
              value={typeof value === 'string' ? value : ''}
              disabled={disabled}
              onChange={(e) => set(def.key, e.target.value)}
            />
          )}
        </FieldShell>
      )
    case 'slug':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <Input
            className={MONO_FONT}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => {
              onSlugTouched()
              set(def.key, slugify(e.target.value) || e.target.value.toLowerCase())
            }}
          />
        </FieldShell>
      )
    case 'textarea':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <Textarea
            className={cn('resize-none leading-relaxed', CONTROL_FONT)}
            rows={def.rows ?? 3}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => set(def.key, e.target.value)}
          />
        </FieldShell>
      )
    case 'select': {
      const opts = def.options ?? (def.optionsKey ? (options[def.optionsKey] ?? []) : [])
      const numeric = def.key.endsWith('_id')
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <NativeSelect
            value={value === null || value === undefined ? '' : String(value)}
            disabled={disabled}
            onChange={(raw) => set(def.key, raw === '' ? null : numeric ? Number(raw) : raw)}
          >
            <option value="">—</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </FieldShell>
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
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <div className="flex flex-wrap gap-1.5">
            {opts.length === 0 && (
              <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
                Nothing to pick yet.
              </span>
            )}
            {opts.map((o) => (
              <Chip
                key={o.value}
                active={selected.includes(o.value)}
                disabled={disabled}
                onClick={() => toggle(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </FieldShell>
      )
    }
    case 'number':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <Input
            className={MONO_FONT}
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
        </FieldShell>
      )
    case 'toggle':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={value === true} disabled={disabled} onClick={() => set(def.key, true)}>
              Yes
            </Chip>
            <Chip
              active={value === false || value === undefined || value === null}
              disabled={disabled}
              onClick={() => set(def.key, false)}
            >
              No
            </Chip>
          </div>
        </FieldShell>
      )
    case 'tags': {
      const text = Array.isArray(value) ? (value as unknown[]).join(', ') : ''
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <Input
            className={CONTROL_FONT}
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
        </FieldShell>
      )
    }
    case 'image':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <ImageField
            value={typeof value === 'string' ? value : ''}
            aspect={def.aspect}
            disabled={disabled}
            onChange={(url) => set(def.key, url)}
          />
        </FieldShell>
      )
    case 'pt':
      return (
        <FieldShell label={def.label} optional={optional} desc={desc}>
          <PTEditor
            initialValue={value}
            disabled={disabled}
            onChange={(blocks) => set(def.key, blocks)}
          />
        </FieldShell>
      )
    default:
      return null
  }
}

/**
 * Image field: uploads through the same authenticated ws-lib path as the body
 * image blocks (uploadEditorialImage -> /api/editorial/upload -> ws-backend
 * /editorial/uploads -> ws-lib), storing the returned CDN URL. A manual URL box
 * remains as a fallback; pasted URLs are scheme-checked before being stored.
 */
function ImageField({
  value,
  aspect,
  disabled,
  onChange,
}: {
  value: string
  aspect?: string
  disabled: boolean
  onChange: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      onChange(await uploadEditorialImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="flex items-center justify-center overflow-hidden rounded-[3px] border border-border bg-muted"
        style={{ aspectRatio: aspect ?? '16 / 9' }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
            No image
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive hover:text-white"
            disabled={disabled || uploading}
            onClick={() => onChange('')}
          >
            Remove
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
      </div>

      <Input
        className={MONO_FONT}
        placeholder="or paste a hosted image URL"
        value={value}
        disabled={disabled || uploading}
        onChange={(e) => {
          setError(null)
          onChange(e.target.value)
        }}
        onBlur={(e) => {
          const raw = e.target.value.trim()
          if (raw && !sanitizeUrl(raw)) {
            setError('That URL uses an unsupported or unsafe scheme.')
          }
        }}
      />
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  )
}

/** Toggle/filter chip built on Button, preserving the brand glacial micro-label. */
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

/** Native select styled to match the shadcn Input surface + brand type. */
function NativeSelect({
  value,
  disabled,
  onChange,
  children,
}: {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-[2px] border border-input bg-transparent px-3 py-1 shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        CONTROL_FONT,
      )}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  )
}
