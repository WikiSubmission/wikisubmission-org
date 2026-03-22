'use client'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Book, ChevronRight, MenuIcon, ScrollText, Search } from 'lucide-react'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import type { components } from '@/src/api/types.gen'
import useLocalStorage from '@/hooks/use-local-storage'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

// Isolated: useSearchParams() re-renders on every window.history.replaceState.
// Keeping this in its own sub-component prevents the 114 chapter links from
// re-rendering on every URL ?verse= sync while the user is reading.
function BackToQuranLink({ alreadyShown }: { alreadyShown: boolean }) {
  const t = useTranslations('nav')
  const searchParams = useSearchParams()
  if (alreadyShown || !searchParams.get('q')) return null
  return (
    <SheetClose asChild>
      <Link
        href="/quran"
        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
      >
        {t('quran')}
      </Link>
    </SheetClose>
  )
}

function NavSheetContent({
  chapters,
  appendices,
}: {
  chapters: Chapter[]
  appendices: Appendix[]
}) {
  const t = useTranslations('sidebar')
  const tNav = useTranslations('nav')
  const [chapterSearchQuery, setChapterSearchQuery] = useState('')
  const [appendixSearchQuery, setAppendixSearchQuery] = useState('')
  const [chaptersOpen, setChaptersOpen] = useLocalStorage<boolean>('chaptersOpen', true)
  const [appendicesOpen, setAppendicesOpen] = useLocalStorage<boolean>('appendicesOpen', true)
  const [orderType, setOrderType] = useLocalStorage<'standard' | 'revelation'>('orderType', 'standard')
  const { query: currentChapter } = useParams()

  const filteredChapters = chapters
    .filter((c) => c != null)
    .filter(
      (c) =>
        c.title?.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
        c.chapter_number?.toString().includes(chapterSearchQuery)
    )
    .sort((a, b) =>
      orderType === 'revelation'
        ? (a.revelation_order || 0) - (b.revelation_order || 0)
        : (a.chapter_number || 0) - (b.chapter_number || 0)
    )

  const filteredAppendices = appendices
    .filter((a) => a != null)
    .filter(
      (a) =>
        a.code?.toString().includes(appendixSearchQuery) ||
        a.title?.toLowerCase().includes(appendixSearchQuery.toLowerCase())
    )
    .sort((a, b) => (a.code || 0) - (b.code || 0))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Context links */}
      <div className="px-3 py-2 space-y-0.5 border-b border-border/40">
        {currentChapter && (
          <SheetClose asChild>
            <Link
              href="/quran"
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
            >
              {tNav('quran')}
            </Link>
          </SheetClose>
        )}
        <Suspense>
          <BackToQuranLink alreadyShown={!!currentChapter} />
        </Suspense>
        <SheetClose asChild>
          <Link
            href="/proclamation"
            target="_blank"
            prefetch={false}
            className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
          >
            {tNav('proclamation')}
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/introduction"
            target="_blank"
            prefetch={false}
            className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
          >
            {tNav('introduction')}
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </Link>
        </SheetClose>
      </div>

      {/* Scrollable chapter + appendix list */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Chapters */}
        <Collapsible open={chaptersOpen} onOpenChange={setChaptersOpen}>
          <div className="space-y-2">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 rounded-md text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-1.5">
                <Book className="size-3" />
                {filteredChapters.length}{' '}
                {filteredChapters.length === 1 ? t('chapter') : t('chapters')}
              </div>
              <ChevronRight
                className={cn('size-3 transition-transform', chaptersOpen && 'rotate-90')}
              />
            </CollapsibleTrigger>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                <Input
                  type="search"
                  placeholder={t('search')}
                  className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  value={chapterSearchQuery}
                  onChange={(e) => {
                    setChapterSearchQuery(e.target.value)
                    if (!chaptersOpen) setChaptersOpen(true)
                  }}
                />
              </div>
              {chaptersOpen && (
                <Button
                  onClick={() =>
                    setOrderType(orderType === 'standard' ? 'revelation' : 'standard')
                  }
                  className="w-fit px-2 py-1 text-xs rounded-md bg-secondary/50 hover:bg-secondary border border-border/40 transition-colors text-muted-foreground hover:text-foreground"
                  size="sm"
                  variant="ghost"
                >
                  {t('order', {
                    type: t(orderType === 'standard' ? 'standard' : 'revelation'),
                  })}
                </Button>
              )}
            </div>

            <CollapsibleContent>
              <div className="space-y-0.5">
                {filteredChapters.map((chapter) => {
                  const isActive = currentChapter == `${chapter.chapter_number}`
                  return (
                    <SheetClose key={chapter.chapter_number} asChild>
                      <Link
                        href={`/quran/${chapter.chapter_number}`}
                        prefetch
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all',
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm'
                            : 'hover:bg-accent/60 text-foreground/80 hover:text-foreground border border-transparent'
                        )}
                      >
                        <span
                          className={cn(
                            'flex-shrink-0 flex items-center justify-center size-8 rounded-lg font-mono text-xs font-bold',
                            isActive
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {chapter.chapter_number}
                        </span>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{chapter.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {orderType === 'revelation' && (
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {t('revOrder', { number: chapter.revelation_order ?? '' })}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/60 font-mono">
                              {chapter.verse_count}v
                            </span>
                          </div>
                        </div>
                      </Link>
                    </SheetClose>
                  )
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Appendices */}
        <Collapsible open={appendicesOpen} onOpenChange={setAppendicesOpen}>
          <div className="space-y-2">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 rounded-md text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-1.5">
                <ScrollText className="size-3" />
                {filteredAppendices.length}{' '}
                {filteredAppendices.length === 1 ? t('appendix') : t('appendices')}
              </div>
              <ChevronRight
                className={cn('size-3 transition-transform', appendicesOpen && 'rotate-90')}
              />
            </CollapsibleTrigger>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder={t('searchAppendix')}
                className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={appendixSearchQuery}
                onChange={(e) => {
                  setAppendixSearchQuery(e.target.value)
                  if (!appendicesOpen) setAppendicesOpen(true)
                }}
              />
            </div>

            <CollapsibleContent>
              <div className="space-y-0.5">
                {filteredAppendices.map((appendix) => (
                  <SheetClose key={appendix.code} asChild>
                    <Link
                      href={`https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${appendix.code}`}
                      target="_blank"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
                        {appendix.code}
                      </span>
                      <span className="text-xs break-words flex-1 min-w-0">
                        {appendix.title}
                      </span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  )
}

export function QuranNavSheet({
  chapters,
  appendices,
}: {
  chapters: Chapter[]
  appendices: Appendix[]
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Open navigation"
          className="shrink-0"
        >
          <MenuIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px] gap-0">
        <SheetHeader className="px-4 py-3 border-b border-border/40">
          <SheetTitle className="text-sm font-semibold">Quran</SheetTitle>
        </SheetHeader>
        <NavSheetContent chapters={chapters} appendices={appendices} />
      </SheetContent>
    </Sheet>
  )
}
