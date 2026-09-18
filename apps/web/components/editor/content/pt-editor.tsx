'use client'

/**
 * Article body editor — a Portable Text WYSIWYG built on Sanity's standalone
 * @portabletext/editor. It reads and writes the SAME Portable Text stored by
 * the previous form editor (see pt-schema.ts for the byte-compatibility
 * contract) so no content migration is needed and the public
 * @portabletext/react renderer is unchanged.
 *
 * Custom block objects: `callout` (tone + text), `image` (url/alt/caption, with
 * upload), `verse` (Quran verses with Arabic + translation), and `richTableBlock`.
 *
 * Includes modern editorial slash commands (`/quran`, `/callout`, `/image`,
 * headings, citations, lists) and scripture insertion dialog.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { defineSchema, EditorProvider, PortableTextEditable, useEditor } from '@portabletext/editor'
import type {
  BlockAnnotationRenderProps,
  BlockRenderProps,
  PortableTextBlock,
} from '@portabletext/editor'
import { EventListenerPlugin } from '@portabletext/editor/plugins'
import {
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Quote,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Link2,
  Bookmark,
} from 'lucide-react'

import {
  SCHEMA_DEFINITION,
  STYLE_OPTIONS,
  TONE_OPTIONS,
  hasUnsupportedBlocks,
  toInitialValue,
} from './pt-schema'
import { sanitizeUrl } from '@/lib/safe-url'
import { RichTableCard } from './rich-table-card'
import type { RichTableValue } from './pt-table'
import { uploadEditorialImage } from './upload-image'
import { QuranVerseDialog, InsertedVerseData } from './quran-verse-dialog'
import { SlashCommandMenu, SlashCommand } from './slash-command-menu'

const schemaDefinition = defineSchema(
  SCHEMA_DEFINITION as unknown as Parameters<typeof defineSchema>[0],
)

type BlockPath = BlockRenderProps['path']

// renderBlock is called outside the component tree's props, so the read-only
// state of the document reaches the block cards through context.
const ReadOnlyContext = createContext(false)

interface BlockObjectValue {
  _key: string
  _type: string
  tone?: string
  text?: string
  url?: string
  alt?: string
  caption?: string
  chapter?: number
  verses?: string
  surahName?: string
  arabic?: string
  translation?: string
}

interface PTEditorProps {
  initialValue: unknown
  onChange: (blocks: unknown[]) => void
  disabled?: boolean
}

export function PTEditor({ initialValue, onChange, disabled }: PTEditorProps) {
  // Slate needs the DOM; render only after mount to avoid SSR/hydration issues.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

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
        (for example an embed or a legacy block type). Editing the body here is
        disabled so nothing is lost. The content is preserved exactly as stored.
      </div>
    )
  }

  return (
    <ReadOnlyContext.Provider value={disabled === true}>
      <div className={`pt-editor${disabled ? ' is-disabled' : ''}`}>
        <EditorProvider
          initialConfig={{
            schemaDefinition,
            initialValue: initial as PortableTextBlock[] | undefined,
          }}
        >
          <EventListenerPlugin
            on={(event) => {
              if (event.type === 'mutation') handleMutation(event.value)
            }}
          />
          <EditorCanvas disabled={disabled} />
        </EditorProvider>
      </div>
    </ReadOnlyContext.Provider>
  )
}

// ── inner editor canvas with commands & toolbar ───────────────────────────────

function EditorCanvas({ disabled }: { disabled?: boolean }) {
  const editor = useEditor()
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null)
  const [quranOpen, setQuranOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleDecorator = (decorator: string) =>
    editor.send({ type: 'decorator.toggle', decorator })
  const toggleStyle = (style: string) => editor.send({ type: 'style.toggle', style })
  const toggleList = (listItem: string) => editor.send({ type: 'list item.toggle', listItem })

  const handleAddLink = () => {
    const raw = window.prompt('Link URL (e.g. https://…):')?.trim()
    if (!raw) return
    const href = sanitizeUrl(raw)
    if (!href) {
      window.alert('That link uses an unsupported or unsafe URL scheme.')
      return
    }
    editor.send({
      type: 'annotation.add',
      annotation: { name: 'link', value: { href, blank: false } },
    })
  }

  const handleRemoveLink = () =>
    editor.send({ type: 'annotation.remove', annotation: { name: 'link' } })

  const handleAddCitation = () => {
    const source = window
      .prompt('Citation Source / Reference (e.g. "Ibn Kathir, Vol 1, p. 45" or "Sahih al-Bukhari 1:1"):')
      ?.trim()
    if (!source) return
    const rawUrl = window.prompt('Optional reference link URL (or leave blank):')?.trim()
    const href = rawUrl ? sanitizeUrl(rawUrl) : undefined
    editor.send({
      type: 'annotation.add',
      annotation: {
        name: 'citation',
        value: { source, reference: source, href },
      },
    })
  }

  const handleInsertCallout = () => {
    editor.send({
      type: 'insert.block object',
      placement: 'auto',
      blockObject: { name: 'callout', value: { tone: 'info', text: '' } },
    })
  }

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleInsertVerse = (verse: InsertedVerseData) => {
    editor.send({
      type: 'insert.block object',
      placement: 'auto',
      blockObject: {
        name: 'verse',
        value: {
          chapter: verse.chapter,
          verses: verse.verses,
          surahName: verse.surahName,
          arabic: verse.arabic,
          translation: verse.translation,
          body: verse.body,
        },
      },
    })
  }

  // Slash commands catalog
  const slashCommands: SlashCommand[] = useMemo(
    () => [
      {
        id: 'quran',
        title: "Qur'an Verse(s)",
        description: 'Insert ayah with authentic Arabic text & English translation',
        category: 'Scripture & Media',
        icon: <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />,
        keywords: ['quran', 'verse', 'ayah', 'surah', 'scripture', 'islam'],
        action: () => setQuranOpen(true),
      },
      {
        id: 'image',
        title: 'Image',
        description: 'Upload an editorial illustration, chart, or photo',
        category: 'Scripture & Media',
        icon: <ImageIcon className="size-4 text-sky-600 dark:text-sky-400" />,
        keywords: ['image', 'photo', 'picture', 'upload', 'media'],
        action: () => fileRef.current?.click(),
      },
      {
        id: 'callout',
        title: 'Callout Box',
        description: 'Highlighted note for scholarly tips, caveats or warnings',
        category: 'Scripture & Media',
        icon: <MessageSquare className="size-4 text-amber-600 dark:text-amber-400" />,
        keywords: ['callout', 'box', 'note', 'alert', 'info', 'warning'],
        action: handleInsertCallout,
      },
      {
        id: 'h2',
        title: 'Heading 2',
        description: 'Major section heading',
        category: 'Basic Blocks',
        icon: <Heading2 className="size-4 text-foreground" />,
        keywords: ['heading', 'h2', 'title', 'section'],
        action: () => toggleStyle('h2'),
      },
      {
        id: 'h3',
        title: 'Heading 3',
        description: 'Sub-section heading',
        category: 'Basic Blocks',
        icon: <Heading3 className="size-4 text-foreground" />,
        keywords: ['heading', 'h3', 'subtitle'],
        action: () => toggleStyle('h3'),
      },
      {
        id: 'h4',
        title: 'Heading 4',
        description: 'Minor subsection header',
        category: 'Basic Blocks',
        icon: <Heading4 className="size-4 text-foreground" />,
        keywords: ['heading', 'h4', 'minor'],
        action: () => toggleStyle('h4'),
      },
      {
        id: 'quote',
        title: 'Blockquote',
        description: 'Scholarly quotation or citation block',
        category: 'Basic Blocks',
        icon: <Quote className="size-4 text-foreground" />,
        keywords: ['quote', 'blockquote', 'cite'],
        action: () => toggleStyle('blockquote'),
      },
      {
        id: 'bullet',
        title: 'Bulleted List',
        description: 'Unordered list with bullet points',
        category: 'Lists & Citations',
        icon: <List className="size-4 text-foreground" />,
        keywords: ['bullet', 'list', 'ul', 'points'],
        action: () => toggleList('bullet'),
      },
      {
        id: 'number',
        title: 'Numbered List',
        description: 'Ordered sequence list (1, 2, 3…)',
        category: 'Lists & Citations',
        icon: <ListOrdered className="size-4 text-foreground" />,
        keywords: ['number', 'ordered', 'list', 'ol', 'steps'],
        action: () => toggleList('number'),
      },
      {
        id: 'citation',
        title: 'Add Citation',
        description: 'Scholarly reference footnote (source, ref, URL)',
        category: 'Lists & Citations',
        icon: <Bookmark className="size-4 text-amber-600 dark:text-amber-400" />,
        keywords: ['cite', 'citation', 'source', 'reference', 'footnote'],
        action: handleAddCitation,
      },
      {
        id: 'link',
        title: 'Insert Link',
        description: 'Hyperlink to reference or web source',
        category: 'Lists & Citations',
        icon: <Link2 className="size-4 text-blue-600 dark:text-blue-400" />,
        keywords: ['link', 'url', 'href', 'web'],
        action: handleAddLink,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMod = e.ctrlKey || e.metaKey

    // Formatting shortcuts
    if (isMod && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      toggleDecorator('strong')
      return
    }
    if (isMod && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      toggleDecorator('em')
      return
    }
    if (isMod && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      toggleDecorator('underline')
      return
    }
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      handleAddLink()
      return
    }

    // Slash command trigger
    if (e.key === '/' && !isMod && !disabled) {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect()
        setSlashPos({
          top: Math.min(window.innerHeight - 360, Math.max(20, rect.bottom + 6)),
          left: Math.min(window.innerWidth - 340, Math.max(20, rect.left)),
        })
      } else {
        setSlashPos(null)
      }
      setSlashQuery('')
      setSlashOpen(true)
    }
  }

  return (
    <>
      {!disabled && (
        <div className="pt-toolbar">
          <button
            type="button"
            className="pt-tb"
            title="Bold (Ctrl+B)"
            onClick={() => toggleDecorator('strong')}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            className="pt-tb"
            title="Italic (Ctrl+I)"
            onClick={() => toggleDecorator('em')}
          >
            <i>I</i>
          </button>
          <button
            type="button"
            className="pt-tb"
            title="Underline (Ctrl+U)"
            onClick={() => toggleDecorator('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className="pt-tb"
            title="Strikethrough"
            onClick={() => toggleDecorator('strike-through')}
          >
            <s>S</s>
          </button>
          <button
            type="button"
            className="pt-tb"
            title="Inline Code"
            onClick={() => toggleDecorator('code')}
          >
            {'</>'}
          </button>

          <span className="pt-tb-sep" />

          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              className="pt-tb"
              title={s.label}
              onClick={() => toggleStyle(s.value)}
            >
              {s.value === 'normal' ? 'P' : s.value === 'blockquote' ? '❝' : s.value.toUpperCase()}
            </button>
          ))}

          <span className="pt-tb-sep" />

          <button
            type="button"
            className="pt-tb"
            title="Bulleted list"
            onClick={() => toggleList('bullet')}
          >
            •
          </button>
          <button
            type="button"
            className="pt-tb"
            title="Numbered list"
            onClick={() => toggleList('number')}
          >
            1.
          </button>

          <span className="pt-tb-sep" />

          <button type="button" className="pt-tb" title="Add link (Ctrl+K)" onClick={handleAddLink}>
            🔗
          </button>
          <button type="button" className="pt-tb" title="Remove link" onClick={handleRemoveLink}>
            ⛓️‍💥
          </button>
          <button type="button" className="pt-tb" title="Add Citation" onClick={handleAddCitation}>
            🏷️
          </button>

          <span className="pt-tb-sep" />

          {/* Scripture Verse button */}
          <button
            type="button"
            className="pt-tb pt-tb-wide pt-tb-verse"
            title="Insert Qur'an Verse(s)"
            onClick={() => setQuranOpen(true)}
          >
            <BookOpen className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
            + Verse
          </button>

          <button
            type="button"
            className="pt-tb pt-tb-wide"
            onClick={handleInsertCallout}
            title="Insert Callout box"
          >
            + Callout
          </button>

          <button
            type="button"
            className="pt-tb pt-tb-wide"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            title="Upload editorial image"
          >
            {uploading ? 'Uploading…' : '+ Image'}
          </button>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePickImage} />

          <div className="pt-spacer" />

          <span className="pt-tb-hint hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            Type <kbd className="px-1 py-0.5 rounded bg-muted text-foreground border text-[10px]">/</kbd> for quick menu
          </span>
        </div>
      )}

      <PortableTextEditable
        className="pt-content"
        readOnly={disabled}
        onKeyDown={handleKeyDown}
        renderStyle={(props) => renderStyle(props)}
        renderDecorator={(props) => renderDecorator(props)}
        renderAnnotation={(props) => renderAnnotation(props)}
        renderListItem={(props) => <>{props.children}</>}
        renderBlock={(props) => renderBlock(props)}
      />

      {/* Floating Slash Command Palette */}
      <SlashCommandMenu
        isOpen={slashOpen}
        onClose={() => setSlashOpen(false)}
        query={slashQuery}
        onQueryChange={setSlashQuery}
        commands={slashCommands}
        position={slashPos}
      />

      {/* Qur'an Verse Insertion Dialog */}
      <QuranVerseDialog
        open={quranOpen}
        onOpenChange={setQuranOpen}
        onInsert={handleInsertVerse}
      />
    </>
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
  if (props.schemaType.name === 'citation') {
    const val = props.value as { source?: string; reference?: string; href?: string }
    const display = val?.source || val?.reference
    return (
      <span
        className="pt-citation"
        title={val?.href ? `${display} (${val.href})` : display}
      >
        {props.children}
        {display && <sup className="pt-cite-tag">[{display}]</sup>}
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
  if (props.schemaType.name === 'verse') {
    return <VerseCard value={value} path={props.path} />
  }
  if (props.schemaType.name === 'richTableBlock') {
    return <TableBlock value={props.value as RichTableValue} path={props.path} />
  }
  const meta = props.value as { listItem?: string; level?: number }
  return (
    <div className="pt-line" data-list={meta.listItem} data-level={meta.level}>
      {props.children}
    </div>
  )
}

// ── custom block cards ───────────────────────────────────────────────────────

function VerseCard({ value, path }: { value: BlockObjectValue; path: BlockPath }) {
  const editor = useEditor()
  const readOnly = useContext(ReadOnlyContext)
  const remove = () => editor.send({ type: 'delete.block', at: path })

  return (
    <div className="pt-card pt-verse" contentEditable={false}>
      <div className="pt-card-bar">
        <span className="pt-card-kind flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400 inline" />
          Qur&apos;an Verse {value.chapter ? `${value.chapter}:${value.verses || ''}` : ''}
        </span>
        {value.surahName && (
          <span className="text-xs text-muted-foreground font-medium ml-1">
            • Surah {value.surahName}
          </span>
        )}
        <span className="pt-spacer" />
        {!readOnly && (
          <button
            type="button"
            className="iconbtn"
            title="Remove Verse"
            onClick={remove}
          >
            ✕
          </button>
        )}
      </div>
      {value.arabic && (
        <div dir="rtl" lang="ar" className="pt-verse-arabic">
          {value.arabic}
        </div>
      )}
      {value.translation && (
        <div className="pt-verse-translation">
          &ldquo;{value.translation}&rdquo;
        </div>
      )}
      <div className="pt-verse-meta">
        — The Holy Qur&apos;an, Surah {value.surahName || value.chapter} ({value.chapter}:{value.verses || ''})
      </div>
    </div>
  )
}

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

// ── Rich table ───────────────────────────────────────────────────────────────
// Tables were authored in the retired Studio by sanity-plugin-rich-table. The
// card in rich-table-card.tsx edits rows, columns and cells in place and writes
// back only the fields it touched, so Studio-only fields survive a save.

function TableBlock({ value, path }: { value: RichTableValue; path: BlockPath }) {
  const readOnly = useContext(ReadOnlyContext)
  return <RichTableCard value={value} path={path} readOnly={readOnly} />
}
