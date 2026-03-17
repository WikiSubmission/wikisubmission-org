'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useVerseFetch, parseQuranRef } from '@/hooks/use-verse-fetch'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

function VersePreview({
  verse,
  primaryCode,
  showArabic,
}: {
  verse: VerseData
  primaryCode: string
  showArabic: boolean
}) {
  const tr = verse.tr?.[primaryCode]
  const arTr = verse.tr?.['ar']
  const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)

  return (
    <div className="space-y-2 py-3 border-b last:border-0">
      <Link
        href={`/quran/${chNum}?verse=${vNum}`}
        className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1 w-fit transition-colors"
      >
        {verse.vk}
        <ArrowUpRight className="size-3" />
      </Link>
      {tr?.s && (
        <p className="text-xs text-violet-500 italic">{tr.s}</p>
      )}
      {tr?.tx && (
        <p className="text-base leading-relaxed">
          <strong>[{verse.vk}]</strong> {tr.tx}
        </p>
      )}
      {tr?.f && (
        <p className="text-sm text-muted-foreground italic">{tr.f}</p>
      )}
      {showArabic && arTr?.tx && (
        <p
          dir="rtl"
          className="font-arabic text-xl leading-relaxed text-right pt-1"
        >
          {arTr.tx}
        </p>
      )}
    </div>
  )
}

/** Inline badge that opens a dialog showing the verse(s) on click.
 *
 *  Usage:
 *    <QuranRef reference="2:255" />
 *    <QuranRef reference="1:1-7" from="Appendix 1" />
 */
export function QuranRef({
  reference,
  from,
}: {
  reference: string
  from?: string
}) {
  const prefs = useQuranPreferences()
  const { verses, loading, error, fetch } = useVerseFetch()
  const [open, setOpen] = useState(false)

  const parsed = parseQuranRef(reference)

  // If unparseable, render plain text so we don't swallow content
  if (!parsed) {
    return <span className="font-mono text-xs">{reference}</span>
  }

  const primaryCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'

  const label =
    parsed.vs === parsed.ve
      ? `${parsed.cn}:${parsed.vs}`
      : `${parsed.cn}:${parsed.vs}–${parsed.ve}`

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (val && verses.length === 0 && !loading) {
      fetch(reference, prefs.primaryLanguage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => handleOpenChange(true)}
        className="inline-flex items-center font-mono text-xs bg-violet-600/10 text-violet-600 hover:bg-violet-600/20 active:bg-violet-600/25 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer align-baseline select-none mx-0.5"
        aria-label={`View verse ${reference}`}
      >
        {label}
      </button>

      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-violet-600">{label}</span>
            {from && (
              <span className="text-xs text-muted-foreground font-normal">
                — from {from}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1 -mr-1">
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-6">{error}</p>
          )}
          {verses.map((verse, i) => (
            <VersePreview
              key={verse.vk ?? i}
              verse={verse}
              primaryCode={primaryCode}
              showArabic={prefs.arabic}
            />
          ))}
        </div>

        {verses.length > 0 && (
          <div className="pt-3 border-t">
            <Link
              href={`/quran/${parsed.cn}?verse=${parsed.vs}`}
              onClick={() => setOpen(false)}
              className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1 w-fit transition-colors"
            >
              Open in Quran reader
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
