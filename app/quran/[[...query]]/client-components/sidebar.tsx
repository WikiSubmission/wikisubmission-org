'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Book, Search, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { components } from '@/src/api/types.gen'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import useLocalStorage from '@/hooks/use-local-storage'
import { Button } from '@/components/ui/button'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

type Chapter = components['schemas']['Chapter']
type Appendix = components['schemas']['Appendix']

type QuranSidebarProps = {
  chapters: Chapter[]
  appendices: Appendix[]
}

export function QuranSidebar({ chapters, appendices }: QuranSidebarProps) {
  const t = useTranslations('sidebar')
  const tNav = useTranslations('nav')
  const [chapterSearchQuery, setChapterSearchQuery] = useState('')
  const [appendixSearchQuery, setAppendixSearchQuery] = useState('')
  const [chaptersOpen, setChaptersOpen] = useLocalStorage<boolean>(
    'chaptersOpen',
    true
  )
  const [appendicesOpen, setAppendicesOpen] = useLocalStorage<boolean>(
    'appendicesOpen',
    true
  )
  const [orderType, setOrderType] = useLocalStorage<'standard' | 'revelation'>(
    'orderType',
    'standard'
  )

  const { query: currentChapter } = useParams()
  const searchParams = useSearchParams()

  const filteredChapters = chapters
    .filter((chapter) => chapter != null)
    .filter(
      (chapter) =>
        chapter.title?.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
        chapter.chapter_number?.toString().includes(chapterSearchQuery)
    )
    .sort((a, b) => {
      if (orderType === 'revelation') {
        return (a.revelation_order || 0) - (b.revelation_order || 0)
      }
      return (a.chapter_number || 0) - (b.chapter_number || 0)
    })

  const filteredAppendices = appendices
    .filter((appendix) => appendix != null)
    .filter(
      (appendix) =>
        appendix.code?.toString().includes(appendixSearchQuery) ||
        appendix.title?.toLowerCase().includes(appendixSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aNumberMatch = a.code?.toString().includes(appendixSearchQuery)
      const bNumberMatch = b.code?.toString().includes(appendixSearchQuery)

      if (aNumberMatch && !bNumberMatch) return -1
      if (!aNumberMatch && bNumberMatch) return 1

      return (a.code || 0) - (b.code || 0)
    })

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b p-4 space-y-1">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="WikiSubmission Logo"
            className="size-12 rounded-full"
            width={500}
            height={500}
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Contexts Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {(currentChapter || searchParams.get('q')) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-auto py-2 px-2.5 hover:bg-accent/50"
                  >
                    <Link href="/quran">
                      <p className="text-xs">{tNav('quran')}</p>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-auto py-2 px-2.5 hover:bg-accent/50"
                >
                  <Link href="/proclamation" target="_blank" prefetch={false}>
                    <p className="text-xs">{tNav('proclamation')}</p>
                    <ChevronRight className="size-4 mr-2" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-auto py-2 px-2.5 hover:bg-accent/50"
                >
                  <Link href="/introduction" target="_blank" prefetch={false}>
                    <p className="text-xs">{tNav('introduction')}</p>
                    <ChevronRight className="size-4 mr-2" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chapters Section - Collapsible */}
        <SidebarGroup>
          <Collapsible
            className="space-y-2"
            open={chaptersOpen}
            onOpenChange={setChaptersOpen}
          >
            <SidebarGroupLabel
              asChild
              className="sticky top-0 z-10 bg-sidebar backdrop-blur-sm"
            >
              <CollapsibleTrigger className="px-2 text-xs uppercase tracking-wider w-full hover:bg-accent/50 rounded-md transition-colors">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Book className="size-3 mr-1.5" />
                    {filteredChapters.length}{' '}
                    {filteredChapters.length > 1
                      ? t('chapters')
                      : filteredChapters.length === 0
                        ? t('results')
                        : t('chapter')}
                  </div>
                  <ChevronRight
                    className={`size-3 transition-transform ${chaptersOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
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
                    if (!chaptersOpen) {
                      setChaptersOpen(true)
                    }
                  }}
                />
              </div>
              {chaptersOpen && (
                <Button
                  onClick={() =>
                    setOrderType(
                      orderType === 'standard' ? 'revelation' : 'standard'
                    )
                  }
                  className="w-fit px-2 py-1 text-xs rounded-md bg-secondary/50 hover:bg-secondary border border-border/40 transition-colors text-muted-foreground hover:text-foreground text-left"
                  size="sm"
                  variant="ghost"
                >
                  {t('order', { type: t(orderType === 'standard' ? 'standard' : 'revelation') })}
                </Button>
              )}
            </div>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {filteredChapters.map((chapter) => (
                    <SidebarMenuItem key={chapter.chapter_number}>
                      <SidebarMenuButton
                        asChild
                        className={`h-auto py-2 px-2.5 hover:bg-accent/50 ${currentChapter == `${chapter.chapter_number}` ? 'bg-secondary/50' : 'hover:bg-accent/50'}`}
                      >
                        <Link href={`/quran/${chapter.chapter_number}`} prefetch>
                          <div className="flex items-start gap-2.5 w-full min-w-0">
                            <span className="flex-shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                              {chapter.chapter_number}
                            </span>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex justify-between items-center gap-1">
                                <span className="text-xs font-medium break-words">
                                  {chapter.title}
                                </span>
                                {orderType === 'revelation' && (
                                  <span className="text-xs font-bold flex-shrink-0">
                                    {t('revOrder', { number: chapter.revelation_order ?? '' })}
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center gap-1">
                                <span className="text-xs text-muted-foreground/50 flex-shrink-0">
                                  {chapter.verse_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Appendices Section - Collapsible */}
        <SidebarGroup>
          <Collapsible
            className="space-y-2"
            open={appendicesOpen}
            onOpenChange={setAppendicesOpen}
          >
            <SidebarGroupLabel
              asChild
              className="sticky top-0 z-10 bg-sidebar backdrop-blur-sm"
            >
              <CollapsibleTrigger className="px-2 text-xs uppercase tracking-wider w-full hover:bg-accent/50 rounded-md transition-colors">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <ScrollText className="size-3 mr-1.5" />
                    {filteredAppendices.length}{' '}
                    {filteredAppendices.length > 1
                      ? t('appendices')
                      : filteredAppendices.length === 0
                        ? t('results')
                        : t('appendix')}
                  </div>
                  <ChevronRight
                    className={`size-3 transition-transform ${appendicesOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder={t('searchAppendix')}
                className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={appendixSearchQuery}
                onChange={(e) => {
                  setAppendixSearchQuery(e.target.value)
                  if (!appendicesOpen) {
                    setAppendicesOpen(true)
                  }
                }}
              />
            </div>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {filteredAppendices.map((appendix) => (
                    <SidebarMenuItem key={appendix.code}>
                      <SidebarMenuButton
                        asChild
                        className="h-auto py-2 px-2.5 hover:bg-accent/50"
                      >
                        <Link
                          href={`https://library.wikisubmission.org/file/quran-the-final-testament-appendix-${appendix.code}`}
                          target="_blank"
                        >
                          <div className="flex items-center gap-2.5 w-full min-w-0">
                            <span className="flex-shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
                              {appendix.code}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs break-words">
                                {appendix.title}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
