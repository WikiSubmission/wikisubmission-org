'use client'

/**
 * The `body_pt` editing surface: a structured editor for an appendix's Portable
 * Text blocks.
 *
 * Not a WYSIWYG. The article body editor is one because an article is prose
 * with the occasional callout; an appendix is the opposite. Its 14 block types
 * carry typed presentation — a card's surface, a totals row's emphasis, whether
 * a stack of scripture quotations is divided — and those are the fields the
 * conversion exists to preserve. A free-text canvas would offer no way to see
 * or set them, and every save would risk flattening exactly what markdown
 * already flattened once. So each block is a card with its own labelled fields,
 * and the presentation variants are pickers over the closed enums in
 * lib/appendix-styles.ts.
 *
 * Every edit goes through the pure helpers in appendix-pt.ts, which shallow-copy
 * and replace only the touched field. Fields this surface does not show — and
 * there are several, deliberately — ride through untouched, as do the `_key`s of
 * every node that was not edited.
 */
import { useCallback, useMemo, useState } from 'react'

import {
  CARD_STYLES,
  CODE_STYLES,
  CODE_TEXT_STYLES,
  GROUP_STYLES,
  LIST_CONTENT_STYLES,
  LIST_ITEM_STYLES,
  LIST_STYLES,
  MARKER_STYLES,
  PARAGRAPH_STYLES,
  TABLE_CELL_STYLES,
  TABLE_HEADER_STYLES,
  TABLE_NOTE_STYLES,
  TABLE_ROW_STYLES,
  TABLE_STYLES,
  VERSE_BODY_STYLES,
  VERSE_CARD_STYLES,
  VERSE_ENTRY_STYLES,
  VERSE_REF_STYLES,
} from '@/lib/appendix-styles'
import type { AppendixBlock } from '@/lib/appendix-portable-text'

import {
  appendItem,
  appendixBlocks,
  emptyParagraph,
  moveItem,
  parseRich,
  readAtPath,
  removeItem,
  richPreview,
  serializeRich,
  updateAtPath,
  type BlockPath,
} from './appendix-pt'
import { randomKey } from './pt-text'

// ── slot descriptors ─────────────────────────────────────────────────────────

type Slot =
  | { kind: 'select'; key: string; label: string; options: readonly string[] }
  | { kind: 'rich'; key: string; label: string }
  | { kind: 'text'; key: string; label: string }
  | { kind: 'number'; key: string; label: string }
  | { kind: 'toggle'; key: string; label: string }
  /** A nested block array, edited recursively. */
  | { kind: 'blocks'; key: string; label: string }
  /** An array of bare rich-text runs, e.g. list items. */
  | { kind: 'richList'; key: string; label: string }
  /** An array of records, each with its own slots. */
  | { kind: 'items'; key: string; label: string; slots: Slot[]; create: () => unknown }

const keysOf = (styles: Record<string, string>) => Object.keys(styles)

const RICH_CELLS: Slot = { kind: 'richList', key: 'cells', label: 'Cells' }

/**
 * A list item holds inline text, or nested blocks when the list's item element
 * is a `<div>`. Both are offered; which one the renderer reads follows
 * `contentTag`.
 */
const LIST_ITEMS: Slot = {
  kind: 'items',
  key: 'items',
  label: 'Items',
  create: () => ({ _key: randomKey(), text: parseRich('') }),
  slots: [
    { kind: 'rich', key: 'text', label: 'Text' },
    { kind: 'blocks', key: 'content', label: 'Blocks (when the item element is a div)' },
  ],
}

/**
 * What each block type exposes. A field absent from this table is not editable
 * here and is passed through untouched; that is the intended treatment for the
 * layout details the converter derived from the source markup.
 */
const SLOTS: Record<string, Slot[]> = {
  block: [
    { kind: 'select', key: 'style', label: 'Style', options: keysOf(PARAGRAPH_STYLES) },
    { kind: 'rich', key: '', label: 'Text' },
  ],
  appendixSection: [
    { kind: 'select', key: 'style', label: 'Group style', options: keysOf(GROUP_STYLES) },
    { kind: 'select', key: 'tag', label: 'Element', options: ['section', 'div'] },
    { kind: 'blocks', key: 'content', label: 'Content' },
  ],
  appendixDivider: [
    { kind: 'rich', key: 'title', label: 'Title' },
    { kind: 'toggle', key: 'centered', label: 'Centred' },
  ],
  appendixCallout: [
    { kind: 'select', key: 'style', label: 'Card', options: keysOf(CARD_STYLES) },
    { kind: 'select', key: 'tone', label: 'Tone', options: ['primary', 'destructive', 'neutral', 'muted'] },
    { kind: 'toggle', key: 'reveal', label: 'Animate on scroll' },
    { kind: 'blocks', key: 'content', label: 'Content' },
  ],
  appendixVerseCards: [
    { kind: 'select', key: 'style', label: 'Card', options: keysOf(VERSE_CARD_STYLES) },
    { kind: 'select', key: 'body', label: 'Quote size', options: keysOf(VERSE_BODY_STYLES) },
    { kind: 'select', key: 'refStyle', label: 'Reference style', options: keysOf(VERSE_REF_STYLES) },
    { kind: 'rich', key: 'heading', label: 'Heading' },
    {
      kind: 'items',
      key: 'entries',
      label: 'Quotations',
      create: () => ({ _key: randomKey(), body: parseRich(''), wrapper: 'none' }),
      slots: [
        { kind: 'rich', key: 'body', label: 'Quote' },
        { kind: 'rich', key: 'reference', label: 'Reference' },
        { kind: 'select', key: 'wrapper', label: 'Separation', options: keysOf(VERSE_ENTRY_STYLES) },
      ],
    },
  ],
  appendixEvidence: [
    { kind: 'number', key: 'n', label: 'Number' },
    { kind: 'select', key: 'marker', label: 'Badge', options: keysOf(MARKER_STYLES) },
    { kind: 'select', key: 'body', label: 'Column style', options: keysOf(GROUP_STYLES) },
    { kind: 'blocks', key: 'content', label: 'Content' },
  ],
  appendixDefinitionRow: [
    { kind: 'rich', key: 'term', label: 'Term' },
    { kind: 'select', key: 'termStyle', label: 'Term style', options: keysOf(MARKER_STYLES) },
    { kind: 'rich', key: 'body', label: 'Definition' },
    { kind: 'select', key: 'bodyStyle', label: 'Definition style', options: keysOf(LIST_CONTENT_STYLES) },
  ],
  appendixInterlude: [{ kind: 'rich', key: 'text', label: 'Text' }],
  appendixStatement: [{ kind: 'rich', key: 'text', label: 'Statement' }],
  appendixBadgeList: [
    { kind: 'select', key: 'style', label: 'List', options: keysOf(LIST_STYLES) },
    { kind: 'select', key: 'item', label: 'Item', options: keysOf(LIST_ITEM_STYLES) },
    { kind: 'select', key: 'marker', label: 'Marker', options: keysOf(MARKER_STYLES) },
    { kind: 'select', key: 'content', label: 'Item body', options: keysOf(LIST_CONTENT_STYLES) },
    { kind: 'select', key: 'contentTag', label: 'Item element', options: ['none', 'span', 'p', 'div'] },
    { kind: 'text', key: 'bullet', label: 'Bullet character' },
    { kind: 'toggle', key: 'ordered', label: 'Numbered list' },
    LIST_ITEMS,
  ],
  appendixListCard: [
    { kind: 'rich', key: 'caption', label: 'Caption' },
    { kind: 'select', key: 'item', label: 'Item', options: keysOf(LIST_ITEM_STYLES) },
    { kind: 'select', key: 'marker', label: 'Marker', options: keysOf(MARKER_STYLES) },
    { kind: 'select', key: 'content', label: 'Item body', options: keysOf(LIST_CONTENT_STYLES) },
    { kind: 'select', key: 'contentTag', label: 'Item element', options: ['none', 'span', 'p', 'div'] },
    LIST_ITEMS,
  ],
  appendixDataTable: [
    { kind: 'rich', key: 'caption', label: 'Caption' },
    { kind: 'select', key: 'table', label: 'Table', options: keysOf(TABLE_STYLES) },
    {
      kind: 'items',
      key: 'columns',
      label: 'Columns',
      create: () => ({ headerStyle: 'left', cellStyle: 'plain' }),
      slots: [
        { kind: 'rich', key: 'header', label: 'Header' },
        { kind: 'select', key: 'headerStyle', label: 'Header style', options: keysOf(TABLE_HEADER_STYLES) },
        { kind: 'select', key: 'cellStyle', label: 'Cell style', options: keysOf(TABLE_CELL_STYLES) },
      ],
    },
    {
      kind: 'items',
      key: 'rows',
      label: 'Rows',
      create: () => ({ _key: randomKey(), style: 'data', cells: [] }),
      slots: [
        { kind: 'select', key: 'style', label: 'Row', options: keysOf(TABLE_ROW_STYLES) },
        RICH_CELLS,
      ],
    },
    { kind: 'select', key: 'note.style', label: 'Footer note style', options: keysOf(TABLE_NOTE_STYLES) },
    { kind: 'toggle', key: 'note.inside', label: 'Footer note scrolls with the table' },
    { kind: 'blocks', key: 'note.content', label: 'Footer note' },
  ],
  appendixGridTable: [
    { kind: 'richList', key: 'headers', label: 'Headers' },
    {
      kind: 'items',
      key: 'rows',
      label: 'Rows',
      create: () => ({ variant: 'data', cells: [] }),
      slots: [
        { kind: 'select', key: 'variant', label: 'Row', options: ['data', 'total', 'group'] },
        { kind: 'toggle', key: 'alignTop', label: 'Align top' },
        {
          kind: 'items',
          key: 'cells',
          label: 'Cells',
          create: () => ({ content: parseRich('') }),
          slots: [
            { kind: 'rich', key: 'content', label: 'Cell' },
            { kind: 'number', key: 'colSpan', label: 'Column span' },
          ],
        },
      ],
    },
    { kind: 'richList', key: 'notes', label: 'Notes' },
  ],
  appendixCode: [
    { kind: 'select', key: 'style', label: 'Strip', options: keysOf(CODE_STYLES) },
    { kind: 'select', key: 'text', label: 'Text', options: keysOf(CODE_TEXT_STYLES) },
    { kind: 'text', key: 'value', label: 'Value' },
  ],
  appendixFigure: [
    { kind: 'text', key: 'src', label: 'Image URL' },
    { kind: 'text', key: 'alt', label: 'Alt text' },
    { kind: 'number', key: 'width', label: 'Width' },
    { kind: 'number', key: 'height', label: 'Height' },
    { kind: 'select', key: 'frame', label: 'Frame', options: ['full', 'sm'] },
    { kind: 'rich', key: 'caption', label: 'Caption' },
  ],
}

/** Human labels for the block picker and the card headers. */
const BLOCK_LABELS: Record<string, string> = {
  block: 'Paragraph',
  appendixSection: 'Group',
  appendixDivider: 'Divider',
  appendixCallout: 'Card',
  appendixVerseCards: 'Scripture card',
  appendixEvidence: 'Evidence item',
  appendixDefinitionRow: 'Definition row',
  appendixInterlude: 'Interlude',
  appendixStatement: 'Statement',
  appendixBadgeList: 'List',
  appendixListCard: 'List card',
  appendixDataTable: 'Table',
  appendixGridTable: 'Grid table',
  appendixCode: 'Code strip',
  appendixFigure: 'Figure',
}

/** Blocks offered by the "add" menu, in the order they are most often wanted. */
const ADDABLE = [
  'block',
  'appendixCallout',
  'appendixVerseCards',
  'appendixDivider',
  'appendixStatement',
  'appendixBadgeList',
  'appendixDataTable',
  'appendixCode',
  'appendixSection',
] as const

function createBlock(type: string): AppendixBlock {
  const key = randomKey()
  switch (type) {
    case 'appendixCallout':
      return { _type: 'appendixCallout', _key: key, tone: 'primary', style: 'example', content: [emptyParagraph()] }
    case 'appendixVerseCards':
      return {
        _type: 'appendixVerseCards',
        _key: key,
        style: 'centerTight',
        body: 'base',
        refStyle: 'plain',
        entries: [{ _key: randomKey(), body: parseRich(''), wrapper: 'none' }],
      }
    case 'appendixDivider':
      return { _type: 'appendixDivider', _key: key, title: parseRich('') }
    case 'appendixStatement':
      return { _type: 'appendixStatement', _key: key, text: parseRich('') }
    case 'appendixBadgeList':
      return {
        _type: 'appendixBadgeList',
        _key: key,
        ordered: false,
        style: 'badge',
        item: 'badge',
        marker: 'primary',
        content: 'sm',
        contentTag: 'span',
        items: [{ _key: randomKey(), text: parseRich('') }],
      }
    case 'appendixDataTable':
      return {
        _type: 'appendixDataTable',
        _key: key,
        table: 'plain',
        columns: [{ headerStyle: 'left', cellStyle: 'plain' }],
        rows: [{ _key: randomKey(), style: 'data', cells: [parseRich('')] }],
      }
    case 'appendixCode':
      return { _type: 'appendixCode', _key: key, style: 'sequence', text: 'sequence', value: '' }
    case 'appendixSection':
      return { _type: 'appendixSection', _key: key, style: 'prose', tag: 'section', content: [emptyParagraph()] }
    default:
      return emptyParagraph()
  }
}

// ── the surface ──────────────────────────────────────────────────────────────

interface AppendixBodyEditorProps {
  value: unknown
  onChange: (blocks: unknown[]) => void
  disabled?: boolean
}

export function AppendixBodyEditor({ value, onChange, disabled }: AppendixBodyEditorProps) {
  const blocks = useMemo(() => appendixBlocks(value), [value])

  const apply = useCallback(
    (next: unknown) => {
      if (disabled) return
      onChange(Array.isArray(next) ? next : [])
    },
    [disabled, onChange],
  )

  const setAt = useCallback(
    (path: BlockPath, next: unknown) => apply(updateAtPath(blocks, path, next)),
    [apply, blocks],
  )

  return (
    <div className="appendix-body-editor space-y-3">
      <BlockList
        blocks={blocks}
        path={[]}
        root={blocks}
        setAt={setAt}
        apply={apply}
        disabled={disabled}
      />
      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No Portable Text body yet. Add a block, or leave this empty to keep rendering the
          markdown body.
        </p>
      )}
    </div>
  )
}

interface ListProps {
  blocks: AppendixBlock[]
  path: BlockPath
  root: unknown
  setAt: (path: BlockPath, next: unknown) => void
  apply: (next: unknown) => void
  disabled?: boolean
}

function BlockList({ blocks, path, root, setAt, apply, disabled }: ListProps) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockCard
          key={block._key || `${i}`}
          block={block}
          index={i}
          count={blocks.length}
          path={[...path, i]}
          listPath={path}
          root={root}
          setAt={setAt}
          apply={apply}
          disabled={disabled}
        />
      ))}
      <AddBlock
        onAdd={(type) => apply(appendItem(root, path, createBlock(type)))}
        disabled={disabled}
      />
    </div>
  )
}

function AddBlock({ onAdd, disabled }: { onAdd: (type: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Add</span>
      {ADDABLE.map((type) => (
        <button
          key={type}
          type="button"
          disabled={disabled}
          onClick={() => onAdd(type)}
          className="rounded border border-border/60 px-2 py-0.5 text-xs hover:bg-muted/40 disabled:opacity-50"
        >
          {BLOCK_LABELS[type]}
        </button>
      ))}
    </div>
  )
}

interface CardProps extends Omit<ListProps, 'blocks'> {
  block: AppendixBlock
  index: number
  count: number
  listPath: BlockPath
}

function BlockCard({
  block,
  index,
  count,
  path,
  listPath,
  root,
  setAt,
  apply,
  disabled,
}: CardProps) {
  const [open, setOpen] = useState(false)
  const slots = SLOTS[block._type] ?? []
  const label = BLOCK_LABELS[block._type] ?? block._type
  const preview = describe(block)

  return (
    <div className="rounded-md border border-border/60 bg-background/40">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="truncate text-xs text-muted-foreground">{preview}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            title="Move up"
            disabled={disabled || index === 0}
            onClick={() => apply(moveItem(root, listPath, index, -1))}
          >
            ↑
          </IconButton>
          <IconButton
            title="Move down"
            disabled={disabled || index === count - 1}
            onClick={() => apply(moveItem(root, listPath, index, 1))}
          >
            ↓
          </IconButton>
          <IconButton
            title="Delete"
            disabled={disabled}
            onClick={() => apply(removeItem(root, listPath, index))}
          >
            ×
          </IconButton>
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t border-border/40 px-2 py-2">
          {slots.length === 0 && (
            <p className="text-xs text-muted-foreground">
              This block has no editable fields here; its value is preserved as stored.
            </p>
          )}
          {slots.map((slot) => (
            <SlotField
              key={`${slot.kind}:${slot.key}`}
              slot={slot}
              path={path}
              root={root}
              setAt={setAt}
              apply={apply}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SlotProps {
  slot: Slot
  path: BlockPath
  root: unknown
  setAt: (path: BlockPath, next: unknown) => void
  apply: (next: unknown) => void
  disabled?: boolean
}

function SlotField({ slot, path, root, setAt, apply, disabled }: SlotProps) {
  // An empty key means the slot edits the node itself, which is how a paragraph
  // block's own children are reached. A dotted key descends into a nested
  // record, e.g. a table's `note.content`.
  const at: BlockPath = slot.key === '' ? path : [...path, ...slot.key.split('.')]
  const current = readAtPath(root, at)

  if (slot.kind === 'rich') {
    return (
      <Labelled label={slot.label}>
        <textarea
          rows={2}
          disabled={disabled}
          value={serializeRich(current as never)}
          onChange={(e) => setAt(at, parseRich(e.target.value))}
          className="w-full rounded border border-border/60 bg-background px-2 py-1 text-xs"
        />
      </Labelled>
    )
  }

  if (slot.kind === 'text') {
    return (
      <Labelled label={slot.label}>
        <input
          type="text"
          disabled={disabled}
          value={typeof current === 'string' ? current : ''}
          onChange={(e) => setAt(at, e.target.value)}
          className="w-full rounded border border-border/60 bg-background px-2 py-1 font-mono text-xs"
        />
      </Labelled>
    )
  }

  if (slot.kind === 'number') {
    return (
      <Labelled label={slot.label}>
        <input
          type="number"
          disabled={disabled}
          value={typeof current === 'number' ? current : ''}
          onChange={(e) =>
            setAt(at, e.target.value === '' ? undefined : Number(e.target.value))
          }
          className="w-28 rounded border border-border/60 bg-background px-2 py-1 text-xs"
        />
      </Labelled>
    )
  }

  if (slot.kind === 'toggle') {
    return (
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          disabled={disabled}
          checked={current === true}
          onChange={(e) => setAt(at, e.target.checked ? true : undefined)}
        />
        {slot.label}
      </label>
    )
  }

  if (slot.kind === 'select') {
    return (
      <Labelled label={slot.label}>
        <select
          disabled={disabled}
          value={typeof current === 'string' ? current : ''}
          onChange={(e) => setAt(at, e.target.value === '' ? undefined : e.target.value)}
          className="w-full rounded border border-border/60 bg-background px-2 py-1 text-xs"
        >
          <option value="">—</option>
          {slot.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Labelled>
    )
  }

  if (slot.kind === 'richList') {
    const items = Array.isArray(current) ? current : []
    return (
      <Labelled label={slot.label}>
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-1">
              <textarea
                rows={1}
                disabled={disabled}
                value={serializeRich(item as never)}
                onChange={(e) => setAt([...at, i], parseRich(e.target.value))}
                className="w-full rounded border border-border/60 bg-background px-2 py-1 text-xs"
              />
              <IconButton
                title="Remove"
                disabled={disabled}
                onClick={() => apply(removeItem(root, at, i))}
              >
                ×
              </IconButton>
            </div>
          ))}
          <SmallButton
            disabled={disabled}
            onClick={() => apply(appendItem(root, at, parseRich('')))}
          >
            Add {slot.label.toLowerCase()}
          </SmallButton>
        </div>
      </Labelled>
    )
  }

  if (slot.kind === 'blocks') {
    const nested = appendixBlocks(current)
    return (
      <Labelled label={slot.label}>
        <div className="rounded border border-dashed border-border/50 p-1.5">
          <BlockList
            blocks={nested}
            path={at}
            root={root}
            setAt={setAt}
            apply={apply}
            disabled={disabled}
          />
        </div>
      </Labelled>
    )
  }

  const items = Array.isArray(current) ? current : []
  return (
    <Labelled label={slot.label}>
      <div className="space-y-1.5">
        {items.map((_, i) => (
          <div key={i} className="rounded border border-border/50 p-1.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <IconButton
                  title="Move up"
                  disabled={disabled || i === 0}
                  onClick={() => apply(moveItem(root, at, i, -1))}
                >
                  ↑
                </IconButton>
                <IconButton
                  title="Move down"
                  disabled={disabled || i === items.length - 1}
                  onClick={() => apply(moveItem(root, at, i, 1))}
                >
                  ↓
                </IconButton>
                <IconButton
                  title="Remove"
                  disabled={disabled}
                  onClick={() => apply(removeItem(root, at, i))}
                >
                  ×
                </IconButton>
              </div>
            </div>
            <div className="space-y-1.5">
              {slot.slots.map((inner) => (
                <SlotField
                  key={`${inner.kind}:${inner.key}`}
                  slot={inner}
                  path={[...at, i]}
                  root={root}
                  setAt={setAt}
                  apply={apply}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        ))}
        <SmallButton disabled={disabled} onClick={() => apply(appendItem(root, at, slot.create()))}>
          Add {slot.label.toLowerCase().replace(/s$/, '')}
        </SmallButton>
      </div>
    </Labelled>
  )
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function IconButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-border/60 px-1.5 text-xs leading-5 hover:bg-muted/40 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function SmallButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-border/60 px-2 py-0.5 text-xs hover:bg-muted/40 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

/** A one-line summary for a collapsed block card. */
function describe(block: AppendixBlock): string {
  const record = block as unknown as Record<string, unknown>
  for (const key of ['title', 'text', 'caption', 'heading', 'term']) {
    const preview = richPreview(record[key] as never)
    if (preview) return preview
  }
  if (block._type === 'block') return richPreview(block as never) || 'Empty paragraph'
  if (block._type === 'appendixCode') return block.value
  if (block._type === 'appendixFigure') return block.alt || block.src
  if (Array.isArray(record.content)) {
    const first = (record.content as AppendixBlock[])[0]
    if (first) return describe(first)
  }
  if (Array.isArray(record.entries)) {
    const first = (record.entries as Array<{ body?: unknown }>)[0]
    if (first) return richPreview(first.body as never)
  }
  if (Array.isArray(record.items)) {
    return richPreview((record.items as unknown[])[0] as never)
  }
  if (Array.isArray(record.rows)) {
    return `${(record.rows as unknown[]).length} rows`
  }
  return ''
}
