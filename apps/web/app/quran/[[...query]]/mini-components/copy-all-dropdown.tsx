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
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { buildMultiVerseMarkdown, type CopyMarkdownOptions } from '@/lib/quran-copy'
import { canCopyImage, copyVersesImage } from '@/lib/quran-copy-image'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type CopyKind = 'full-text' | 'wbw-text' | 'full-image' | 'wbw-image'

interface CopyAllDropdownProps {
  verses: VerseData[]
  /** Optional label override. Defaults to "Copy all". */
  label?: string
  /** Extra class names for the trigger button. */
  className?: string
}

function useCopyPrefs(): CopyMarkdownOptions {
  const prefs = useQuranPreferences()
  const primaryCode =
    prefs.primaryLanguage !== 'xl' && prefs.primaryLanguage !== 'none'
      ? prefs.primaryLanguage
      : 'en'
  const secondaryCode =
    prefs.secondaryLanguage &&
    prefs.secondaryLanguage !== 'xl' &&
    prefs.secondaryLanguage !== 'none'
      ? prefs.secondaryLanguage
      : undefined
  return {
    primaryCode,
    secondaryCode,
    includeText: prefs.text && prefs.primaryLanguage !== 'none',
    includeArabic: prefs.arabic,
    includeSubtitles: prefs.subtitles,
    includeTransliteration: prefs.transliteration,
    includeFootnotes: prefs.footnotes,
  }
}

export function CopyAllDropdown({
  verses,
  label,
  className = '',
}: CopyAllDropdownProps) {
  const t = useTranslations('quran.copy')
  const copyPrefs = useCopyPrefs()
  const prefs = useQuranPreferences()

  const [pendingKind, setPendingKind] = useState<CopyKind | null>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [imageSupported, setImageSupported] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageSupported(canCopyImage())
  }, [])

  const isPending = pendingKind !== null
  const imagePending = pendingKind?.endsWith('image') ?? false

  const runCopy = useCallback(
    async (kind: CopyKind) => {
      if (isPending || verses.length === 0) return
      setPendingKind(kind)
      try {
        if (kind === 'full-text') {
          const text = buildMultiVerseMarkdown(verses, 'full', copyPrefs)
          await navigator.clipboard.writeText(text)
          toast.success(t('done_text'))
          setCopiedText(true)
          setTimeout(() => setCopiedText(false), 1500)
        } else if (kind === 'wbw-text') {
          const text = buildMultiVerseMarkdown(
            verses,
            prefs.wordByWord ? 'wbw' : 'wbw',
            copyPrefs
          )
          await navigator.clipboard.writeText(text)
          toast.success(t('done_text'))
          setCopiedText(true)
          setTimeout(() => setCopiedText(false), 1500)
        } else if (kind === 'full-image') {
          await copyVersesImage(verses, 'full', { prefs: copyPrefs })
          toast.success(t('done_image'))
        } else if (kind === 'wbw-image') {
          await copyVersesImage(verses, 'wbw', { prefs: copyPrefs })
          toast.success(t('done_image'))
        }
      } catch {
        toast.error(kind.endsWith('image') ? t('error_image') : t('error_text'))
      } finally {
        setPendingKind(null)
      }
    },
    [isPending, verses, copyPrefs, prefs.wordByWord, t]
  )

  const buttonBase =
    'flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60 border border-border/40 disabled:opacity-50'

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={isPending || verses.length === 0}
        onClick={() => runCopy('full-text')}
        className={`${buttonBase} rounded-r-none border-r-0 ${className}`}
        aria-label="Copy all verses"
      >
        {imagePending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : copiedText ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        <span>{copiedText ? 'Copied!' : (label ?? 'Copy all')}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More copy options"
          disabled={isPending || verses.length === 0}
          className={`${buttonBase} w-7 rounded-l-none justify-center px-0 ${className}`}
        >
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
          <DropdownMenuItem disabled={isPending} onSelect={() => runCopy('full-text')}>
            <FileText className="w-4 h-4" />
            <span>{t('full_verse_text')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isPending} onSelect={() => runCopy('wbw-text')}>
            <ListTree className="w-4 h-4" />
            <span>{t('word_by_word_text')}</span>
          </DropdownMenuItem>
          {imageSupported && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isPending} onSelect={() => runCopy('full-image')}>
                <ImageIcon className="w-4 h-4" />
                <span>{t('full_verse_image')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isPending} onSelect={() => runCopy('wbw-image')}>
                <ImageIcon className="w-4 h-4" />
                <span>{t('word_by_word_image')}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
