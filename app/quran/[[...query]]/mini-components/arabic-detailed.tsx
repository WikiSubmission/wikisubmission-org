'use client'

import {
  IndexResult,
  SearchHitText,
} from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RootWordOccurrences } from './root-word-occurrences'
import { useSearchParams } from 'next/navigation'

export function ArabicDetailed({
  props,
}: {
  props: { data: IndexResult | SearchHitText }
}) {
  const quranPreferences = useQuranPreferences()

  const verseSearchParam = useSearchParams().get('verse')
  const wordSearchParam = useSearchParams().get('word')

  if ('hit' in props.data && props.data.hit === 'text') {
    return (
      <main className="text-right py-2">
        <p
          dir="rtl"
          className="font-arabic text-2xl leading-relaxed text-foreground/90"
        >
          {props.data.arabic}
        </p>
      </main>
    )
  }

  const data = props.data as IndexResult

  return (
    <main className={'text-right'}>
      {quranPreferences.wordByWord ? (
        <div
          dir="rtl"
          className="flex flex-wrap justify-start gap-y-8 gap-x-2 py-4"
        >
          {data.ws_quran_word_by_word
            .sort((a, b) => a.word_index - b.word_index)
            .map((w) => (
              <Dialog key={`${w.verse_id}:${w.word_index}`}>
                <DialogTrigger asChild>
                  <div className="group flex flex-col items-center gap-2 px-3 py-2 cursor-pointer transition-all hover:bg-muted/50 rounded-2xl border border-transparent hover:border-violet-600/20">
                    <p className="font-arabic text-2xl leading-snug group-hover:text-violet-600 transition-colors">
                      {w.arabic}
                    </p>
                    <div
                      className="flex flex-col items-center gap-0.5 pt-0.5"
                      dir="ltr"
                    >
                      <p className="text-[10px] text-violet-600/90 font-medium uppercase tracking-tighter">
                        {w.transliterated}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium text-center break-words max-w-[100px] italic">
                        {w.english}
                      </p>
                    </div>
                  </div>
                </DialogTrigger>

                {w.root_word && (
                  <DialogContent className="max-w-md sm:max-w-xl overflow-hidden rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex flex-col items-center gap-3 text-center pb-3 border-b">
                        <span className="text-4xl font-arabic text-violet-600 mb-1">
                          {w.arabic}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">
                            {w.transliterated}
                          </span>
                          <span className="text-base font-semibold text-foreground">
                            {w.english}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="px-2.5 py-0.5 bg-violet-600/10 rounded-full">
                            <span className="text-[10px] font-bold text-violet-600">
                              Root: {w.root_word}
                            </span>
                          </div>
                          <div className="h-3 w-[1px] bg-border" />
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {w.meanings}
                          </span>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">
                        Other Occurrences
                      </p>
                      <RootWordOccurrences rootWord={w.root_word} />
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            ))}
        </div>
      ) : (
        <div
          dir="rtl"
          className="flex flex-wrap text-right justify-start gap-x-4 gap-y-6 py-2"
        >
          {data.ws_quran_word_by_word
            .sort((a, b) => a.word_index - b.word_index)
            .map((w) => (
              <Dialog key={`${w.verse_id}:${w.word_index}`}>
                <Tooltip>
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <p
                        className={`font-arabic text-2xl leading-relaxed transition-all cursor-pointer hover:text-violet-600 hover:scale-105 active:scale-95 ${verseSearchParam === w.verse_number.toString() && wordSearchParam === w.word_index.toString() ? 'text-violet-600 bg-violet-600/5 ring-1 ring-violet-600/20 px-2 rounded-xl' : 'text-foreground/90'}`}
                      >
                        {w.arabic}
                      </p>
                    </TooltipTrigger>
                  </DialogTrigger>

                  <TooltipContent
                    side="top"
                    className="bg-popover/80 backdrop-blur-sm border-violet-600/20 px-4 py-2 rounded-xl"
                  >
                    <div className="flex flex-col gap-0.5 space-y-1 py-2 items-center text-center">
                      <p className="font-arabic text-xl text-violet-600">
                        {w.arabic}
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {w.english}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {w.transliterated}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {w.root_word && (
                  <DialogContent className="max-w-md sm:max-w-xl overflow-hidden rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex flex-col items-center gap-3 text-center pb-3 border-b">
                        <span className="text-4xl font-arabic text-violet-600 mb-3">
                          {w.arabic}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">
                            {w.transliterated}
                          </span>
                          <span className="text-base font-semibold text-foreground">
                            {w.english}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="px-2.5 py-0.5 bg-violet-600/10 rounded-full">
                            <span className="text-[10px] font-bold text-violet-600">
                              Root: {w.root_word}
                            </span>
                          </div>
                          <div className="h-3 w-[1px] bg-border" />
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {w.meanings}
                          </span>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">
                        Other Occurrences
                      </p>
                      <RootWordOccurrences rootWord={w.root_word} />
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            ))}
        </div>
      )}
    </main>
  )
}
