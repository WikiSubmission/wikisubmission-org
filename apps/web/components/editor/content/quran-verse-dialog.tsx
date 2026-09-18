'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Loader2,
  Search,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useVerseFetch, parseQuranRef } from '@/hooks/use-verse-fetch'
import { CHAPTER_TRANSLITERATIONS } from '@/constants/quran-chapters'
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'

export interface InsertedVerseData {
  chapter: number
  verses: string
  surahName: string
  arabic: string
  translation: string
  body?: unknown[]
}

interface QuranVerseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (verse: InsertedVerseData) => void
}

export function QuranVerseDialog({
  open,
  onOpenChange,
  onInsert,
}: QuranVerseDialogProps) {
  const [refInput, setRefInput] = useState('1:1-7')
  const [includeArabic, setIncludeArabic] = useState(true)
  const [includeTranslation, setIncludeTranslation] = useState(true)
  const [includeAttribution, setIncludeAttribution] = useState(true)

  const { verses, loading, error, fetch: fetchVerses } = useVerseFetch()

  // Auto-fetch initial reference when dialog opens
  useEffect(() => {
    if (open && refInput.trim()) {
      void fetchVerses(refInput.trim(), 'en')
    }
  }, [open, refInput, fetchVerses])

  const handleSearch = () => {
    if (!refInput.trim()) return
    void fetchVerses(refInput.trim(), 'en')
  }

  const parsed = parseQuranRef(refInput.trim())
  const chapterNum = parsed?.cn ?? 1
  const surahTranslit = CHAPTER_TRANSLITERATIONS[chapterNum - 1] ?? `Surah ${chapterNum}`
  const surahEnglish = CHAPTER_TITLES_EN[chapterNum] ?? ''
  const verseLabel = parsed
    ? parsed.vs === parsed.ve
      ? `${parsed.vs}`
      : `${parsed.vs}-${parsed.ve}`
    : ''

  const arabicText = verses
    .map((v) => v.tr?.['ar']?.tx)
    .filter(Boolean)
    .join(' ۝ ')

  const translationText = verses
    .map((v) => v.tr?.['en']?.tx)
    .filter(Boolean)
    .join(' ')

  const handleInsert = () => {
    if (!parsed || verses.length === 0) return

    const fullCitation = includeAttribution
      ? `— The Holy Qur'an, Surah ${surahTranslit} (${surahEnglish || surahTranslit}) ${chapterNum}:${verseLabel}`
      : `Quran ${chapterNum}:${verseLabel}`

    onInsert({
      chapter: chapterNum,
      verses: verseLabel,
      surahName: surahTranslit,
      arabic: includeArabic ? arabicText : '',
      translation: includeTranslation ? translationText : '',
      body: [
        ...(includeArabic && arabicText
          ? [
              {
                _type: 'block',
                _key: `ar-${Date.now()}`,
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: `ar-sp-${Date.now()}`,
                    text: arabicText,
                  },
                ],
              },
            ]
          : []),
        ...(includeTranslation && translationText
          ? [
              {
                _type: 'block',
                _key: `tr-${Date.now()}`,
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: `tr-sp-${Date.now()}`,
                    text: `"${translationText}"`,
                  },
                ],
              },
            ]
          : []),
        ...(includeAttribution
          ? [
              {
                _type: 'block',
                _key: `ref-${Date.now()}`,
                style: 'blockquote',
                children: [
                  {
                    _type: 'span',
                    _key: `ref-sp-${Date.now()}`,
                    text: fullCitation,
                  },
                ],
              },
            ]
          : []),
      ],
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden">
        {/* Header with scripture motif */}
        <DialogHeader className="p-6 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5 mb-1 text-primary">
            <BookOpen size={18} />
            <span className="font-[family-name:var(--font-glacial)] text-[11.5px] font-bold uppercase tracking-[0.14em]">
              Scripture Insertion
            </span>
          </div>
          <DialogTitle className="font-[family-name:var(--font-source-serif)] text-2xl font-semibold text-foreground">
            Insert Qur&apos;an Verse
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-[family-name:var(--font-source-serif)]">
            Embed authenticated Arabic scripture with English translation and academic citation.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Reference Search Bar */}
          <div className="space-y-2">
            <Label className="font-[family-name:var(--font-glacial)] text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Verse Reference (Chapter:Verse or Range)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9 font-[family-name:var(--font-jetbrains)] text-sm"
                  placeholder="e.g. 2:255, 1:1-7, or 18:10-12"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={loading || !refInput.trim()}
                className="font-[family-name:var(--font-glacial)] font-semibold text-xs tracking-wider uppercase px-4"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Fetch'}
              </Button>
            </div>
            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
              {['1:1-7', '2:255', '3:18', '24:35', '112:1-4'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setRefInput(sug)
                    void fetchVerses(sug, 'en')
                  }}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Formatting Options */}
          <div className="flex flex-wrap items-center gap-6 p-3 rounded-lg border border-border bg-muted/20">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <Checkbox
                checked={includeArabic}
                onCheckedChange={(c) => setIncludeArabic(Boolean(c))}
              />
              <span>Include Arabic Text</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <Checkbox
                checked={includeTranslation}
                onCheckedChange={(c) => setIncludeTranslation(Boolean(c))}
              />
              <span>Include English Translation</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <Checkbox
                checked={includeAttribution}
                onCheckedChange={(c) => setIncludeAttribution(Boolean(c))}
              />
              <span>Include Citation Attribution</span>
            </label>
          </div>

          {/* Live Preview Pane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-[family-name:var(--font-glacial)] text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Live Article Preview
              </Label>
              {parsed && verses.length > 0 && (
                <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                  <Check size={12} />
                  <span>{verses.length} verse{verses.length > 1 ? 's' : ''} loaded</span>
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-5 min-h-[140px] flex flex-col justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-xs">Fetching scripture from database…</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-destructive text-sm py-4 justify-center">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : verses.length > 0 ? (
                <div className="space-y-4">
                  {/* Surah Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-[family-name:var(--font-source-serif)] font-semibold text-sm text-foreground">
                      Surah {surahTranslit} {surahEnglish ? `(${surahEnglish})` : ''}
                    </span>
                    <span className="font-[family-name:var(--font-jetbrains)] text-xs text-primary font-semibold">
                      {chapterNum}:{verseLabel}
                    </span>
                  </div>

                  {/* Arabic text with beautiful RTL serif calligraphy */}
                  {includeArabic && arabicText && (
                    <div
                      dir="rtl"
                      className="font-arabic text-xl sm:text-2xl leading-loose text-right text-foreground/90 font-normal py-1"
                    >
                      {arabicText}
                    </div>
                  )}

                  {/* English translation */}
                  {includeTranslation && translationText && (
                    <p className="font-[family-name:var(--font-source-serif)] text-[15px] leading-relaxed text-muted-foreground italic">
                      &ldquo;{translationText}&rdquo;
                    </p>
                  )}

                  {/* Citation attribution */}
                  {includeAttribution && (
                    <div className="text-right font-[family-name:var(--font-glacial)] text-[11px] font-bold uppercase tracking-[0.14em] text-primary pt-1">
                      — The Holy Qur&apos;an, {surahTranslit} {chapterNum}:{verseLabel}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground font-[family-name:var(--font-source-serif)]">
                  Enter a verse reference like <code className="bg-muted px-1.5 py-0.5 rounded font-mono">2:255</code> to view scripture.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/30 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || verses.length === 0}
            onClick={handleInsert}
            className="font-[family-name:var(--font-glacial)] font-semibold text-xs tracking-wider uppercase gap-1.5 px-5"
          >
            <Sparkles size={13} />
            <span>Insert Into Article</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
