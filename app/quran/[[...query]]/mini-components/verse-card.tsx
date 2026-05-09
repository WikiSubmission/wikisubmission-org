'use client'

import { memo, useMemo, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useSignInPromptStore } from '@/store/sign-in-prompt'
import { useAddBookmarkEntry, useRemoveBookmarkEntry } from '@/hooks/use-bookmarks'
import { useUpsertNote, useDeleteNote } from '@/hooks/use-notes'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_FONT } from '@/lib/quran-zoom'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import {
  useQuranPlayerCallbacks,
  type QuranVerse,
} from '@/lib/quran-audio-context'
import { PlayWordButton } from '@/components/play-word-button'
import { useWordAudio, wordAudioId } from '@/lib/word-audio'
import { RootWordOccurrences } from './root-word-occurrences'
import { CopyButton } from './copy-button'
import {
  Play,
  Pause,
  Loader2,
  ArrowUpRight,
  Bookmark,
  StickyNote,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HighlightText } from '@/components/highlight-text'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { components } from '@/src/api/types.gen'
import { QuranRefText } from '@/components/quran-ref-text'
import type { BookmarkEntryData, NoteData } from '@/types/bookmarks'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import '@blocknote/react/style.css'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

// Adapter: VerseData → QuranVerse (for the audio player)
export function toQuranVerse(verse: VerseData): QuranVerse {
  return { verse_id: verse.vk ?? '', ws_quran_text: {} }
}

function WordDetailsDialogContent({
  arabic,
  translation,
  transliteration,
  root,
  meaning,
  chapter,
  verse,
  word,
}: {
  arabic: string
  translation?: string
  transliteration?: string
  root?: string
  meaning?: string
  chapter?: number
  verse?: number
  /** 1-based word index within the verse. */
  word?: number
}) {
  const t = useTranslations('wordLab')
  const [occurrencesTotal, setOccurrencesTotal] = useState<number | null>(null)
  const hasCoords =
    typeof chapter === 'number' &&
    typeof verse === 'number' &&
    typeof word === 'number'

  return (
    <DialogContent
      className="max-w-md sm:max-w-xl rounded-3xl p-0"
      aria-describedby={undefined}
    >
      <DialogHeader className="relative items-center text-center px-6 pt-8 pb-6 border-b bg-linear-to-b from-primary/15 via-primary/5 to-transparent gap-2 overflow-hidden">
        {/* Soft radial glow behind the arabic glyph */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_30%,var(--primary)/12%,transparent_60%)]"
        />

        {/* Vertical padding inside the glyph's own box gives diacritics
            (shadda above, kasra below) room without reserving a fixed slot
            that would look empty for shorter words. */}
        <DialogTitle asChild>
          <span className="relative block font-arabic text-primary text-5xl sm:text-6xl leading-tight pt-4 pb-6 drop-shadow-[0_2px_12px_var(--primary)/25%]">
            {arabic}
          </span>
        </DialogTitle>

        {transliteration && (
          <p className="relative text-sm italic text-muted-foreground tracking-wide">
            {transliteration}
          </p>
        )}
        {translation && (
          <p className="relative text-lg font-semibold text-foreground">
            {translation}
          </p>
        )}

        <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2">
          {hasCoords && (
            <PlayWordButton
              chapter={chapter as number}
              verse={verse as number}
              word={word as number}
              size="md"
            />
          )}
          {root && (
            <Link
              href={`/quran/words/${encodeURIComponent(root)}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
            >
              <span className="opacity-70">Root</span>
              <span className="font-arabic text-sm leading-none">{root}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          )}
        </div>
      </DialogHeader>

      <div className="px-6 pt-5 pb-10 space-y-5">
        {meaning && meaning !== translation && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
              {root ? 'Root Meanings' : 'Meanings'}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{meaning}</p>
          </section>
        )}

        {root && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Other Occurrences with Root
              {occurrencesTotal !== null && (
                <span className="ml-1 text-muted-foreground/50 normal-case tracking-normal">
                  ({occurrencesTotal.toLocaleString()})
                </span>
              )}
            </p>
            <RootWordOccurrences
              rootWord={root}
              onTotalChange={setOccurrencesTotal}
            />
          </section>
        )}

        {!root && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('openInWordLab')}
          </p>
        )}
      </div>
    </DialogContent>
  )
}

// ─── Word-by-word (Arabic) ────────────────────────────────────────────────────

function WordCardItem({
  word,
  chapter,
  verse,
  verseCoordsValid,
  arabicClass,
  selectionActive,
  showTransliteration,
}: {
  word: WordData
  chapter: number
  verse: number
  verseCoordsValid: boolean
  arabicClass: string
  selectionActive: boolean
  showTransliteration: boolean
}) {
  const tx = (word.tx as Record<string, string>) ?? {}
  const arabic = tx['ar'] ?? ''
  const root = word.r ?? undefined
  const translation = tx['en'] ?? ''
  const transliteration = tx['tl']
  const meaning = word.m ?? undefined
  const word1Based = word.wi ?? 0

  const { playingId, preload } = useWordAudio()
  const audioId = wordAudioId(chapter, verse, word1Based)
  const isPlaying = playingId === audioId

  const [dialogOpen, setDialogOpen] = useState(false)
  const open = useCallback(() => {
    if (!selectionActive) setDialogOpen(true)
  }, [selectionActive])
  const warm = useCallback(() => {
    if (verseCoordsValid) preload(chapter, verse, word1Based)
  }, [preload, chapter, verse, word1Based, verseCoordsValid])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Details for ${arabic}`}
        className={`group relative flex h-full flex-col items-center gap-2 px-3.5 py-2.5 cursor-pointer rounded-xl transition-transform duration-150 ${
          isPlaying ? 'bg-primary/10' : 'hover:scale-[1.04]'
        }`}
        onPointerEnter={warm}
        onFocus={warm}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          }
        }}
      >
        <p
          className={`font-arabic ${arabicClass} leading-snug transition-colors ${
            isPlaying ? 'text-primary' : 'group-hover:text-primary'
          }`}
        >
          {arabic}
        </p>
        <div
          className="flex flex-1 flex-col items-center self-stretch gap-0.5"
          dir="ltr"
        >
          {showTransliteration && transliteration && (
            <p className="text-[11px] italic text-muted-foreground text-center wrap-break-words max-w-22">
              {transliteration}
            </p>
          )}
          <p className="text-xs text-foreground/80 font-medium text-center wrap-break-words max-w-22">
            {translation}
          </p>
        </div>
      </div>

      <WordDetailsDialogContent
        arabic={arabic}
        translation={translation}
        transliteration={transliteration}
        root={root}
        meaning={meaning}
        chapter={verseCoordsValid ? chapter : undefined}
        verse={verseCoordsValid ? verse : undefined}
        word={word1Based}
      />
    </Dialog>
  )
}

function WordCompactItem({
  word,
  chapter,
  verse,
  verseCoordsValid,
  arabicClass,
  selectionActive,
}: {
  word: WordData
  chapter: number
  verse: number
  verseCoordsValid: boolean
  arabicClass: string
  selectionActive: boolean
}) {
  const tx = (word.tx as Record<string, string>) ?? {}
  const arabic = tx['ar'] ?? ''
  const translation = tx['en'] ?? ''
  const transliteration = tx['tl']
  const root = word.r ?? undefined
  const meaning = word.m ?? undefined
  const word1Based = word.wi ?? 0

  const { playingId, loadingId, preload } = useWordAudio()
  const audioId = wordAudioId(chapter, verse, word1Based)
  const isPlaying = playingId === audioId
  const isLoading = loadingId === audioId

  const [dialogOpen, setDialogOpen] = useState(false)
  const open = useCallback(() => {
    if (!selectionActive) setDialogOpen(true)
  }, [selectionActive])
  const warm = useCallback(() => {
    if (verseCoordsValid) preload(chapter, verse, word1Based)
  }, [preload, chapter, verse, word1Based, verseCoordsValid])

  const arabicEl = (
    <p
      role="button"
      tabIndex={0}
      aria-label={`Details for ${arabic}`}
      className={`font-arabic ${arabicClass} leading-relaxed transition-all cursor-pointer active:scale-95 ${
        isPlaying
          ? 'text-primary scale-105'
          : 'text-foreground/90 hover:text-primary hover:scale-105'
      }`}
      onPointerEnter={warm}
      onFocus={warm}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
    >
      {arabic}
      {isLoading && (
        <span className="inline-block ml-1 align-middle text-primary">
          <Loader2 className="size-3 inline animate-spin" />
        </span>
      )}
    </p>
  )

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger asChild>{arabicEl}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover/80 backdrop-blur-sm border-primary/20 px-4 py-2 rounded-xl"
        >
          <div className="flex flex-col gap-0.5 py-1 items-center text-center">
            <p className="text-base text-primary">{translation}</p>
            {transliteration && (
              <p className="text-xs font-bold text-foreground">
                {transliteration}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      <WordDetailsDialogContent
        arabic={arabic}
        translation={translation}
        transliteration={transliteration ?? undefined}
        root={root}
        meaning={meaning}
        chapter={verseCoordsValid ? chapter : undefined}
        verse={verseCoordsValid ? verse : undefined}
        word={word1Based}
      />
    </Dialog>
  )
}

const WordByWordView = memo(
  function WordByWordView({
    words,
    verseKey,
    compact,
    showTransliteration,
  }: {
    words: WordData[]
    verseKey: string
    compact: boolean
    showTransliteration: boolean
    /** Forwarded from VerseCard — forces re-render on language reload. */
    optsKey?: string
  }) {
    const sorted = useMemo(
      () => [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0)),
      [words]
    )

    const { chapter, verse } = useMemo(() => {
      const [c, v] = verseKey.split(':')
      return { chapter: Number(c), verse: Number(v) }
    }, [verseKey])
    const verseCoordsValid = Number.isFinite(chapter) && Number.isFinite(verse)

    const { zoomLevel } = useQuranPreferences()
    const arabicClass = ZOOM_FONT[zoomLevel ?? 'comfortable'].arabic
    const selectionActive = useVerseSelection((s) => s.active)

    if (compact) {
      return (
        <div
          dir="rtl"
          className="flex flex-wrap text-right justify-start gap-x-4 gap-y-6 py-2"
        >
          {sorted.map((w) => (
            <WordCompactItem
              key={w.wi ?? 0}
              word={w}
              chapter={chapter}
              verse={verse}
              verseCoordsValid={verseCoordsValid}
              arabicClass={arabicClass}
              selectionActive={selectionActive}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        dir="rtl"
        className="flex flex-wrap items-stretch justify-start gap-y-4 gap-x-1.5 py-3"
      >
        {sorted.map((w) => (
          <WordCardItem
            key={w.wi ?? 0}
            word={w}
            chapter={chapter}
            verse={verse}
            verseCoordsValid={verseCoordsValid}
            arabicClass={arabicClass}
            selectionActive={selectionActive}
            showTransliteration={showTransliteration}
          />
        ))}
      </div>
    )
  },
  (prev, next) =>
    prev.verseKey === next.verseKey &&
    prev.compact === next.compact &&
    prev.showTransliteration === next.showTransliteration &&
    prev.optsKey === next.optsKey
)

// ─── Note editor dialog ───────────────────────────────────────────────────────

function NoteEditorDialog({
  note,
  verseKey,
  scripture,
  open,
  onOpenChange,
}: {
  note: NoteData | null
  verseKey: string
  scripture: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const editor = useCreateBlockNote()
  const { mutate: upsert, isPending: saving } = useUpsertNote(scripture)
  const { mutate: remove, isPending: deleting } = useDeleteNote(scripture)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      const blocks = note?.content
        ? await editor.tryParseMarkdownToBlocks(note.content)
        : [{ type: 'paragraph' as const, content: [] }]
      if (!cancelled) editor.replaceBlocks(editor.document, blocks)
    }
    load()
    return () => { cancelled = true }
  }, [open, note?.content, editor])

  async function handleSave() {
    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    upsert(
      { verseKey, content: markdown.trim() },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleDelete() {
    if (!note) return
    remove({ id: note.id, verseKey }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-sm font-mono tracking-wider uppercase text-muted-foreground">
            Note — {verseKey}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[200px] max-h-[60vh] overflow-y-auto px-2 py-3 [&_.bn-editor]:min-h-[180px] [&_.bn-editor]:text-sm">
          <BlockNoteView editor={editor} theme="light" />
        </div>
        <DialogFooter className="px-5 py-3 border-t flex flex-row items-center gap-2">
          {note && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive mr-auto"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {note ? 'Save' : 'Add note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Verse Card ───────────────────────────────────────────────────────────────

type VerseCardProps = {
  verse: VerseData
  isLast: boolean
  isScrollTarget?: boolean
  /** Stable key derived from language prefs — forces re-render on reload. */
  optsKey: string
  /** Whether this verse is the currently playing audio track. */
  isCurrentAudio?: boolean
  /** Global play state — only relevant when isCurrentAudio is true. */
  isPlaying?: boolean
  /** Buffering state — only relevant when isCurrentAudio is true. */
  isBuffering?: boolean
  /** Hide the audio play button. Default: true (show it). */
  showAudio?: boolean
  /** Hide the copy button. Default: true (show it). */
  showCopyButton?: boolean
  /** Show the bookmark button. Default: false. */
  showBookmark?: boolean
  /** Bookmark category entries for this verse. */
  entries?: BookmarkEntryData[]
  /** Scripture context for bookmark/note mutations. Default: 'quran'. */
  scripture?: string
  /** Show the notes button. Default: false. */
  showNotes?: boolean
  /** Single note for this verse. */
  note?: NoteData | null
  /** When set, verse key badge becomes a link (for search results). */
  verseHref?: string
  /** Search highlight (hl field with <b> tags) to display alongside translation. */
  searchHighlight?: string
}

export const VerseCard = memo(
  function VerseCard({
    verse,
    isLast,
    isScrollTarget = false,
    optsKey,
    isCurrentAudio = false,
    isPlaying = false,
    isBuffering = false,
    showAudio = true,
    showCopyButton = true,
    showBookmark = false,
    entries = [],
    scripture = 'quran',
    showNotes = false,
    note = null,
    verseHref,
    searchHighlight,
  }: VerseCardProps) {
    const prefs = useQuranPreferences()
    const { isRtl } = useLanguagesStore()
    const { data: session } = useSession()
    const openSignIn = useSignInPromptStore((s) => s.open)

    const categories = useBookmarkCategories()
    const { mutate: addEntry, isPending: addingEntry } = useAddBookmarkEntry(scripture)
    const { mutate: removeEntry, isPending: removingEntry } = useRemoveBookmarkEntry(scripture)

    const [notesOpen, setNotesOpen] = useState(false)

    const { playFromVerse, togglePlayPause } = useQuranPlayerCallbacks()

    const primaryCode =
      prefs.primaryLanguage !== 'xl' && prefs.primaryLanguage !== 'none'
        ? prefs.primaryLanguage
        : undefined
    const tr = primaryCode ? verse.tr?.[primaryCode] : undefined
    const secondaryTr =
      prefs.secondaryLanguage &&
      prefs.secondaryLanguage !== 'xl' &&
      prefs.secondaryLanguage !== 'none'
        ? verse.tr?.[prefs.secondaryLanguage]
        : undefined

    const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
    const verseId = verse.vk ?? ''

    const highlightedTranslation = useMemo(() => {
      if (!searchHighlight || !tr?.tx) return null
      const stripped = searchHighlight.replace(/<\/?b>/g, '')
      const isFullText = stripped.length >= tr.tx.length * 0.9
      if (isFullText) return searchHighlight
      const boldedWords = [...searchHighlight.matchAll(/<b>(.*?)<\/b>/g)].map(
        (m) => m[1]
      )
      if (boldedWords.length === 0) return null
      let result = tr.tx
      for (const word of boldedWords) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        result = result.replace(
          new RegExp(
            `(?<![\\p{L}\\p{N}_])(${escaped})(?![\\p{L}\\p{N}_])`,
            'giu'
          ),
          '<b>$1</b>'
        )
      }
      return result
    }, [searchHighlight, tr])

    const audioVerse = useMemo(
      () => ({ verse_id: verseId, ws_quran_text: {} }) satisfies QuranVerse,
      [verseId]
    )

    const selectionActive = useVerseSelection((s) => s.active)
    const isSelected = useVerseSelection((s) =>
      verseId ? s.selected.has(verseId) : false
    )
    const toggleSelection = useVerseSelection((s) => s.toggle)

    const isInteractiveTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null
      return !!node?.closest(
        'button, [role="menuitem"], [data-slot="dropdown-menu-trigger"], [data-slot="dropdown-menu-content"]'
      )
    }

    const onCardContextMenu = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (selectionActive) e.preventDefault()
      },
      [selectionActive]
    )

    const onCardClickCapture = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectionActive || !verseId) return
        if (!isInteractiveTarget(e.target)) {
          e.preventDefault()
          e.stopPropagation()
          toggleSelection(verse)
        }
      },
      [selectionActive, verseId, verse, toggleSelection]
    )

    const handlePlay = useCallback(() => {
      if (isCurrentAudio) {
        togglePlayPause()
      } else {
        playFromVerse(audioVerse)
      }
    }, [isCurrentAudio, togglePlayPause, playFromVerse, audioVerse])

    const isBookmarked = entries.length > 0

    return (
      <div
        id={verseId}
        onContextMenu={onCardContextMenu}
        onClickCapture={onCardClickCapture}
        style={{ WebkitUserSelect: selectionActive ? 'none' : undefined }}
        className={`relative transition-colors duration-500 ${
          isSelected
            ? 'bg-primary/10 before:pointer-events-none before:absolute before:inset-2 before:rounded-2xl before:ring-2 before:ring-primary'
            : ''
        } ${
          !isSelected && (isScrollTarget || isCurrentAudio)
            ? 'bg-primary/10'
            : ''
        } ${selectionActive ? 'cursor-pointer select-none' : ''}`}
      >
        <div className="px-6 py-4 sm:px-8 sm:py-5 space-y-2">
          {/* Subtitle */}
          {prefs.subtitles && tr?.s && (
            <div className="flex justify-center">
              <p className="text-primary text-xs font-bold text-center">
                <QuranRefText text={tr.s} from={`subtitle of ${verse.vk}`} />
              </p>
            </div>
          )}

          {/* Verse key + action buttons */}
          <div className="flex items-center justify-between gap-2">
            {verseHref ? (
              <Link
                href={verseHref}
                target="_blank"
                className="group flex items-center gap-1 w-fit"
              >
                <div className="flex items-start space-x-0.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full transition-colors">
                  <span className="text-lg font-semibold">{chNum}</span>
                  <span>:</span>
                  <span className="text-lg font-semibold">{vNum}</span>
                </div>
                <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ) : (
              <div className="w-fit shrink-0 flex items-start space-x-0.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full">
                <span className="w-full text-lg font-semibold">{chNum}</span>
                <span>:</span>
                <span className="w-full text-lg font-semibold">{vNum}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              {showBookmark && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={isBookmarked ? 'Manage bookmarks' : 'Add to category'}
                      className={`h-8 w-8 rounded-full transition-colors ${
                        isBookmarked
                          ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                      onClick={(e) => {
                        if (!session?.accessToken) {
                          e.preventDefault()
                          openSignIn()
                        }
                      }}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                      Bookmark categories
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No categories yet
                      </div>
                    ) : (
                      categories.map((cat) => {
                        const entry = entries.find((e) => e.category_id === cat.id)
                        return (
                          <DropdownMenuCheckboxItem
                            key={cat.id}
                            checked={!!entry}
                            disabled={addingEntry || removingEntry}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addEntry({ categoryId: cat.id, verseKey: verseId })
                              } else if (entry) {
                                removeEntry({ entryId: entry.id, verseKey: verseId })
                              }
                            }}
                          >
                            <span
                              className="mr-1.5 inline-block w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: cat.color }}
                            />
                            {cat.name}
                          </DropdownMenuCheckboxItem>
                        )
                      })
                    )}
                    <DropdownMenuSeparator />
                    <Link href="/me" className="block">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-sm hover:bg-accent">
                        <Plus className="w-3 h-3" />
                        Manage categories
                      </div>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {showNotes && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={note ? 'Edit note' : 'Add note'}
                  className={`relative h-8 w-8 rounded-full transition-colors ${
                    note
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                  onClick={() => {
                    if (!session?.accessToken) {
                      openSignIn()
                      return
                    }
                    setNotesOpen(true)
                  }}
                >
                  <StickyNote
                    className="w-4 h-4"
                    fill={note ? 'currentColor' : 'none'}
                  />
                </Button>
              )}
              {showCopyButton && (
                <CopyButton verse={verse} searchHighlight={searchHighlight} />
              )}
              {showAudio && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  onClick={handlePlay}
                >
                  {isCurrentAudio && isPlaying ? (
                    isBuffering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4 fill-current" />
                    )
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Primary translation */}
              {prefs.text &&
                primaryCode &&
                (tr?.tx || highlightedTranslation) && (
                  <div className={isRtl(primaryCode) ? 'text-right' : ''}>
                    <p
                      className={`${ZOOM_FONT[prefs.zoomLevel ?? 'comfortable'].translation} leading-relaxed text-foreground select-text font-medium`}
                    >
                      {highlightedTranslation ? (
                        <HighlightText text={highlightedTranslation} />
                      ) : (
                        tr?.tx
                      )}
                    </p>
                  </div>
                )}

              {/* Secondary translation */}
              {secondaryTr?.tx && (
                <p
                  className={`text-muted-foreground leading-relaxed italic ${
                    isRtl(prefs.secondaryLanguage ?? '') ? 'text-right' : ''
                  }`}
                >
                  {secondaryTr.tx}
                </p>
              )}

              {(prefs.arabic || prefs.wordByWord) &&
                verse.w &&
                verse.w.length > 0 && (
                  <div
                    key={prefs.wordByWord ? 'wbw' : 'compact'}
                    className="py-2 animate-in fade-in duration-200"
                  >
                    <WordByWordView
                      words={verse.w}
                      verseKey={verseId}
                      compact={!prefs.wordByWord}
                      showTransliteration={prefs.transliteration}
                      optsKey={optsKey}
                    />
                  </div>
                )}

              {/* Footnotes */}
              {prefs.footnotes && tr?.f && (
                <p
                  className={`text-sm text-muted-foreground/80 leading-relaxed italic ${
                    isRtl(primaryCode ?? 'en') ? 'text-right' : 'text-left'
                  }`}
                >
                  <QuranRefText text={tr.f} from={`footnote of ${verse.vk}`} />
                </p>
              )}
            </div>
          </div>
        </div>

        {!isLast && <hr className="border-border/20 mx-6 sm:mx-8" />}

        <NoteEditorDialog
          note={note}
          verseKey={verseId}
          scripture={scripture}
          open={notesOpen}
          onOpenChange={setNotesOpen}
        />
      </div>
    )
  },
  (prev: VerseCardProps, next: VerseCardProps) =>
    prev.verse === next.verse &&
    prev.isLast === next.isLast &&
    prev.isScrollTarget === next.isScrollTarget &&
    prev.optsKey === next.optsKey &&
    prev.searchHighlight === next.searchHighlight &&
    prev.verseHref === next.verseHref &&
    prev.showAudio === next.showAudio &&
    prev.showCopyButton === next.showCopyButton &&
    prev.showBookmark === next.showBookmark &&
    prev.entries?.length === next.entries?.length &&
    prev.showNotes === next.showNotes &&
    prev.note?.id === next.note?.id &&
    prev.note?.updated_at === next.note?.updated_at &&
    prev.isCurrentAudio === next.isCurrentAudio &&
    (!next.isCurrentAudio ||
      (prev.isPlaying === next.isPlaying &&
        prev.isBuffering === next.isBuffering))
)
