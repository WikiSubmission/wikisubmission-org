'use client'

import { createElement, useCallback, useEffect, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  ArrowRight,
  Ban,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  Languages,
  ListTree,
  Table,
} from 'lucide-react'
import { wsApi } from '@/src/api/client'
import { parseQuranRefs } from '@/lib/verse-ref-parser'
import { normalizeQuranInput } from '@/lib/scripture-parser'
import {
  buildMultiVerseMarkdown,
  buildVerseTable,
  buildWordTable,
  type CopyMarkdownOptions,
} from '@/lib/quran-copy'
import { canCopyImage, copyVersesImage } from '@/lib/quran-copy-image'
import { useCopyPrefs } from '@/lib/quran-copy-prefs'
import { writeTableToClipboard } from '@/lib/clipboard-table'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranVerseList } from '@/lib/offline/quran-adapter'
import { contentLangForUiLocale } from '@/constants/ui-locales'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import { useCommandMenu } from '../use-command-menu'
import {
  draftRecipe,
  selectCopyStep,
  useCopyDraft,
  type CopyDraft,
  type CopyOutput,
  type CopyRecipe,
} from '../use-copy-draft'
import type { components } from '@/src/api/types.gen'
import type { Command } from '../types'

type VerseData = components['schemas']['VerseData']

/** The compact `verses=` parameter accepts at most 300 refs per request. */
const MAX_REFS = 300

/** The menu is mounted app-wide, but only the Quran layout seeds the language store. */
const FALLBACK_LANGUAGES = [{ code: 'en', name: 'English' }]

const OUTPUT_KEY: Record<CopyOutput, string> = {
  text: 'copyAsText',
  table: 'copyAsTable',
  image: 'copyAsImage',
}

/** The three fields the tree does not ask about, which stay on reader preferences. */
type DisplayPrefs = Pick<
  CopyMarkdownOptions,
  'includeSubtitles' | 'includeTransliteration' | 'includeFootnotes'
>

function optionsFor(recipe: CopyRecipe, display: DisplayPrefs): CopyMarkdownOptions {
  return {
    primaryCode: recipe.primary !== 'none' ? recipe.primary : 'en',
    secondaryCode: recipe.secondary !== 'none' ? recipe.secondary : undefined,
    includeText: recipe.primary !== 'none',
    includeArabic: recipe.arabic === 'yes',
    ...display,
  }
}

function langsFor(options: CopyMarkdownOptions): string[] {
  const langs: string[] = []
  if (options.includeText) langs.push(options.primaryCode)
  if (options.includeArabic) langs.push('ar')
  if (options.secondaryCode && !langs.includes(options.secondaryCode)) {
    langs.push(options.secondaryCode)
  }
  // The endpoint needs a language even when the answers add up to verse keys and
  // nothing else, which is what "no Arabic, no translation" amounts to.
  return langs.length > 0 ? langs : ['en']
}

/** Renders a set of answers as short chips, for the strip and the repeat row. */
function useChips() {
  const tMenu = useTranslations('commandMenu')
  return useCallback(
    (answers: Partial<CopyRecipe>, refs?: string | null): string[] => {
      const chips: string[] = []
      if (refs) chips.push(refs)
      if (answers.granularity) {
        chips.push(tMenu(answers.granularity === 'full' ? 'copyVerseByVerse' : 'copyWordByWord'))
      }
      // A skipped step reads as an absence, which is what it means for the output.
      if (answers.arabic === 'yes') chips.push(tMenu('copyArabic'))
      if (answers.primary && answers.primary !== 'none') chips.push(answers.primary.toUpperCase())
      if (answers.secondary && answers.secondary !== 'none') {
        chips.push(answers.secondary.toUpperCase())
      }
      if (answers.output) chips.push(tMenu(OUTPUT_KEY[answers.output]))
      return chips
    },
    [tMenu],
  )
}

/**
 * The `copy-verses` sub-page: a decision tree that ends in a copy.
 *
 * One question per screen — reference, granularity, Arabic, translation, second
 * translation — and only then the output formats. The flat list this replaced
 * offered five copy variants that all silently followed the reader's display
 * preferences, so what landed on the clipboard depended on settings the user was
 * not looking at; each choice is now asked for explicitly and shown back as a
 * chip strip above the list.
 *
 * Answers live in `useCopyDraft` rather than local state so Backspace can walk
 * back through them (see `stepBack`) instead of dropping out of the page, and so
 * the last completed set survives as a recipe the reference step can repeat in
 * one keystroke. Subtitles, transliteration, and footnotes stay on reader
 * preferences — the tree would be twice as deep for three fields that rarely
 * change per copy.
 *
 * Fetching prefers installed offline bundles and falls back to the compact
 * `verses=` form of `/quran`, which is the same order the reader itself uses.
 */
export function useCopyByReferenceCommands(active: boolean, query: string): Command[] {
  const t = useTranslations('quran.copy')
  const tMenu = useTranslations('commandMenu')
  const { markdown: readerPrefs } = useCopyPrefs()
  const locale = useLocale()
  const storeLanguages = useLanguagesStore((s) => s.languages)
  const chips = useChips()

  const refs = useCopyDraft((s) => s.refs)
  const granularity = useCopyDraft((s) => s.granularity)
  const arabic = useCopyDraft((s) => s.arabic)
  const primary = useCopyDraft((s) => s.primary)
  const secondary = useCopyDraft((s) => s.secondary)
  const recent = useCopyDraft((s) => s.recent)
  const choose = useCopyDraft((s) => s.choose)
  const remember = useCopyDraft((s) => s.remember)
  const reset = useCopyDraft((s) => s.reset)

  // Leaving the page abandons the draft, so entering it always starts over at
  // the reference rather than resuming a half-answered tree from earlier.
  useEffect(() => {
    if (!active) reset()
  }, [active, reset])

  /** The language the interface is in, which is the likeliest translation to want. */
  const uiLang = contentLangForUiLocale(locale)

  const translations = useMemo(() => {
    const entries = storeLanguages.length ? storeLanguages : FALLBACK_LANGUAGES
    const usable = entries
      // Arabic is the scripture text itself and has its own step, so listing it
      // as a translation here would put the same block on the clipboard twice.
      .filter((language) => language.code && language.code !== 'ar')
      .map((language) => ({
        code: language.code as string,
        name: language.name ?? (language.code as string),
      }))
    // The interface language leads the list and is preselected by the ranker.
    return [
      ...usable.filter((language) => language.code === uiLang),
      ...usable.filter((language) => language.code !== uiLang),
    ]
  }, [storeLanguages, uiLang])

  const display = useMemo<DisplayPrefs>(
    () => ({
      includeSubtitles: readerPrefs.includeSubtitles,
      includeTransliteration: readerPrefs.includeTransliteration,
      includeFootnotes: readerPrefs.includeFootnotes,
    }),
    [readerPrefs],
  )

  const fetchVerses = useCallback(
    async (references: string, langs: string[], includeWords: boolean): Promise<VerseData[]> => {
      const store = getRegisteredOfflineContentStore()
      if (store) {
        try {
          const offline = await offlineQuranVerseList(
            store,
            langs,
            references,
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
            verses: references,
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
    [],
  )

  /**
   * Fetches and copies in one go, from a complete recipe.
   *
   * Both the finished tree and the repeat row on the reference step come through
   * here, so a repeat cannot drift from the answers it is repeating. A recipe is
   * only remembered once its copy has actually landed.
   */
  const runCopy = useCallback(
    async (recipe: CopyRecipe, references: string) => {
      const options = optionsFor(recipe, display)
      const wbw = recipe.granularity === 'wbw'
      try {
        const verses = await fetchVerses(references, langsFor(options), wbw)
        if (verses.length === 0) {
          toast.error(tMenu('noVersesFound'))
          return
        }

        if (recipe.output === 'image') {
          await copyVersesImage(verses, wbw ? 'wbw' : 'full', { prefs: options })
        } else if (recipe.output === 'table') {
          const build = wbw ? buildWordTable : buildVerseTable
          await writeTableToClipboard({
            html: build(verses, 'html', options),
            tsv: build(verses, 'tsv', options),
            markdown: build(verses, 'markdown', options),
          })
        } else {
          await navigator.clipboard.writeText(
            buildMultiVerseMarkdown(verses, wbw ? 'wbw' : 'full', options),
          )
        }

        remember(recipe)
        toast.success(recipe.output === 'image' ? t('done_image') : t('done_text'))
      } catch {
        toast.error(recipe.output === 'image' ? t('error_image') : t('error_text'))
      }
    },
    [display, fetchVerses, remember, t, tMenu],
  )

  return useMemo(() => {
    if (!active) return []

    const advance = (answer: Partial<CopyDraft>) => {
      choose(answer)
      // The input holds the reference on the first step and a filter on the
      // rest, so it is cleared on every hop instead of carried forward.
      useCommandMenu.getState().setQuery('')
    }

    const step = selectCopyStep({ refs, granularity, arabic, primary, secondary })

    // ── 1. The reference ─────────────────────────────────────────────────────
    if (step === 'ref') {
      const parsed = normalizeQuranInput(query.trim())
      if (!parsed) return []
      // Expanding also gives the exact verse count, which the ref cap is
      // measured against and which the rows show as their hint.
      const count = parseQuranRefs(parsed).length
      if (count === 0) return []
      const tooMany = count > MAX_REFS

      const commands: Command[] = [
        {
          id: 'ref:continue',
          group: 'actions',
          label: tMenu('copyContinue', { refs: parsed }),
          description: tooMany ? tMenu('tooManyVerses', { max: MAX_REFS }) : undefined,
          hint: String(count),
          icon: createElement(ArrowRight),
          priority: 90,
          keepOpen: true,
          run: () => {
            if (tooMany) {
              toast.error(tMenu('tooManyVerses', { max: MAX_REFS }))
              return
            }
            advance({ refs: parsed })
          },
        },
      ]

      // Repeating the last answers is the likelier intent when there are any, so
      // it leads. Skipped where the browser cannot write images, which is the one
      // recipe that would fail on arrival.
      if (recent && !tooMany && (recent.output !== 'image' || canCopyImage())) {
        commands.unshift({
          id: 'ref:repeat',
          group: 'actions',
          label: tMenu('copyLastSettings', { refs: parsed }),
          description: chips(recent).join(' · '),
          hint: String(count),
          icon: createElement(History),
          keywords: ['again', 'repeat', 'last'],
          priority: 95,
          run: () => runCopy(recent, parsed),
        })
      }

      return commands
    }

    // ── 2. Whole verses or one line per word ─────────────────────────────────
    if (step === 'granularity') {
      return [
        {
          id: 'ref:granularity:full',
          group: 'actions',
          label: tMenu('copyVerseByVerse'),
          description: tMenu('copyVerseByVerseHint'),
          icon: createElement(FileText),
          priority: 90,
          keepOpen: true,
          run: () => advance({ granularity: 'full' }),
        },
        {
          id: 'ref:granularity:wbw',
          group: 'actions',
          label: tMenu('copyWordByWord'),
          description: tMenu('copyWordByWordHint'),
          icon: createElement(ListTree),
          keywords: ['wbw', 'morphology', 'root'],
          priority: 80,
          keepOpen: true,
          run: () => advance({ granularity: 'wbw' }),
        },
      ]
    }

    // ── 3. Arabic ────────────────────────────────────────────────────────────
    if (step === 'arabic') {
      return [
        {
          id: 'ref:arabic:yes',
          group: 'actions',
          label: tMenu('copyWithArabic'),
          icon: createElement(Languages),
          priority: 90,
          keepOpen: true,
          run: () => advance({ arabic: 'yes' }),
        },
        {
          id: 'ref:arabic:no',
          group: 'actions',
          label: tMenu('copyWithoutArabic'),
          icon: createElement(Ban),
          priority: 80,
          keepOpen: true,
          run: () => advance({ arabic: 'no' }),
        },
      ]
    }

    // ── 4. Translation, defaulting to the interface language ─────────────────
    if (step === 'translation') {
      const commands: Command[] = translations.map((language) => ({
        id: `ref:translation:${language.code}`,
        group: 'actions',
        label: language.name,
        icon: createElement(Languages),
        hint: language.code === uiLang ? tMenu('copyCurrentLanguage') : language.code.toUpperCase(),
        keywords: [language.code, language.name],
        // The interface language wins the default selection; the rest keep the
        // order the backend listed them in.
        priority: language.code === uiLang ? 95 : 70,
        keepOpen: true,
        run: () => advance({ primary: language.code }),
      }))

      // Dropping the translation as well as the Arabic would leave nothing but
      // verse keys to copy, so it is only offered when Arabic is in.
      if (arabic === 'yes') {
        commands.push({
          id: 'ref:translation:none',
          group: 'actions',
          label: tMenu('copyNoTranslation'),
          icon: createElement(Ban),
          priority: 60,
          keepOpen: true,
          run: () => advance({ primary: 'none' }),
        })
      }

      return commands
    }

    // ── 5. An optional second translation ────────────────────────────────────
    if (step === 'extra') {
      const commands: Command[] = [
        {
          id: 'ref:secondary:none',
          group: 'actions',
          label: tMenu('copyNoSecondTranslation'),
          icon: createElement(Ban),
          priority: 95,
          keepOpen: true,
          run: () => advance({ secondary: 'none' }),
        },
      ]

      for (const language of translations) {
        if (language.code === primary) continue
        commands.push({
          id: `ref:secondary:${language.code}`,
          group: 'actions',
          label: language.name,
          icon: createElement(Languages),
          hint: language.code.toUpperCase(),
          keywords: [language.code, language.name],
          priority: 70,
          keepOpen: true,
          run: () => advance({ secondary: language.code }),
        })
      }

      return commands
    }

    // ── 6. The copy itself ───────────────────────────────────────────────────
    const references = refs as string
    const draft = { refs, granularity, arabic, primary, secondary }
    const count = parseQuranRefs(references).length
    const wbw = granularity === 'wbw'

    const outputCommand = (output: CopyOutput, icon: Command['icon'], priority: number): Command => {
      const recipe = draftRecipe(draft, output)
      return {
        id: `ref:copy-${output}`,
        group: 'actions',
        label: output === 'table' && wbw ? tMenu('copyWordTable') : tMenu(OUTPUT_KEY[output]),
        description:
          output === 'table'
            ? wbw
              ? tMenu('copyWordTableHint')
              : tMenu('copyAsTableHint')
            : undefined,
        hint: String(count),
        icon,
        keywords: output === 'table' ? ['tsv', 'csv', 'spreadsheet', 'excel'] : undefined,
        priority,
        run: () => (recipe ? runCopy(recipe, references) : Promise.resolve()),
      }
    }

    const commands: Command[] = [
      outputCommand('text', createElement(FileText), 90),
      outputCommand('table', createElement(Table), 80),
    ]

    if (canCopyImage()) {
      commands.push(outputCommand('image', createElement(ImageIcon), 70))
    }

    commands.push({
      id: 'ref:open',
      group: 'actions',
      label: tMenu('openAsVerseList'),
      hint: String(count),
      icon: createElement(ExternalLink),
      priority: 60,
      navigate: `/quran/${references}`,
    })

    return commands
  }, [
    active,
    query,
    refs,
    granularity,
    arabic,
    primary,
    secondary,
    recent,
    choose,
    chips,
    translations,
    uiLang,
    runCopy,
    tMenu,
  ])
}

/** The answers so far, as chips for the strip above the list. */
export function useCopyDraftSummary(): string[] {
  const chips = useChips()
  const refs = useCopyDraft((s) => s.refs)
  const granularity = useCopyDraft((s) => s.granularity)
  const arabic = useCopyDraft((s) => s.arabic)
  const primary = useCopyDraft((s) => s.primary)
  const secondary = useCopyDraft((s) => s.secondary)

  return useMemo(
    () =>
      chips(
        {
          granularity: granularity ?? undefined,
          arabic: arabic ?? undefined,
          primary: primary ?? undefined,
          secondary: secondary ?? undefined,
        },
        refs,
      ),
    [chips, refs, granularity, arabic, primary, secondary],
  )
}
