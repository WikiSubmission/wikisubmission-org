'use client'

import { createElement, useCallback, useEffect, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Ban,
  Copy,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  Languages,
  ListTree,
  Plus,
  Table,
} from 'lucide-react'
import { wsApi } from '@/src/api/client'
import { parseQuranRefs } from '@/lib/verse-ref-parser'
import {
  COPY_MODIFIERS,
  copyCommandTokens,
  parseCopyCommand,
  withCopyToken,
  type CopyOutput,
  type CopyRecipe,
} from '@/lib/copy-command'
import { normalizeForSearch } from '@/lib/text-normalization/normalize'
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
import { draftRecipe, selectCopyStep, useCopyDraft, type CopyDraft } from '../use-copy-draft'
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

/** The three fields neither form asks about, which stay on reader preferences. */
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
    includeFootnotes: recipe.footnotes === 'exclude' ? false : display.includeFootnotes,
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

/**
 * Renders a set of answers as short chips, for the tree's strip and the
 * one-liner's description. The reference is passed separately because the run
 * row already carries it in its label.
 */
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
      if (answers.footnotes === 'exclude') chips.push(tMenu('copyWithoutFootnotes'))
      return chips
    },
    [tMenu],
  )
}

/**
 * The `copy-verses` sub-page and root reference detector share one copy runner.
 *
 * The reference step reads a whole command — `2:255 ar en fr wbw` — and offers
 * the next token as completions, so a reader who knows what they want types it
 * in one line and presses Enter. On the root menu, the same parser recognizes a
 * reference-shaped query and offers direct Navigate and Copy actions.
 *
 * Answers live in `useCopyDraft` rather than local state so Backspace can walk
 * back through them (see `stepBack`) instead of dropping out of the page, and so
 * the last completed command survives as the line the page pre-fills next time.
 * Subtitles, transliteration, and footnotes stay on reader preferences: they
 * would double the depth of both forms for three fields that rarely change.
 *
 * Fetching prefers installed offline bundles and falls back to the compact
 * `verses=` form of `/quran`, which is the same order the reader itself uses.
 */
export function useCopyByReferenceCommands(
  mode: 'inactive' | 'root' | 'page',
  query: string,
): Command[] {
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
    if (mode !== 'page') reset()
  }, [mode, reset])

  /** The language the interface is in, which is the likeliest translation to want. */
  const uiLang = contentLangForUiLocale(locale)

  const translations = useMemo(() => {
    const entries = storeLanguages.length ? storeLanguages : FALLBACK_LANGUAGES
    const usable = entries
      // Arabic is the scripture text itself and has its own answer, so listing it
      // as a translation would put the same block on the clipboard twice.
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

  const languageCodes = useMemo(
    () => translations.map((language) => language.code),
    [translations],
  )

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
   * Fetches and copies in one go, from a complete command.
   *
   * The typed line and the finished tree both come through here, so the two
   * forms cannot drift. A command is only remembered once its copy has landed.
   */
  const runCopy = useCallback(
    async (recipe: CopyRecipe) => {
      if (parseQuranRefs(recipe.refs).length > MAX_REFS) {
        toast.error(tMenu('tooManyVerses', { max: MAX_REFS }))
        return
      }

      const options = optionsFor(recipe, display)
      const wbw = recipe.granularity === 'wbw'
      try {
        const verses = await fetchVerses(recipe.refs, langsFor(options), wbw)
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
    if (mode === 'inactive') return []

    const detected = parseCopyCommand(query, languageCodes, uiLang)
    if (mode === 'root') {
      if (!detected.recipe) return []
      const recipe = detected.recipe
      const tooMany = detected.count > MAX_REFS
      return [
        {
          id: 'ref:detected:navigate',
          group: 'actions',
          label: tMenu('navigateToReference', { refs: recipe.refs }),
          hint: String(detected.count),
          icon: createElement(ExternalLink),
          keywords: [recipe.refs, query],
          priority: 100,
          navigate: `/quran/${recipe.refs}`,
        },
        {
          id: 'ref:detected:copy',
          group: 'actions',
          label: tMenu('copyCommandRun', { refs: recipe.refs }),
          description: tooMany
            ? tMenu('tooManyVerses', { max: MAX_REFS })
            : chips(recipe).join(' · '),
          hint: String(detected.count),
          icon: createElement(Copy),
          keywords: [recipe.refs, query],
          priority: 95,
          keepOpen: tooMany,
          run: () => runCopy(recipe),
        },
      ]
    }

    const setQuery = (value: string) => useCommandMenu.getState().setQuery(value)
    const advance = (answer: Partial<CopyDraft>) => {
      choose(answer)
      // The input holds the command on the first step and a filter on the rest,
      // so it is cleared on every hop instead of carried forward.
      setQuery('')
    }

    const step = selectCopyStep({ refs, granularity, arabic, primary, secondary })

    // ── The command line, with the next token as completions ─────────────────
    if (step === 'ref') {
      const command = parseCopyCommand(query, languageCodes, uiLang)
      if (!command.recipe) return []
      const recipe = command.recipe
      const tooMany = command.count > MAX_REFS

      // While a token is half-typed the completions lead, so Enter finishes the
      // word. With nothing pending, Enter is the copy.
      const completing = command.partial.length > 0
      const used = new Set(command.tokens)
      const usedKinds = new Set(
        COPY_MODIFIERS.filter((modifier) => used.has(modifier.token)).map((m) => m.kind),
      )
      const languageCount = command.tokens.filter((token) =>
        languageCodes.includes(token),
      ).length

      const commands: Command[] = [
        {
          id: 'ref:run',
          group: 'actions',
          label: tMenu('copyCommandRun', { refs: recipe.refs }),
          description: tooMany
            ? tMenu('tooManyVerses', { max: MAX_REFS })
            : chips(recipe).join(' · '),
          hint: String(command.count),
          icon: createElement(Copy),
          priority: completing ? 40 : 100,
          keepOpen: tooMany,
          run: () => runCopy(recipe),
        },
      ]

      /** Completion rows append their token to the line and stay put. */
      const completion = (
        id: string,
        token: string,
        label: string,
        icon: Command['icon'],
        priority: number,
      ): Command | null => {
        if (
          command.partial &&
          !token.startsWith(command.partial) &&
          !normalizeForSearch(label).startsWith(command.partial)
        ) {
          return null
        }
        return {
          id,
          group: 'actions',
          label,
          hint: token,
          icon,
          keywords: [token],
          priority,
          keepOpen: true,
          run: () => setQuery(withCopyToken(query, token, command.partial)),
        }
      }

      const push = (row: Command | null) => {
        if (row) commands.push(row)
      }

      // Whatever the last copy used, as one row rather than token by token. Only
      // when nothing is half-typed, since it completes no word.
      if (recent && !completing) {
        const missing = copyCommandTokens(recent).filter((token) => !used.has(token))
        if (missing.length > 0) {
          commands.push({
            id: 'ref:last',
            group: 'actions',
            label: tMenu('copyLastSettings'),
            description: missing.join(' '),
            icon: createElement(History),
            priority: 90,
            keepOpen: true,
            run: () => setQuery(missing.reduce((line, token) => withCopyToken(line, token, ''), query)),
          })
        }
      }

      for (const modifier of COPY_MODIFIERS) {
        // One answer per question, and `none` contradicts a language already given.
        if (used.has(modifier.token) || usedKinds.has(modifier.kind)) continue
        if (modifier.kind === 'translation' && languageCount > 0) continue
        if (modifier.token === 'image' && !canCopyImage()) continue
        // Text is what a line without an output token already does.
        if (modifier.token === 'text') continue
        push(
          completion(
            `ref:token:${modifier.token}`,
            modifier.token,
            tMenu(modifier.labelKey),
            createElement(Plus),
            completing ? 90 : 85,
          ),
        )
      }

      if (!used.has('none') && languageCount < 2) {
        for (const language of translations) {
          if (used.has(language.code)) continue
          push(
            completion(
              `ref:token:${language.code}`,
              language.code,
              language.name,
              createElement(Languages),
              language.code === uiLang ? 70 : 65,
            ),
          )
        }
      }

      return commands
    }

    // ── Whole verses or one line per word ────────────────────────────────────
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
          hint: 'wbw',
          keywords: ['wbw', 'morphology', 'root'],
          priority: 80,
          keepOpen: true,
          run: () => advance({ granularity: 'wbw' }),
        },
      ]
    }

    // ── Arabic ───────────────────────────────────────────────────────────────
    if (step === 'arabic') {
      return [
        {
          id: 'ref:arabic:yes',
          group: 'actions',
          label: tMenu('copyWithArabic'),
          icon: createElement(Languages),
          hint: 'ar',
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

    // ── Translation, defaulting to the interface language ────────────────────
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
          hint: 'none',
          priority: 60,
          keepOpen: true,
          run: () => advance({ primary: 'none' }),
        })
      }

      return commands
    }

    // ── An optional second translation ───────────────────────────────────────
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

    // ── The copy itself ──────────────────────────────────────────────────────
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
        run: () => (recipe ? runCopy(recipe) : Promise.resolve()),
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
    mode,
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
    languageCodes,
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
