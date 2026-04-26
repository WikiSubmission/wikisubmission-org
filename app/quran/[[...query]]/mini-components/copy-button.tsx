'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  Image as ImageIcon,
  ListTree,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import {
  buildVerseMarkdown,
  buildWordByWordMarkdown,
  type CopyMarkdownOptions,
} from '@/lib/quran-copy'
import {
  canCopyImage,
  copyVerseImage,
  type CopyImageOptions,
} from '@/lib/quran-copy-image'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

type CopyKind = 'full-text' | 'wbw-text' | 'full-image' | 'wbw-image'

interface CopyButtonProps {
  verse: VerseData
  /** Raw `<b>..</b>` snippet from backend search results. */
  searchHighlight?: string
  /** Hides the split-button chevron and only fires a default-copy when pressed. */
  compact?: boolean
}

function usePrefsSnapshot() {
  const prefs = useQuranPreferences()
  const primaryCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const secondaryCode =
    prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl'
      ? prefs.secondaryLanguage
      : undefined
  return {
    markdown: {
      primaryCode,
      secondaryCode,
      includeText: prefs.text,
      includeArabic: prefs.arabic,
      includeTransliteration: prefs.transliteration,
      includeFootnotes: prefs.footnotes,
    } satisfies CopyMarkdownOptions,
    image: {
      prefs: {
        primaryCode,
        secondaryCode,
        includeText: prefs.text,
        includeArabic: prefs.arabic,
        includeTransliteration: prefs.transliteration,
        includeFootnotes: prefs.footnotes,
      },
    } satisfies CopyImageOptions,
  }
}

export function CopyButton({
  verse,
  searchHighlight,
  compact = false,
}: CopyButtonProps) {
  const t = useTranslations('quran.copy')
  const [copied, setCopied] = useState(false)
  const [imageSupported, setImageSupported] = useState(false)
  const { markdown, image } = usePrefsSnapshot()

  useEffect(() => {
    // Feature-detection runs after hydration to keep SSR and client markup in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageSupported(canCopyImage())
  }, [])

  const flashCopied = useCallback(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const runCopy = useCallback(
    async (kind: CopyKind) => {
      try {
        if (kind === 'full-text') {
          const md = buildVerseMarkdown(verse, {
            ...markdown,
            searchHighlight,
          })
          await navigator.clipboard.writeText(md)
          flashCopied()
          toast.success(t('done_text'))
          return
        }
        if (kind === 'wbw-text') {
          const md = buildWordByWordMarkdown(verse, {
            ...markdown,
            searchHighlight,
          })
          await navigator.clipboard.writeText(md)
          flashCopied()
          toast.success(t('done_text'))
          return
        }
        if (kind === 'full-image') {
          await copyVerseImage(verse, 'full', { ...image, searchHighlight })
          flashCopied()
          toast.success(t('done_image'))
          return
        }
        if (kind === 'wbw-image') {
          await copyVerseImage(verse, 'wbw', { ...image, searchHighlight })
          flashCopied()
          toast.success(t('done_image'))
          return
        }
      } catch {
        toast.error(
          kind.endsWith('image') ? t('error_image') : t('error_text')
        )
      }
    },
    [verse, markdown, image, searchHighlight, flashCopied, t]
  )

  const iconButtonBase =
    'h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors'

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={t('aria')}
        className={`${iconButtonBase} w-8 ${compact ? '' : 'rounded-r-none pr-1'}`}
        onClick={() => runCopy('full-text')}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {!compact && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t('more')}
            className={`${iconButtonBase} w-5 rounded-l-none pl-0.5`}
          >
            <ChevronDown className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
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
      )}
    </div>
  )
}
