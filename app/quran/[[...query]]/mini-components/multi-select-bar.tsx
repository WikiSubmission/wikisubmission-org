'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  ChevronDown,
  Copy,
  FileText,
  Image as ImageIcon,
  ListTree,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { buildMultiVerseMarkdown } from '@/lib/quran-copy'
import { canCopyImage, copyVersesImage } from '@/lib/quran-copy-image'

type CopyKind = 'full-text' | 'wbw-text' | 'full-image' | 'wbw-image'

export function MultiSelectBar() {
  const t = useTranslations('quran.copy')
  const active = useVerseSelection((s) => s.active)
  const count = useVerseSelection((s) => s.selected.size)
  const clear = useVerseSelection((s) => s.clear)
  const ordered = useVerseSelection((s) => s.ordered)
  const prefs = useQuranPreferences()
  const [imageSupported, setImageSupported] = useState(false)

  useEffect(() => {
    // Feature-detection runs after hydration to keep SSR and client markup in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageSupported(canCopyImage())
  }, [])

  // Escape to exit selection mode.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, clear])

  const runCopy = useCallback(
    async (kind: CopyKind) => {
      const verses = ordered()
      if (verses.length === 0) return
      const primaryCode =
        prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
      const secondaryCode =
        prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl'
          ? prefs.secondaryLanguage
          : undefined
      const copyPrefs = {
        primaryCode,
        secondaryCode,
        includeText: prefs.text,
        includeArabic: prefs.arabic,
        includeTransliteration: prefs.transliteration,
        includeFootnotes: prefs.footnotes,
      }
      try {
        if (kind === 'full-text') {
          await navigator.clipboard.writeText(
            buildMultiVerseMarkdown(verses, 'full', copyPrefs)
          )
          toast.success(t('done_text'))
        } else if (kind === 'wbw-text') {
          await navigator.clipboard.writeText(
            buildMultiVerseMarkdown(verses, 'wbw', copyPrefs)
          )
          toast.success(t('done_text'))
        } else if (kind === 'full-image') {
          await copyVersesImage(verses, 'full', { prefs: copyPrefs })
          toast.success(t('done_image'))
        } else if (kind === 'wbw-image') {
          await copyVersesImage(verses, 'wbw', { prefs: copyPrefs })
          toast.success(t('done_image'))
        }
        clear()
      } catch {
        toast.error(
          kind.endsWith('image') ? t('error_image') : t('error_text')
        )
      }
    },
    [ordered, prefs, clear, t]
  )

  if (!active) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/95 backdrop-blur-md shadow-lg px-2 py-1.5">
        <span className="text-xs font-medium px-3 text-foreground">
          {t('selected', { count })}
        </span>

        <div className="flex items-center">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity rounded-r-none"
            onClick={() => runCopy('full-text')}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{t('copy')}</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t('more')}
              className="h-7.5 flex items-center justify-center px-1.5 rounded-full rounded-l-none bg-primary text-primary-foreground hover:opacity-90 transition-opacity border-l border-primary-foreground/20"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              sideOffset={8}
              className="min-w-56"
            >
              <DropdownMenuItem onSelect={() => runCopy('full-text')}>
                <FileText className="w-4 h-4" />
                <span>{t('full_verse_text')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => runCopy('wbw-text')}>
                <ListTree className="w-4 h-4" />
                <span>{t('word_by_word_text')}</span>
              </DropdownMenuItem>
              {imageSupported && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => runCopy('full-image')}>
                    <ImageIcon className="w-4 h-4" />
                    <span>{t('full_verse_image')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => runCopy('wbw-image')}>
                    <ImageIcon className="w-4 h-4" />
                    <span>{t('word_by_word_image')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          aria-label={t('cancel')}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          onClick={clear}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
