import { memo } from 'react'
import type { components } from '@/src/api/types.gen'

type BibleVerseData = components['schemas']['BibleVerseData']

type Props = {
  verse: BibleVerseData
  showManuscript: boolean
  showTheological: boolean
  /** Index of the first manuscript footnote across all verses (for numbering). */
  manuscriptOffset: number
  /** Index of the first theological footnote entry across all verses (for numbering). */
  theologicalOffset: number
  highlighted?: boolean
  onFootnoteClick: (text: string, label: string) => void
  onTheologicalClick: (entries: string[], label: string) => void
}

function BibleVerseCard({
  verse,
  showManuscript,
  showTheological,
  manuscriptOffset,
  theologicalOffset,
  highlighted,
  onFootnoteClick,
  onTheologicalClick,
}: Props) {
  const tr = verse.tr?.['en']
  const parts = (verse.vk ?? '').split(':')
  const vn = verse.vn ?? (parts[2] ? parseInt(parts[2]) : 0)
  const hasManuscript = showManuscript && !!tr?.f
  const hasTheological = showTheological && tr?.fn && tr.fn.length > 0

  return (
    <div
      id={`verse-${vn}`}
      className={`flex gap-3 group py-1 rounded-lg transition-colors duration-700 ${highlighted ? 'bg-primary/10 -mx-2 px-2' : ''}`}
    >
      {/* Verse number badge */}
      <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-glacial text-xs font-bold mt-0.5">
        {vn}
      </span>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-base leading-relaxed text-foreground">
          {tr?.tx ?? ''}
          {/* Manuscript footnote marker */}
          {hasManuscript && (
              <button
                onClick={() =>
                  onFootnoteClick(tr!.f!, `v.${vn} manuscript note`)
                }
                className="inline-flex items-center font-glacial font-bold text-[9px] text-primary hover:underline align-super mx-0.5 cursor-pointer transition-colors"
                aria-label={`Manuscript footnote ${manuscriptOffset + 1}`}
              >
                {manuscriptOffset + 1}
              </button>
          )}
          {/* Theological footnote markers */}
          {hasTheological &&
            tr!.fn!.map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  onTheologicalClick(tr!.fn!, `v.${vn} theological notes`)
                }
                className="inline-flex items-center font-glacial font-bold text-[9px] text-primary hover:underline align-super mx-0.5 cursor-pointer transition-colors"
                aria-label={`Theological note ${theologicalOffset + i + 1}`}
              >
                *{theologicalOffset + i + 1}
              </button>
            ))}
        </p>
      </div>
    </div>
  )
}

export default memo(BibleVerseCard)
