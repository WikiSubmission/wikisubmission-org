
'use client';

import { IndexResult } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ArabicDetailed({ props }: { props: { data: IndexResult } }) {
    const quranPreferences = useQuranPreferences();

    return (
        <main className="text-right text-xl">
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
                            <Tooltip key={`${w.verse_id}:${w.word_index}`}>
                                <TooltipTrigger>
                                    <p className="text-xl hover:text-violet-600">
                                        {w.arabic}
                                    </p>
                                </TooltipTrigger>

                                <TooltipContent>
                                    <div className="flex flex-col gap-4 justify-center items-center p-2">
                                        <p>{w.arabic}</p>
                                        <p>{w.transliterated}</p>
                                        <p className="text-violet-600">{w.english}</p>
                                        {w.root_word && (
                                            <p>{w.root_word}</p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}