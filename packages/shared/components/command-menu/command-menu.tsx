'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft } from 'lucide-react'
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
import { useCommandMenu } from './use-command-menu'
import { useLocalIndex } from './use-local-index'
import { usePreferenceCommands } from './registry/preferences'
import { useLanguageCommands } from './registry/languages'
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
  const panelRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) setPresent(true)
  }, [open])

  // Enter tween, once the panel is in the DOM.
  useEffect(() => {
    if (!present || !open) return
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel) return

    if (reducedMotion) {
      gsap.set([panel, overlay].filter(Boolean), { opacity: 1, y: 0, scale: 1 })
      return
    }

    const tl = gsap.timeline()
    if (overlay) tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: ENTER_DURATION }, 0)
    tl.fromTo(
      panel,
      { opacity: 0, y: -8, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: ENTER_DURATION, ease: 'power3.out' },
      0,
    )
    return () => {
      tl.kill()
    }
  }, [present, open, reducedMotion])

  // Exit tween, then unmount.
  useEffect(() => {
    if (open || !present) return
    const panel = panelRef.current
    const overlay = overlayRef.current

    if (reducedMotion || !panel) {
      setPresent(false)
      return
    }

    const tl = gsap.timeline({ onComplete: () => setPresent(false) })
    if (overlay) tl.to(overlay, { opacity: 0, duration: EXIT_DURATION }, 0)
    tl.to(panel, { opacity: 0, y: -6, scale: 0.985, duration: EXIT_DURATION, ease: 'power2.in' }, 0)
    return () => {
      tl.kill()
    }
  }, [open, present, reducedMotion])

  // ── Command sources ────────────────────────────────────────────────────────
  const localIndex = useLocalIndex()
  const preferenceCommands = usePreferenceCommands()
  const languageCommands = useLanguageCommands()

  const commands = useMemo<MenuCommand[]>(() => {
    if (page === 'language') return languageCommands
    if (page) return []
    return [...localIndex, ...preferenceCommands]
  }, [page, localIndex, preferenceCommands, languageCommands])

  /** Filtered and ranked per group, so group order stays editorial rather than score-driven. */
  const grouped = useMemo(() => {
    const byGroup = new Map<CommandGroupId, MenuCommand[]>()
    for (const group of COMMAND_GROUP_ORDER) {
      const inGroup = commands.filter((c) => c.group === group)
      if (inGroup.length === 0) continue
      const ranked = rankTargets(inGroup, query, GROUP_LIMIT[group])
      if (ranked.length > 0) byGroup.set(group, ranked)
    }
    return byGroup
  }, [commands, query])

  const hasResults = grouped.size > 0

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
          <div ref={overlayRef} className="fixed inset-0 z-100 bg-black/40 backdrop-blur-[2px]" />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content
          aria-label={t('title')}
          // GSAP owns the transform, so no Radix data-state animation classes here.
          className="fixed top-[12vh] left-1/2 z-100 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 outline-none"
          onOpenAutoFocus={(event) => {
            // Radix would focus the panel; the input should have it instead.
            event.preventDefault()
            panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
          }}
        >
          <DialogPrimitive.Title className="sr-only">{t('title')}</DialogPrimitive.Title>
          <div
            ref={panelRef}
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
                  back()
                }
              }}
            >
              <div className="flex items-center gap-1 border-b border-border/40 pr-3">
                {page && (
                  <button
                    type="button"
                    onClick={back}
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
                    placeholder={t('placeholder')}
                    className="border-0"
                  />
                </div>
              </div>

              <CommandList>
                {!hasResults && <CommandEmpty>{t('empty')}</CommandEmpty>}

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
                <span className="ml-auto">esc</span>
              </div>
            </Command>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
