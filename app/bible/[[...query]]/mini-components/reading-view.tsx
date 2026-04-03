'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { components } from '@/src/api/types.gen'

type BibleVerseData = components['schemas']['BibleVerseData']

type FootnoteEntry =
  | { kind: 'manuscript'; text: string; label: string }
  | { kind: 'theological'; entries: string[]; label: string }

function FootnoteDialog({
  entry,
  open,
  onClose,
}: {
  entry: FootnoteEntry | null
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-violet-600 text-sm">
            {entry?.label ?? ''}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 -mr-1">
          {entry?.kind === 'manuscript' && (
            <p className="text-sm leading-relaxed text-foreground">{entry.text}</p>
          )}
          {entry?.kind === 'theological' && (
            <ul className="space-y-2">
              {entry.entries.map((e, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground border-b last:border-0 pb-2">
                  <span className="font-mono text-[10px] text-violet-500 mr-1">{i + 1}.</span>
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type Props = {
  verses: BibleVerseData[]
  showManuscript: boolean
  showTheological: boolean
}

export function BibleReadingView({ verses, showManuscript, showTheological }: Props) {
  const [dialogEntry, setDialogEntry] = useState<FootnoteEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Build manuscript footnote index (sequential across whole chapter)
  let manuscriptIdx = 0
  let theologicalIdx = 0

  function openManuscript(text: string, label: string) {
    setDialogEntry({ kind: 'manuscript', text, label })
    setDialogOpen(true)
  }

  function openTheological(entries: string[], label: string) {
    setDialogEntry({ kind: 'theological', entries, label })
    setDialogOpen(true)
  }

  return (
    <>
      <div className="max-w-xl mx-auto px-4 py-8">
        <p className="text-lg leading-[2.1] text-foreground">
          {verses.map((verse) => {
            const tr = verse.tr?.['en']
            const vn = verse.vn
            const hasManuscript = showManuscript && !!tr?.f
            const hasTheological = showTheological && tr?.fn && tr.fn.length > 0

            const mIdx = manuscriptIdx
            if (hasManuscript) manuscriptIdx++
            const tIdx = theologicalIdx
            if (hasTheological) theologicalIdx += tr!.fn!.length

            return (
              <span key={verse.vk}>
                {/* Inline verse number */}
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[9px] font-mono mx-1 align-middle">
                  {vn}
                </span>
                {tr?.tx ?? ''}
                {hasManuscript && (
                  <button
                    onClick={() => openManuscript(tr!.f!, `v.${vn} manuscript note`)}
                    className="inline-flex items-center font-mono text-[10px] text-muted-foreground/60 hover:text-primary/70 align-super mx-0.5 cursor-pointer transition-colors"
                  >
                    [{mIdx + 1}]
                  </button>
                )}
                {hasTheological &&
                  tr!.fn!.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => openTheological(tr!.fn!, `v.${vn} theological notes`)}
                      className="inline-flex items-center font-mono text-[10px] text-violet-500/60 hover:text-violet-500 align-super mx-0.5 cursor-pointer transition-colors"
                    >
                      *{tIdx + i + 1}
                    </button>
                  ))}
                {' '}
              </span>
            )
          })}
        </p>
      </div>

      <FootnoteDialog
        entry={dialogEntry}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
