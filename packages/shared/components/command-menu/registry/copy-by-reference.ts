'use client'

import { createElement, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { ExternalLink, FileText, Image as ImageIcon, ListTree, Table } from 'lucide-react'
import { wsApi } from '@/src/api/client'
import { parseQuranRefs } from '@/lib/verse-ref-parser'
import { normalizeQuranInput } from '@/lib/scripture-parser'
import {
  buildMultiVerseMarkdown,
  buildVerseTable,
  buildWordTable,
} from '@/lib/quran-copy'
import { canCopyImage, copyVersesImage } from '@/lib/quran-copy-image'
import { useCopyPrefs } from '@/lib/quran-copy-prefs'
import { writeTableToClipboard } from '@/lib/clipboard-table'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranVerseList } from '@/lib/offline/quran-adapter'
import type { components } from '@/src/api/types.gen'
import type { Command } from '../types'

type VerseData = components['schemas']['VerseData']

/** The compact `verses=` parameter accepts at most 300 refs per request. */
const MAX_REFS = 300

/**
 * The `copy-verses` sub-page: type a reference, get the verses, copy them.
 *
 * Rows only appear once the typed text parses as at least one reference, so the
 * page reads as a prompt until the input means something. Fetching prefers
 * installed offline bundles and falls back to the compact `verses=` form of
 * `/quran`, which is the same order the reader itself uses.
 */
export function useCopyByReferenceCommands(query: string): Command[] {
  const t = useTranslations('quran.copy')
  const tMenu = useTranslations('commandMenu')
  const { markdown, image } = useCopyPrefs()

  const langs = useMemo(() => {
    const out = [markdown.primaryCode]
    if (markdown.includeArabic && !out.includes('ar')) out.push('ar')
    if (markdown.secondaryCode && !out.includes(markdown.secondaryCode)) {
      out.push(markdown.secondaryCode)
    }
    return out
  }, [markdown.primaryCode, markdown.includeArabic, markdown.secondaryCode])

  const fetchVerses = useCallback(
    async (refs: string, includeWords: boolean): Promise<VerseData[]> => {
      const store = getRegisteredOfflineContentStore()
      if (store) {
        try {
          const offline = await offlineQuranVerseList(
            store,
            langs,
            refs,
            includeWords ? { lang: 'en', includeRoot: true, includeMeaning: true } : undefined,
          )
          const verses = offline?.chapters?.flatMap((chapter) => chapter.verses ?? []) ?? []
          if (verses.length > 0) return verses
        } catch {
          // Fall through to the network.
        }
      }

      const { data, error } = await wsApi.GET('/quran', {
        params: {
          query: {
            verses: refs,
            langs,
            include_words: includeWords || undefined,
            include_root: includeWords || undefined,
            include_meaning: includeWords || undefined,
            word_langs: includeWords ? ['ar', 'en', 'tl'] : undefined,
          },
        },
      })
      if (error || !data) throw new Error('fetch failed')
      return data.chapters?.flatMap((chapter) => chapter.verses ?? []) ?? []
    },
    [langs],
  )

  return useMemo(() => {
    const refs = normalizeQuranInput(query.trim())
    if (!refs) return []
    // Expanding also gives the exact verse count, which the ref cap is measured
    // against and which each row shows as its hint.
    const refCount = parseQuranRefs(refs).length
    if (refCount === 0) return []
    const tooMany = refCount > MAX_REFS

    const run = async (
      action: (verses: VerseData[]) => Promise<void>,
      includeWords: boolean,
    ) => {
      if (tooMany) {
        toast.error(tMenu('tooManyVerses', { max: MAX_REFS }))
        return
      }
      try {
        const verses = await fetchVerses(refs, includeWords)
        if (verses.length === 0) {
          toast.error(tMenu('noVersesFound'))
          return
        }
        await action(verses)
      } catch {
        toast.error(t('error_text'))
      }
    }

    const label = (key: string) => `${refs} — ${key}`

    const commands: Command[] = [
      {
        id: 'ref:copy-text',
        group: 'actions',
        label: label(t('full_verse_text')),
        hint: String(refCount),
        icon: createElement(FileText),
        priority: 90,
        run: () =>
          run(async (verses) => {
            await navigator.clipboard.writeText(
              buildMultiVerseMarkdown(verses, 'full', markdown),
            )
            toast.success(t('done_text'))
          }, false),
      },
      {
        id: 'ref:copy-wbw-text',
        group: 'actions',
        label: label(t('word_by_word_text')),
        hint: String(refCount),
        icon: createElement(ListTree),
        priority: 80,
        run: () =>
          run(async (verses) => {
            await navigator.clipboard.writeText(
              buildMultiVerseMarkdown(verses, 'wbw', markdown),
            )
            toast.success(t('done_text'))
          }, true),
      },
      {
        id: 'ref:copy-table',
        group: 'actions',
        label: label(tMenu('copyAsTable')),
        hint: String(refCount),
        icon: createElement(Table),
        priority: 75,
        run: () =>
          run(async (verses) => {
            await writeTableToClipboard({
              html: buildVerseTable(verses, 'html', markdown),
              tsv: buildVerseTable(verses, 'tsv', markdown),
              markdown: buildVerseTable(verses, 'markdown', markdown),
            })
            toast.success(t('done_text'))
          }, false),
      },
      {
        id: 'ref:copy-word-table',
        group: 'actions',
        label: label(tMenu('copyWordTable')),
        hint: String(refCount),
        icon: createElement(Table),
        priority: 70,
        run: () =>
          run(async (verses) => {
            await writeTableToClipboard({
              html: buildWordTable(verses, 'html', markdown),
              tsv: buildWordTable(verses, 'tsv', markdown),
              markdown: buildWordTable(verses, 'markdown', markdown),
            })
            toast.success(t('done_text'))
          }, true),
      },
    ]

    if (canCopyImage()) {
      commands.push({
        id: 'ref:copy-image',
        group: 'actions',
        label: label(t('full_verse_image')),
        hint: String(refCount),
        icon: createElement(ImageIcon),
        priority: 65,
        run: () =>
          run(async (verses) => {
            await copyVersesImage(verses, 'full', image)
            toast.success(t('done_image'))
          }, false),
      })
    }

    commands.push({
      id: 'ref:open',
      group: 'actions',
      label: label(tMenu('openAsVerseList')),
      hint: String(refCount),
      icon: createElement(ExternalLink),
      priority: 60,
      navigate: `/quran/${refs}`,
    })

    return commands
  }, [query, fetchVerses, markdown, image, t, tMenu])
}
