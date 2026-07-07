'use client'

/**
 * Pragmatic Portable Text block editor. Text blocks are edited as plain
 * textareas with markdown-ish inline marks (see pt-text.ts); callout and image
 * blocks get dedicated small forms; anything else (tables, embeds) is shown as
 * a preserved card and passed through byte-identical, so no content is ever
 * lost by opening and saving a document.
 */
import { useMemo, useState } from 'react'

import {
  makeTextBlock,
  randomKey,
  serializeBlockText,
  type PTBlock,
} from './pt-text'

type RawBlock = Record<string, unknown> & { _type?: string; _key?: string }

interface TextItem {
  id: string
  kind: 'text'
  text: string
  style: string // normal | h2 | h3 | h4 | blockquote | bullet | number
}
interface CalloutItem {
  id: string
  kind: 'callout'
  tone: string
  text: string
  raw: RawBlock
}
interface ImageItem {
  id: string
  kind: 'image'
  url: string
  alt: string
  caption: string
  raw: RawBlock
}
interface OpaqueItem {
  id: string
  kind: 'opaque'
  raw: RawBlock
}
type Item = TextItem | CalloutItem | ImageItem | OpaqueItem

const STYLE_OPTIONS = [
  { value: 'normal', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'blockquote', label: 'Quote' },
  { value: 'bullet', label: 'Bullet item' },
  { value: 'number', label: 'Numbered item' },
]

const TONE_OPTIONS = ['info', 'warning', 'tip', 'danger']

function toItems(blocks: unknown): Item[] {
  if (!Array.isArray(blocks)) return []
  return blocks.map((raw: RawBlock) => {
    const id = typeof raw._key === 'string' && raw._key ? raw._key : randomKey()
    if (raw._type === 'block' && Array.isArray(raw.children)) {
      const block = raw as unknown as PTBlock
      const style = block.listItem
        ? block.listItem === 'number'
          ? 'number'
          : 'bullet'
        : (block.style ?? 'normal')
      return { id, kind: 'text', text: serializeBlockText(block), style } satisfies TextItem
    }
    if (raw._type === 'callout') {
      return {
        id,
        kind: 'callout',
        tone: typeof raw.tone === 'string' ? raw.tone : 'info',
        text: typeof raw.text === 'string' ? raw.text : '',
        raw,
      } satisfies CalloutItem
    }
    if (raw._type === 'image') {
      return {
        id,
        kind: 'image',
        url: typeof raw.url === 'string' ? raw.url : '',
        alt: typeof raw.alt === 'string' ? raw.alt : '',
        caption: typeof raw.caption === 'string' ? raw.caption : '',
        raw,
      } satisfies ImageItem
    }
    return { id, kind: 'opaque', raw } satisfies OpaqueItem
  })
}

function toBlocks(items: Item[]): RawBlock[] {
  return items.map((item) => {
    switch (item.kind) {
      case 'text': {
        const isList = item.style === 'bullet' || item.style === 'number'
        return makeTextBlock(item.text, {
          key: item.id,
          style: isList ? 'normal' : item.style,
          listItem: isList ? item.style : undefined,
        }) as unknown as RawBlock
      }
      case 'callout':
        return { ...item.raw, _type: 'callout', _key: item.id, tone: item.tone, text: item.text }
      case 'image':
        return {
          ...item.raw,
          _type: 'image',
          _key: item.id,
          url: item.url,
          alt: item.alt,
          caption: item.caption,
        }
      case 'opaque':
        return item.raw
    }
  })
}

export function PTEditor({
  initialValue,
  onChange,
  disabled,
}: {
  initialValue: unknown
  onChange: (blocks: unknown[]) => void
  disabled?: boolean
}) {
  const initial = useMemo(() => toItems(initialValue), [initialValue])
  const [items, setItems] = useState<Item[]>(initial)

  // Only ever called from event handlers, so this always sees the latest
  // onChange prop.
  const apply = (next: Item[]) => {
    setItems(next)
    onChange(toBlocks(next))
  }

  const update = (id: string, patch: Partial<Item>) => {
    apply(items.map((it) => (it.id === id ? ({ ...it, ...patch } as Item) : it)))
  }
  const remove = (id: string) => apply(items.filter((it) => it.id !== id))
  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((it) => it.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    apply(next)
  }
  const insert = (kind: 'text' | 'callout' | 'image') => {
    const id = randomKey()
    const item: Item =
      kind === 'text'
        ? { id, kind, text: '', style: 'normal' }
        : kind === 'callout'
          ? { id, kind, tone: 'info', text: '', raw: {} }
          : { id, kind, url: '', alt: '', caption: '', raw: {} }
    apply([...items, item])
  }

  return (
    <div className="pt-editor">
      {items.length === 0 && (
        <p className="pt-empty">No content yet. Add a paragraph below.</p>
      )}
      {items.map((item, index) => (
        <div className="pt-block" key={item.id}>
          <div className="pt-block-bar">
            {item.kind === 'text' ? (
              <select
                className="pt-style"
                value={item.style}
                disabled={disabled}
                onChange={(e) => update(item.id, { style: e.target.value })}
              >
                {STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="pt-kind">{item.kind}</span>
            )}
            <span className="pt-spacer" />
            {!disabled && (
              <>
                <button type="button" className="iconbtn" title="Move up" disabled={index === 0} onClick={() => move(item.id, -1)}>
                  ↑
                </button>
                <button type="button" className="iconbtn" title="Move down" disabled={index === items.length - 1} onClick={() => move(item.id, 1)}>
                  ↓
                </button>
                <button type="button" className="iconbtn" title="Remove block" onClick={() => remove(item.id)}>
                  ✕
                </button>
              </>
            )}
          </div>

          {item.kind === 'text' && (
            <textarea
              className="textarea pt-text"
              rows={Math.max(2, item.text.split('\n').length + 1)}
              value={item.text}
              disabled={disabled}
              placeholder="Write… (**bold**, *italic*, [link](https://…))"
              onChange={(e) => update(item.id, { text: e.target.value })}
            />
          )}

          {item.kind === 'callout' && (
            <div className="pt-callout">
              <select
                className="pt-style"
                value={item.tone}
                disabled={disabled}
                onChange={(e) => update(item.id, { tone: e.target.value })}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <textarea
                className="textarea pt-text"
                rows={2}
                value={item.text}
                disabled={disabled}
                onChange={(e) => update(item.id, { text: e.target.value })}
              />
            </div>
          )}

          {item.kind === 'image' && (
            <div className="pt-image">
              <input
                className="input mono"
                placeholder="Image URL"
                value={item.url}
                disabled={disabled}
                onChange={(e) => update(item.id, { url: e.target.value })}
              />
              <div className="field-row">
                <input
                  className="input"
                  placeholder="Alt text"
                  value={item.alt}
                  disabled={disabled}
                  onChange={(e) => update(item.id, { alt: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Caption"
                  value={item.caption}
                  disabled={disabled}
                  onChange={(e) => update(item.id, { caption: e.target.value })}
                />
              </div>
              {!item.url && item.raw.asset != null && (
                <p className="pt-note">Legacy image asset preserved from the previous CMS.</p>
              )}
            </div>
          )}

          {item.kind === 'opaque' && (
            <p className="pt-note">
              Preserved {typeof item.raw._type === 'string' ? item.raw._type : 'block'} — not
              editable here, kept exactly as stored.
            </p>
          )}
        </div>
      ))}

      {!disabled && (
        <div className="pt-add">
          <button type="button" className="btn sm" onClick={() => insert('text')}>
            + Paragraph
          </button>
          <button type="button" className="btn sm" onClick={() => insert('callout')}>
            + Callout
          </button>
          <button type="button" className="btn sm" onClick={() => insert('image')}>
            + Image
          </button>
        </div>
      )}
    </div>
  )
}
