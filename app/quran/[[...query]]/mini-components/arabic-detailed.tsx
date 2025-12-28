
'use client';

import { IndexResult } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RootWordOccurrences } from "./root-word-occurrences";
import { useSearchParams } from "next/navigation";

export function ArabicDetailed({ props }: { props: { data: IndexResult } }) {
    const quranPreferences = useQuranPreferences();

    const verseSearchParam = useSearchParams().get("verse");
    const wordSearchParam = useSearchParams().get("word");

    return (
        <main className={"text-right text-lg"}>
            {quranPreferences.wordByWord ? (
                <div>
                    <div dir="rtl" className="flex flex-wrap justify-start">
                        {props.data.ws_quran_word_by_word.sort((a, b) => a.word_index - b.word_index).map((w, i) => (
                            <div key={i} className="flex">
                                <div className="flex flex-col py-2 pl-4 text-xs items-start">
                                    <p className="text-right text-xl">
                                        {w.arabic}
                                    </p>
                                    <p dir="ltr" className="text-muted-foreground w-8/12">
                                        {w.english}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div dir="rtl" className="flex flex-wrap text-right justify-start gap-3">
                        {props.data.ws_quran_word_by_word.sort((a, b) => a.word_index - b.word_index).map((w) => (
                            <Dialog key={`${w.verse_id}:${w.word_index}`}>
                                <Tooltip>
                                    <DialogTrigger asChild>
                                        <TooltipTrigger>
                                            <p className={`text-xl hover:text-violet-600 cursor-pointer transition-colors ${verseSearchParam === w.verse_number.toString() && wordSearchParam === w.word_index.toString() ? "bg-amber-700 p-1 rounded-lg" : ""}`}>
                                                {w.arabic}
                                            </p>
                                        </TooltipTrigger>
                                    </DialogTrigger>

                                    <TooltipContent side="top">
                                        <div className="flex flex-col gap-1 justify-center items-center p-1 text-center">
                                            <p className="font-arabic text-lg">{w.arabic}</p>
                                            <p className="text-xs text-violet-600 font-medium">{w.english}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{w.transliterated}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>

                                {w.root_word && (
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="flex flex-col items-center gap-3">
                                                <span className="text-2xl font-arabic">{w.arabic}</span>
                                                <span className="text-xs text-muted-foreground font-medium italic">{w.transliterated}</span>
                                                <span className="text-xs text-violet-600 font-medium">{w.english}</span>
                                                <span className="text-sm font-normal text-muted-foreground">Root: {w.root_word}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{w.meanings}</span>
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4">
                                            <RootWordOccurrences rootWord={w.root_word} />
                                        </div>
                                    </DialogContent>
                                )}
                            </Dialog>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}