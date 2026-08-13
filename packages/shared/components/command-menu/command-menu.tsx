'use client'

import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import gsap from 'gsap'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, FileSearch } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { rankTargets, splitHighlight } from '@/lib/command-match'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useSiteSearch, siteHitHref } from '@/hooks/use-site-search'
import { useCommandMenu } from './use-command-menu'
import { useLocalIndex } from './use-local-index'
import { usePreferenceCommands } from './registry/preferences'
import { useLanguageCommands } from './registry/languages'
import { useVerseCommands } from './registry/verses'
import { useCopyByReferenceCommands, useCopyDraftSummary } from './registry/copy-by-reference'
import { selectCopyStep, useCopyDraft } from './use-copy-draft'
import { COMMAND_GROUP_ORDER, type Command as MenuCommand, type CommandGroupId } from './types'

/** Per-group caps so one large group cannot crowd out the others. */
const GROUP_LIMIT: Record<CommandGroupId, number> = {
  actions: 8,
  pages: 6,
  chapters: 6,
  appendices: 4,
  verses: 6,
  content: 8,
  settings: 6,
}

/**
 * A sub-page is a single list with nothing to crowd out, so its cap only has to
 * keep the list scrollable. The root caps would cut a translation picker down to
 * the first six languages.
 */
const SUBPAGE_LIMIT = 40

const ENTER_DURATION = 0.22
const EXIT_DURATION = 0.14

function GroupHeading({ group }: { group: CommandGroupId }) {
  const t = useTranslations('commandMenu')
  const key = `group${group.charAt(0).toUpperCase()}${group.slice(1)}`
  return <>{t(key)}</>
}

/** Renders a `<b>`-marked snippet as runs, never as raw HTML. */
function Snippet({ snippet }: { snippet: string }) {
  return (
    <>
      {splitHighlight(snippet).map((run, i) =>
        run.match ? (
          <mark key={i} className="bg-transparent font-medium text-primary">
            {run.text}
          </mark>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  )
}

export function CommandMenu() {
  const open = useCommandMenu((s) => s.open)
  const page = useCommandMenu((s) => s.page)
  const query = useCommandMenu((s) => s.query)
  const setQuery = useCommandMenu((s) => s.setQuery)
  const setPage = useCommandMenu((s) => s.setPage)
  const back = useCommandMenu((s) => s.back)
  const close = useCommandMenu((s) => s.close)

  const router = useRouter()
  const t = useTranslations('commandMenu')
  const reducedMotion = usePrefersReducedMotion()

  // `present` lags `open` on close so the exit tween can finish before Radix
  // unmounts the content. Radix's own `open` is driven by `present`, which keeps
  // its focus trap and Escape handling intact throughout.
  const [present, setPresent] = useState(false)

  // Held as state rather than refs. Radix's Portal mounts its children one
  // commit after `present` flips, so a ref is still null when an effect keyed on
  // `present` runs, and that effect would never re-run to catch up — the enter
  // tween would silently never play. Callback refs make the node itself a
  // dependency, so each tween starts the moment its element exists.
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null)
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) setPresent(true)
  }, [open])

  // Enter tween.
  useEffect(() => {
    if (!present || !open || !panelEl) return

    if (reducedMotion) {
      gsap.set([panelEl, overlayEl].filter(Boolean), { opacity: 1, y: 0, scale: 1 })
      return
    }

    const tl = gsap.timeline()
    if (overlayEl) tl.fromTo(overlayEl, { opacity: 0 }, { opacity: 1, duration: ENTER_DURATION }, 0)
    tl.fromTo(
      panelEl,
      { opacity: 0, y: -8, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: ENTER_DURATION, ease: 'power3.out' },
      0,
    )
    return () => {
      tl.kill()
    }
  }, [present, open, panelEl, overlayEl, reducedMotion])

  // Exit tween, then unmount.
  useEffect(() => {
    if (open || !present) return

    if (reducedMotion || !panelEl) {
      setPresent(false)
      return
    }

    const tl = gsap.timeline({ onComplete: () => setPresent(false) })
    if (overlayEl) tl.to(overlayEl, { opacity: 0, duration: EXIT_DURATION }, 0)
    tl.to(panelEl, { opacity: 0, y: -6, scale: 0.985, duration: EXIT_DURATION, ease: 'power2.in' }, 0)

    // GSAP advances on requestAnimationFrame, which browsers stall in a hidden
    // or backgrounded tab. Dismissal must not depend on the tween completing, or
    // the dialog would stay mounted for as long as the tab is away.
    const fallback = setTimeout(() => setPresent(false), EXIT_DURATION * 1000 + 120)

    return () => {
      clearTimeout(fallback)
      tl.kill()
    }
  }, [open, present, panelEl, overlayEl, reducedMotion])

  // ── Command sources ────────────────────────────────────────────────────────
  const localIndex = useLocalIndex()
  const preferenceCommands = usePreferenceCommands()
  const languageCommands = useLanguageCommands()
  const verseCommands = useVerseCommands()
  const copyByReferenceCommands = useCopyByReferenceCommands(page === 'copy-verses', query)
  const copyStep = useCopyDraft(selectCopyStep)
  const copySummary = useCopyDraftSummary()

  // The site catalogue's backend tier. Only queried on the root page, and only
  // once the query is worth a request; the instant tier above covers the wait.
  const locale = useLocale()
  const localRoutes = useMemo(
    () =>
      new Set(
        localIndex
          .filter((command) => command.navigate)
          .map((command) => command.navigate as string),
      ),
    [localIndex],
  )
  const siteSearch = useSiteSearch(page ? '' : query, locale, localRoutes)

  const contentCommands = useMemo<MenuCommand[]>(
    () =>
      siteSearch.results.map((hit) => ({
        id: `site:${hit.id}`,
        group: 'content' as const,
        label: hit.heading ? `${hit.title} — ${hit.heading}` : hit.title,
        description: hit.snippet ? undefined : hit.description,
        snippet: hit.snippet,
        icon: createElement(FileSearch),
        navigate: siteHitHref(hit),
        // Already ranked by the backend, so ordering must not be re-derived from
        // the text here; a flat priority keeps the server's order intact.
        priority: 50,
      })),
    [siteSearch.results],
  )

  const commands = useMemo<MenuCommand[]>(() => {
    if (page === 'language') return languageCommands
    if (page === 'copy-verses') return copyByReferenceCommands
    if (page) return []
    return [...verseCommands, ...localIndex, ...preferenceCommands, ...contentCommands]
  }, [
    page,
    localIndex,
    preferenceCommands,
    languageCommands,
    verseCommands,
    copyByReferenceCommands,
    contentCommands,
  ])

  /** Filtered and ranked per group, so group order stays editorial rather than score-driven. */
  const grouped = useMemo(() => {
    // On the first step of copy-by-reference the query is the reference itself,
    // not a search term — the row is already derived from it, so ranking it
    // against the query would only filter it back out. Every later step is a
    // list of choices the query is a real filter for.
    const rankQuery = page === 'copy-verses' && copyStep === 'ref' ? '' : query

    const byGroup = new Map<CommandGroupId, MenuCommand[]>()
    for (const group of COMMAND_GROUP_ORDER) {
      const inGroup = commands.filter((c) => c.group === group)
      if (inGroup.length === 0) continue

      const limit = page ? SUBPAGE_LIMIT : GROUP_LIMIT[group]

      // Backend results arrive already ranked, and their match is often in the
      // body rather than the title — re-ranking them against the query here
      // would reorder them and drop the body matches entirely.
      const ranked =
        group === 'content' ? inGroup.slice(0, limit) : rankTargets(inGroup, rankQuery, limit)

      if (ranked.length > 0) byGroup.set(group, ranked)
    }
    return byGroup
  }, [commands, query, page, copyStep])

  const hasResults = grouped.size > 0

  /**
   * Back steps through the copy tree one answer at a time, and only leaves the
   * page once there is nothing left to undo. Returning to the reference step
   * puts the reference back in the input so it can be edited rather than retyped.
   */
  const goBack = useCallback(() => {
    if (page === 'copy-verses') {
      const { refs, stepBack } = useCopyDraft.getState()
      if (stepBack()) {
        setQuery(useCopyDraft.getState().refs === null && refs ? refs : '')
        return
      }
    }
    back()
  }, [page, back, setQuery])

  const runCommand = useCallback(
    async (command: MenuCommand) => {
      if (command.page) {
        setPage(command.page)
        return
      }
      if (command.navigate) {
        close()
        router.push(command.navigate)
        return
      }
      if (command.run) {
        await command.run()
        if (!command.keepOpen) close()
      }
    },
    [close, router, setPage],
  )

  if (!present) return null

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(next) => {
        // Escape and overlay clicks land here. Signalling intent rather than
        // unmounting lets the exit tween run.
        if (!next) close()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <div ref={setOverlayEl} className="fixed inset-0 z-100 bg-black/40 backdrop-blur-[2px]" />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content
          aria-label={t('title')}
          // GSAP owns the transform, so no Radix data-state animation classes here.
          className="fixed top-[12vh] left-1/2 z-100 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 outline-none"
          onOpenAutoFocus={(event) => {
            // Radix would focus the panel; the input should have it instead.
            event.preventDefault()
            panelEl?.querySelector<HTMLInputElement>('input')?.focus()
          }}
        >
          <DialogPrimitive.Title className="sr-only">{t('title')}</DialogPrimitive.Title>
          <div
            ref={setPanelEl}
            className="bg-popover overflow-hidden rounded-xl border border-border/50 shadow-2xl"
          >
            <Command
              // Filtering and ranking happen above, so cmdk only drives selection
              // and keyboard navigation.
              shouldFilter={false}
              loop
              onKeyDown={(event) => {
                // Backspace on an empty query leaves a sub-page, the usual
                // command-menu idiom.
                if (event.key === 'Backspace' && query === '' && page) {
                  event.preventDefault()
                  goBack()
                }
              }}
            >
              <div className="flex items-center gap-1 border-b border-border/40 pr-3">
                {page && (
                  <button
                    type="button"
                    onClick={goBack}
                    aria-label={t('back')}
                    className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <CommandInput
                    value={query}
                    onValueChange={setQuery}
                    placeholder={
                      page === 'copy-verses'
                        ? copyStep === 'ref'
                          ? t('referencePlaceholder')
                          : t('copyStepPlaceholder')
                        : t('placeholder')
                    }
                    className="border-0"
                  />
                </div>
              </div>

              {/* The answers so far, so a choice made three questions ago is
                  still visible when the copy finally happens. */}
              {page === 'copy-verses' && copySummary.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 border-b border-border/40 px-3 py-1.5">
                  {copySummary.map((chip) => (
                    <span
                      key={chip}
                      className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary/80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <CommandList>
                {!hasResults && (
                  <CommandEmpty>
                    {page === 'copy-verses' && copyStep === 'ref'
                      ? t('referenceEmpty')
                      : t('empty')}
                  </CommandEmpty>
                )}

                {[...grouped.entries()].map(([group, items]) => (
                  <CommandGroup key={group} heading={<GroupHeading group={group} />}>
                    {items.map((command) => (
                      <CommandItem
                        key={command.id}
                        value={command.id}
                        onSelect={() => void runCommand(command)}
                      >
                        {command.icon}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{command.label}</span>
                          {command.snippet ? (
                            <span className="text-muted-foreground block truncate text-xs">
                              <Snippet snippet={command.snippet} />
                            </span>
                          ) : (
                            command.description && (
                              <span className="text-muted-foreground block truncate text-xs">
                                {command.description}
                              </span>
                            )
                          )}
                        </span>
                        {command.hint && <CommandShortcut>{command.hint}</CommandShortcut>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>

              {/* Key hints, as symbols only so they need no translation. */}
              <div className="text-muted-foreground/50 flex items-center gap-3 border-t border-border/40 px-3 py-2 font-mono text-[11px]">
                <span>↑↓</span>
                <span>⏎</span>
                {page && <span>⌫</span>}
                {/* Says so when the content tier is unreachable, rather than
                    letting its absence read as "no matches". */}
                {siteSearch.offline && (
                  <span className="font-sans normal-case">{t('contentOffline')}</span>
                )}
                <span className="ml-auto">esc</span>
              </div>
            </Command>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
