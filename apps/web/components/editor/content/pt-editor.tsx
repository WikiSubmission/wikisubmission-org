'use client'

/**
 * Article body editor — a Portable Text WYSIWYG built on Sanity's standalone
 * @portabletext/editor. It reads and writes the SAME Portable Text stored by
 * the previous form editor (see pt-schema.ts for the byte-compatibility
 * contract) so no content migration is needed and the public
 * @portabletext/react renderer is unchanged.
 *
 * Custom block objects: `callout` (tone + text) and `image` (url/alt/caption,
 * with upload). Documents containing block types the schema cannot represent
 * are opened read-only so nothing is ever dropped on save.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { defineSchema, EditorProvider, PortableTextEditable, useEditor } from '@portabletext/editor'
import type {
  BlockAnnotationRenderProps,
  BlockRenderProps,
  PortableTextBlock,
} from '@portabletext/editor'
import { EventListenerPlugin } from '@portabletext/editor/plugins'

import {
  SCHEMA_DEFINITION,
  STYLE_OPTIONS,
  TONE_OPTIONS,
  hasUnsupportedBlocks,
  toInitialValue,
} from './pt-schema'
import { sanitizeUrl } from '@/lib/safe-url'
import { uploadEditorialImage } from './upload-image'

const schemaDefinition = defineSchema(
  SCHEMA_DEFINITION as unknown as Parameters<typeof defineSchema>[0],
)

type BlockPath = BlockRenderProps['path']

interface BlockObjectValue {
  _key: string
  _type: string
  tone?: string
  text?: string
  url?: string
  alt?: string
  caption?: string
}

interface PTEditorProps {
  initialValue: unknown
  onChange: (blocks: unknown[]) => void
  disabled?: boolean
}

export function PTEditor({ initialValue, onChange, disabled }: PTEditorProps) {
  // Slate needs the DOM; render only after mount to avoid SSR/hydration issues.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const initial = useMemo(() => toInitialValue(initialValue), [initialValue])
  const unsupported = useMemo(() => hasUnsupportedBlocks(initialValue), [initialValue])

  // Ignore no-op normalization mutations on mount: only surface real changes.
  const lastSerialized = useRef(JSON.stringify(initial ?? []))
  const handleMutation = useCallback(
    (value: unknown[] | undefined) => {
      const next = value ?? []
      const serialized = JSON.stringify(next)
      if (serialized === lastSerialized.current) return
      lastSerialized.current = serialized
      onChange(next)
    },
    [onChange],
  )

  if (!mounted) {
    return <div className="pt-editor pt-editor-loading">Loading editor…</div>
  }

  if (unsupported) {
    return (
      <div className="pt-editor pt-unsupported">
        This document contains content types the visual editor cannot represent
        (for example legacy tables or embeds). Editing the body here is disabled
        so nothing is lost. The content is preserved exactly as stored.
      </div>
    )
  }

  return (
    <div className={`pt-editor${disabled ? ' is-disabled' : ''}`}>
      <EditorProvider
        initialConfig={{ schemaDefinition, initialValue: initial as PortableTextBlock[] | undefined }}
      >
        <EventListenerPlugin
          on={(event) => {
            if (event.type === 'mutation') handleMutation(event.value)
          }}
        />
        {!disabled && <Toolbar />}
        <PortableTextEditable
          className="pt-content"
          readOnly={disabled}
          renderStyle={(props) => renderStyle(props)}
          renderDecorator={(props) => renderDecorator(props)}
          renderAnnotation={(props) => renderAnnotation(props)}
          renderListItem={(props) => <>{props.children}</>}
          renderBlock={(props) => renderBlock(props)}
        />
      </EditorProvider>
    </div>
  )
}

// ── render functions ─────────────────────────────────────────────────────────

function renderStyle(props: { schemaType: { value?: string }; children: React.ReactNode }) {
  switch (props.schemaType.value) {
    case 'h2':
      return <h2 className="pt-h2">{props.children}</h2>
    case 'h3':
      return <h3 className="pt-h3">{props.children}</h3>
    case 'h4':
      return <h4 className="pt-h4">{props.children}</h4>
    case 'blockquote':
      return <blockquote className="pt-quote">{props.children}</blockquote>
    default:
      return <>{props.children}</>
  }
}

function renderDecorator(props: { value: string; children: React.ReactNode }) {
  switch (props.value) {
    case 'strong':
      return <strong>{props.children}</strong>
    case 'em':
      return <em>{props.children}</em>
    case 'underline':
      return <u>{props.children}</u>
    case 'strike-through':
      return <s>{props.children}</s>
    case 'code':
      return <code className="pt-code">{props.children}</code>
    default:
      return <>{props.children}</>
  }
}

function renderAnnotation(props: BlockAnnotationRenderProps) {
  if (props.schemaType.name === 'link') {
    const href = (props.value as { href?: string })?.href
    return (
      <span className="pt-link" title={href}>
        {props.children}
      </span>
    )
  }
  return <>{props.children}</>
}

function renderBlock(props: BlockRenderProps) {
  const value = props.value as BlockObjectValue
  if (props.schemaType.name === 'callout') {
    return <CalloutCard value={value} path={props.path} />
  }
  if (props.schemaType.name === 'image') {
    return <ImageCard value={value} path={props.path} />
  }
  const meta = props.value as { listItem?: string; level?: number }
  return (
    <div className="pt-line" data-list={meta.listItem} data-level={meta.level}>
      {props.children}
    </div>
  )
}

// ── toolbar ──────────────────────────────────────────────────────────────────

function Toolbar() {
  const editor = useEditor()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const toggleDecorator = (decorator: string) =>
    editor.send({ type: 'decorator.toggle', decorator })
  const toggleStyle = (style: string) => editor.send({ type: 'style.toggle', style })
  const toggleList = (listItem: string) => editor.send({ type: 'list item.toggle', listItem })

  const addLink = () => {
    const raw = window.prompt('Link URL')?.trim()
    if (!raw) return
    // Reject javascript:/data:/etc. at entry so an unsafe href is never stored
    // (the public renderer re-checks — see blog-post-article.tsx).
    const href = sanitizeUrl(raw)
    if (!href) {
      window.alert('That link uses an unsupported or unsafe URL scheme. Use http(s), mailto, tel, or a relative path.')
      return
    }
    editor.send({ type: 'annotation.add', annotation: { name: 'link', value: { href, blank: false } } })
  }
  const removeLink = () => editor.send({ type: 'annotation.remove', annotation: { name: 'link' } })

  const insertCallout = () =>
    editor.send({
      type: 'insert.block object',
      placement: 'auto',
      blockObject: { name: 'callout', value: { tone: 'info', text: '' } },
    })

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadEditorialImage(file)
      editor.send({
        type: 'insert.block object',
        placement: 'auto',
        blockObject: { name: 'image', value: { url, alt: '', caption: '' } },
      })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pt-toolbar">
      <button type="button" className="pt-tb" title="Bold" onClick={() => toggleDecorator('strong')}>
        <b>B</b>
      </button>
      <button type="button" className="pt-tb" title="Italic" onClick={() => toggleDecorator('em')}>
        <i>I</i>
      </button>
      <button type="button" className="pt-tb" title="Underline" onClick={() => toggleDecorator('underline')}>
        <u>U</u>
      </button>
      <button type="button" className="pt-tb" title="Strikethrough" onClick={() => toggleDecorator('strike-through')}>
        <s>S</s>
      </button>
      <button type="button" className="pt-tb" title="Code" onClick={() => toggleDecorator('code')}>
        {'</>'}
      </button>
      <span className="pt-tb-sep" />
      {STYLE_OPTIONS.map((s) => (
        <button key={s.value} type="button" className="pt-tb" title={s.label} onClick={() => toggleStyle(s.value)}>
          {s.value === 'normal' ? 'P' : s.value === 'blockquote' ? '❝' : s.value.toUpperCase()}
        </button>
      ))}
      <span className="pt-tb-sep" />
      <button type="button" className="pt-tb" title="Bulleted list" onClick={() => toggleList('bullet')}>
        •
      </button>
      <button type="button" className="pt-tb" title="Numbered list" onClick={() => toggleList('number')}>
        1.
      </button>
      <span className="pt-tb-sep" />
      <button type="button" className="pt-tb" title="Add link" onClick={addLink}>
        🔗
      </button>
      <button type="button" className="pt-tb" title="Remove link" onClick={removeLink}>
        ⛓️‍💥
      </button>
      <span className="pt-tb-sep" />
      <button type="button" className="pt-tb pt-tb-wide" onClick={insertCallout}>
        + Callout
      </button>
      <button type="button" className="pt-tb pt-tb-wide" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? 'Uploading…' : '+ Image'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
    </div>
  )
}

// ── custom block cards ───────────────────────────────────────────────────────

function CalloutCard({ value, path }: { value: BlockObjectValue; path: BlockPath }) {
  const editor = useEditor()
  const set = (props: Record<string, unknown>) => editor.send({ type: 'block.set', at: path, props })
  const remove = () => editor.send({ type: 'delete.block', at: path })

  return (
    <div className={`pt-card pt-callout tone-${value.tone ?? 'info'}`} contentEditable={false}>
      <div className="pt-card-bar">
        <span className="pt-card-kind">Callout</span>
        <select
          className="pt-style"
          value={value.tone ?? 'info'}
          onChange={(e) => set({ tone: e.target.value })}
        >
          {TONE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="pt-spacer" />
        <button type="button" className="iconbtn" title="Remove" onClick={remove}>
          ✕
        </button>
      </div>
      <textarea
        className="textarea pt-card-text"
        rows={2}
        value={value.text ?? ''}
        placeholder="Callout text…"
        onChange={(e) => set({ text: e.target.value })}
      />
    </div>
  )
}

function ImageCard({ value, path }: { value: BlockObjectValue; path: BlockPath }) {
  const editor = useEditor()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const set = (props: Record<string, unknown>) => editor.send({ type: 'block.set', at: path, props })
  const remove = () => editor.send({ type: 'delete.block', at: path })

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      set({ url: await uploadEditorialImage(file) })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pt-card pt-image" contentEditable={false}>
      <div className="pt-card-bar">
        <span className="pt-card-kind">Image</span>
        <span className="pt-spacer" />
        <button type="button" className="iconbtn" title="Remove" onClick={remove}>
          ✕
        </button>
      </div>
      {value.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pt-image-preview" src={value.url} alt={value.alt ?? ''} />
      ) : (
        <div className="pt-image-empty">No image yet</div>
      )}
      <div className="pt-image-fields">
        <button type="button" className="btn sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? 'Uploading…' : value.url ? 'Replace image' : 'Upload image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
        <input
          className="input mono"
          placeholder="or paste image URL"
          value={value.url ?? ''}
          onChange={(e) => set({ url: e.target.value })}
        />
        <div className="field-row">
          <input
            className="input"
            placeholder="Alt text"
            value={value.alt ?? ''}
            onChange={(e) => set({ alt: e.target.value })}
          />
          <input
            className="input"
            placeholder="Caption"
            value={value.caption ?? ''}
            onChange={(e) => set({ caption: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
