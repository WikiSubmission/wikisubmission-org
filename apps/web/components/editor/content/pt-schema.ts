/**
 * Portable Text schema for the article editor, kept free of any
 * @portabletext/editor import so it is pure and unit-testable. The component
 * (pt-editor.tsx) feeds SCHEMA_DEFINITION to defineSchema().
 *
 * The type/mark/style names here are the byte-compatibility contract with the
 * stored content and the public @portabletext/react renderer: they must match
 * the shapes the previous editor produced (see pt-text.ts) and what
 * blog-post-article.tsx renders. Renaming any of them silently breaks existing
 * content.
 */

export interface SchemaField {
  name: string
  type: 'string' | 'boolean' | 'number'
}

export interface SchemaObject {
  name: string
  fields: SchemaField[]
}

export interface PortableTextSchemaDefinition {
  decorators: Array<{ name: string }>
  styles: Array<{ name: string }>
  lists: Array<{ name: string }>
  annotations: SchemaObject[]
  inlineObjects: SchemaObject[]
  blockObjects: SchemaObject[]
}

/** Inline marks. Order is irrelevant; names must match stored `marks`. */
export const DECORATORS = ['strong', 'em', 'underline', 'strike-through', 'code'] as const

/** Block styles offered in the style dropdown (value + human label). */
export const STYLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'normal', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'blockquote', label: 'Quote' },
]

/** Callout tones, matching the previous editor and the public renderer. */
export const TONE_OPTIONS = ['info', 'warning', 'tip', 'danger'] as const

export const SCHEMA_DEFINITION: PortableTextSchemaDefinition = {
  decorators: DECORATORS.map((name) => ({ name })),
  styles: STYLE_OPTIONS.map((s) => ({ name: s.value })),
  lists: [{ name: 'bullet' }, { name: 'number' }],
  annotations: [
    {
      name: 'link',
      fields: [
        { name: 'href', type: 'string' },
        { name: 'blank', type: 'boolean' },
      ],
    },
  ],
  inlineObjects: [],
  blockObjects: [
    {
      name: 'callout',
      fields: [
        { name: 'tone', type: 'string' },
        { name: 'text', type: 'string' },
      ],
    },
    {
      name: 'image',
      fields: [
        { name: 'url', type: 'string' },
        { name: 'alt', type: 'string' },
        { name: 'caption', type: 'string' },
      ],
    },
  ],
}

/**
 * Block `_type`s the visual editor understands. Anything else (legacy tables,
 * embeds) is unsupported: the editor refuses to load such a document so the
 * unknown blocks are never dropped on save.
 */
export const KNOWN_BLOCK_TYPES: readonly string[] = ['block', 'callout', 'image']

/** True if `value` contains any block whose _type the editor cannot represent. */
export function hasUnsupportedBlocks(value: unknown): boolean {
  if (!Array.isArray(value)) return false
  return value.some((block) => {
    const type = (block as { _type?: unknown } | null)?._type
    return typeof type === 'string' && !KNOWN_BLOCK_TYPES.includes(type)
  })
}

/** Normalizes a stored PT field into an initial value (array) or undefined. */
export function toInitialValue(value: unknown): unknown[] | undefined {
  return Array.isArray(value) && value.length > 0 ? value : undefined
}
