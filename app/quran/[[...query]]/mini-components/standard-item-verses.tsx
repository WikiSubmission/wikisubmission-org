'use client';

import { QueryResultChapter, QueryResultMultipleVerses, QueryResultVerse } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { useSearchParams } from "next/navigation";
import { isRtlLanguage } from "@/lib/is-rtl-language";
import { useEffect, useState } from "react";
import { ArabicDetailed } from "./arabic-detailed";

export function StandardItemVerses({ props }: { props: { data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses } }) {
    const quranPreferences = useQuranPreferences();
    const verseSearchParam = useSearchParams().get("verse");
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        if (!verseSearchParam) return;

        const element = document.getElementById(`${props.data.data[0].chapter_number}:${verseSearchParam}`);
        if (!element) return;

        element.scrollIntoView({ block: "center" });

        // Wrap state update in requestAnimationFrame
        requestAnimationFrame(() => {
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 750);
        });
    }, [verseSearchParam, props.data.data]);

    return (
        <main className="w-full">
            <section className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
                {props.data.data.map((i, index) => (
                    <div
                        id={i.verse_id}
                        key={i.verse_id}
                        className={`transition-colors duration-500 ${isHighlighted && i.verse_id === `${props.data.data[0].chapter_number}:${verseSearchParam}` ? "bg-violet-600/10" : ""}`}
                    >
                        <div className="p-6 sm:p-8 space-y-6">
                            {i.ws_quran_subtitles && quranPreferences.subtitles && (
                                <div className="flex justify-center">
                                    <p className="text-violet-600 text-xs font-bold text-center">
                                        {
                                            i.ws_quran_subtitles[
                                            quranPreferences.primaryLanguage in i.ws_quran_subtitles
                                                ? (quranPreferences.primaryLanguage as keyof typeof i.ws_quran_subtitles)
                                                : "english"
                                            ]
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4 sm:gap-6">
                                {/* Left Column: Verse ID */}
                                <div className="w-14 sm:w-16 shrink-0 flex flex-col items-start pt-0.5">
                                    <span className="w-full text-center py-1 bg-foreground/5 text-foreground/60 font-bold rounded-md border border-border/50">
                                        {i.verse_id}
                                    </span>
                                </div>

                                {/* Right Column: Verses & Translations */}
                                <div className="flex-1 min-w-0 space-y-4">
                                    <div className={`${isRtlLanguage(quranPreferences.primaryLanguage) ? "text-right" : ""}`}>
                                        <p className="text-lg leading-relaxed text-foreground select-text font-medium">
                                            {i.ws_quran_text[quranPreferences.primaryLanguage]}
                                        </p>
                                    </div>

                                    {quranPreferences.secondaryLanguage && (
                                        <p className={`text-muted-foreground leading-relaxed italic ${isRtlLanguage(quranPreferences.secondaryLanguage) ? "text-right" : ""}`}>
                                            {i.ws_quran_text[quranPreferences.secondaryLanguage]}
                                        </p>
                                    )}

                                    {quranPreferences.arabic && (
                                        <div className="py-2">
                                            <ArabicDetailed props={{ data: i }} />
                                        </div>
                                    )}

                                    {quranPreferences.transliteration && (
                                        <p className="text-violet-600/80 font-medium italic text-sm">
                                            {i.ws_quran_text.transliterated}
                                        </p>
                                    )}

                                    {i.ws_quran_footnotes && quranPreferences.footnotes && (
                                        <div className="border-t border-border/40 pt-2">
                                            <p className={`text-sm text-muted-foreground/80 leading-relaxed italic ${isRtlLanguage(quranPreferences.primaryLanguage) ? "text-right" : "text-left"}`}>
                                                {
                                                    i.ws_quran_footnotes[
                                                    quranPreferences.primaryLanguage in i.ws_quran_footnotes
                                                        ? (quranPreferences.primaryLanguage as keyof typeof i.ws_quran_footnotes)
                                                        : "english"
                                                    ]
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                        {index !== props.data.data.length - 1 &&
                            <div className="px-8">
                                <hr className="border-border/40" />
                            </div>
                        }
                    </div>
                ))}
            </section>
        </main>
    )
}