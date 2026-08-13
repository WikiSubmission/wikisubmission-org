'use client'

import { createElement, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Copy,
  FileText,
  Image as ImageIcon,
  ListTree,
  Play,
  SkipBack,
  SkipForward,
  SquareCheck,
  Table,
} from 'lucide-react'
import {
  buildMultiVerseMarkdown,
  buildVerseMarkdown,
  buildVerseTable,
  buildWordByWordMarkdown,
  buildWordTable,
} from '@/lib/quran-copy'
import { canCopyImage, copyVersesImage } from '@/lib/quran-copy-image'
import { useCopyPrefs } from '@/lib/quran-copy-prefs'
import { writeTableToClipboard } from '@/lib/clipboard-table'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import { useQuranPlayerCallbacks } from '@/lib/quran-audio-context'
import { toQuranVerse } from '@/components/quran-reader/verse-card'
import type { components } from '@/src/api/types.gen'
import type { Command } from '../types'

type VerseData = components['schemas']['VerseData']

/**
 * Commands that act on the verses currently in view.
 *
 * Scope resolves at run time, not render time, so the rows do not churn as the
 * reader scrolls: an active multi-selection wins, otherwise the verse at the
 * viewport centre. Both come from `useReaderContext`, read through `getState()`
 * inside each handler.
 *
 * Every copy variant delegates to the same builders the verse card's copy button
 * uses, so the menu cannot drift from the buttons.
 */
export function useVerseCommands(): Command[] {
  const t = useTranslations('quran.copy')
  const tMenu = useTranslations('commandMenu')
  const { markdown, image } = useCopyPrefs()
  const activateSelection = useVerseSelection((s) => s.activate)
  const clearSelection = useVerseSelection((s) => s.clear)
  const selectionCount = useVerseSelection((s) => s.selected.size)
  const { playFromVerse, togglePlayPause, nextVerse, prevVerse } = useQuranPlayerCallbacks()

  // Subscribed so the group appears and disappears with the reader, but the
  // verse identity itself is read lazily inside the handlers.
  const hasReaderContext = useReaderContext(
    (s) => s.loadedVerses.length > 0 || s.results !== null,
  )

  return useMemo(() => {
    // Copy-by-reference does not need a reader at all, so it must survive the
    // early return below and stay reachable from any page.
    const copyByRefCommand: Command = {
      id: 'verse:copy-by-ref',
      group: 'actions',
      label: tMenu('copyByReference'),
      description: tMenu('copyByReferenceHint'),
      icon: createElement(Copy),
      page: 'copy-verses',
      priority: 72,
      keywords: ['2:255', 'range', 'reference'],
    }

    if (!hasReaderContext) return [copyByRefCommand]

    /** The verses a command should act on: the selection, else the centre verse. */
    const targetVerses = (): VerseData[] => {
      const selected = useVerseSelection.getState().ordered()
      if (selected.length > 0) return selected
      const { currentVerseKey, loadedVerses } = useReaderContext.getState()
      const current = currentVerseKey
        ? loadedVerses.find((verse) => verse.vk === currentVerseKey)
        : undefined
      return current ? [current] : loadedVerses.slice(0, 1)
    }

    const scopeHint = () =>
      selectionCount > 0 ? t('selected', { count: selectionCount }) : undefined

    const runText = async (kind: 'full' | 'wbw') => {
      const verses = targetVerses()
      if (verses.length === 0) return
      try {
        const text =
          verses.length === 1
            ? kind === 'full'
              ? buildVerseMarkdown(verses[0]!, markdown)
              : buildWordByWordMarkdown(verses[0]!, markdown)
            : buildMultiVerseMarkdown(verses, kind, markdown)
        await navigator.clipboard.writeText(text)
        toast.success(t('done_text'))
      } catch {
        toast.error(t('error_text'))
      }
    }

    const runImage = async (kind: 'full' | 'wbw') => {
      const verses = targetVerses()
      if (verses.length === 0) return
      try {
        await copyVersesImage(verses, kind, image)
        toast.success(t('done_image'))
      } catch {
        toast.error(t('error_image'))
      }
    }

    const runTable = async (kind: 'verses' | 'words') => {
      const verses = targetVerses()
      if (verses.length === 0) return
      const build = kind === 'verses' ? buildVerseTable : buildWordTable
      try {
        await writeTableToClipboard({
          html: build(verses, 'html', markdown),
          tsv: build(verses, 'tsv', markdown),
          markdown: build(verses, 'markdown', markdown),
        })
        toast.success(t('done_text'))
      } catch {
        toast.error(t('error_text'))
      }
    }

    const commands: Command[] = [
      {
        id: 'verse:copy-text',
        group: 'actions',
        label: t('full_verse_text'),
        hint: scopeHint(),
        icon: createElement(FileText),
        priority: 90,
        run: () => runText('full'),
      },
      {
        id: 'verse:copy-wbw-text',
        group: 'actions',
        label: t('word_by_word_text'),
        hint: scopeHint(),
        icon: createElement(ListTree),
        priority: 80,
        run: () => runText('wbw'),
      },
      {
        id: 'verse:copy-table',
        group: 'actions',
        label: tMenu('copyAsTable'),
        description: tMenu('copyAsTableHint'),
        hint: scopeHint(),
        icon: createElement(Table),
        priority: 75,
        keywords: ['tsv', 'csv', 'spreadsheet', 'excel'],
        run: () => runTable('verses'),
      },
      {
        id: 'verse:copy-word-table',
        group: 'actions',
        label: tMenu('copyWordTable'),
        description: tMenu('copyWordTableHint'),
        hint: scopeHint(),
        icon: createElement(Table),
        priority: 70,
        keywords: ['morphology', 'root', 'tsv', 'spreadsheet'],
        run: () => runTable('words'),
      },
    ]

    if (canCopyImage()) {
      commands.push(
        {
          id: 'verse:copy-image',
          group: 'actions',
          label: t('full_verse_image'),
          hint: scopeHint(),
          icon: createElement(ImageIcon),
          priority: 65,
          run: () => runImage('full'),
        },
        {
          id: 'verse:copy-wbw-image',
          group: 'actions',
          label: t('word_by_word_image'),
          hint: scopeHint(),
          icon: createElement(ImageIcon),
          priority: 60,
          run: () => runImage('wbw'),
        },
      )
    }

    if (selectionCount > 0) {
      commands.push({
        id: 'verse:clear-selection',
        group: 'actions',
        label: t('cancel'),
        hint: t('selected', { count: selectionCount }),
        icon: createElement(SquareCheck),
        priority: 55,
        run: () => clearSelection(),
      })
    } else {
      commands.push({
        id: 'verse:select-multiple',
        group: 'actions',
        label: t('select_multiple'),
        icon: createElement(SquareCheck),
        priority: 55,
        run: () => {
          const [first] = targetVerses()
          if (first) activateSelection(first)
        },
      })
    }

    commands.push(
      {
        id: 'verse:play',
        group: 'actions',
        label: tMenu('playFromHere'),
        icon: createElement(Play),
        priority: 85,
        run: () => {
          const [first] = targetVerses()
          if (first) playFromVerse(toQuranVerse(first))
        },
      },
      {
        id: 'verse:toggle-play',
        group: 'actions',
        label: tMenu('togglePlayback'),
        icon: createElement(Play),
        priority: 50,
        keepOpen: true,
        run: () => togglePlayPause(),
      },
      {
        id: 'verse:next',
        group: 'actions',
        label: tMenu('nextVerse'),
        icon: createElement(SkipForward),
        priority: 45,
        keepOpen: true,
        run: () => nextVerse(),
      },
      {
        id: 'verse:prev',
        group: 'actions',
        label: tMenu('previousVerse'),
        icon: createElement(SkipBack),
        priority: 45,
        keepOpen: true,
        run: () => prevVerse(),
      },
    )

    commands.push(copyByRefCommand)

    return commands
  }, [
    hasReaderContext,
    selectionCount,
    markdown,
    image,
    t,
    tMenu,
    activateSelection,
    clearSelection,
    playFromVerse,
    togglePlayPause,
    nextVerse,
    prevVerse,
  ])
}
