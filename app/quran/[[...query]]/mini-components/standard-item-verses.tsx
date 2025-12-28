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

        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Wrap state update in requestAnimationFrame
        requestAnimationFrame(() => {
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 2000);
        });
    }, [verseSearchParam, props.data.data]);

    return (
        <main>
            <section className="bg-muted/50 rounded-2xl">
                {props.data.data.map((i) => (
                    <div id={i.verse_id} key={i.verse_id} className={`${isHighlighted && i.verse_id === `${props.data.data[0].chapter_number}:${verseSearchParam}` ? "bg-muted/100 ease-in-out" : ""}`}>
                        <div className={`p-4 rounded-2xl space-y-4`}>
                            {i.ws_quran_subtitles && quranPreferences.subtitles && (
                                <p className="text-sm text-violet-600 text-center">
                                    {
                                        i.ws_quran_subtitles[
                                        quranPreferences.primaryLanguage in i.ws_quran_subtitles
                                            ? (quranPreferences.primaryLanguage as keyof typeof i.ws_quran_subtitles)
                                            : "english"
                                        ]
                                    }
                                </p>
                            )}

                            <div className={`space-y-4 ${isRtlLanguage(quranPreferences.primaryLanguage) ? "text-right" : ""}`}>
                                <p>
                                    <strong>[{i.verse_id}]</strong> {i.ws_quran_text[quranPreferences.primaryLanguage]}
                                </p>

                                {quranPreferences.secondaryLanguage && (
                                    <p className={`text-muted-foreground ${isRtlLanguage(quranPreferences.secondaryLanguage) ? "text-right" : ""}`}>
                                        {i.ws_quran_text[quranPreferences.secondaryLanguage]}
                                    </p>
                                )}

                                {quranPreferences.arabic && (
                                    <ArabicDetailed props={{ data: i }} />
                                )}

                                {quranPreferences.transliteration && (
                                    <p className="text-amber-800">
                                        {i.ws_quran_text.transliterated}
                                    </p>
                                )}
                            </div>

                            {i.ws_quran_footnotes && quranPreferences.footnotes && (
                                <p className={`text-sm text-muted-foreground text-left italic ${isRtlLanguage(quranPreferences.primaryLanguage) ? "text-right" : ""}`}>
                                    {
                                        i.ws_quran_footnotes[
                                        quranPreferences.primaryLanguage in i.ws_quran_footnotes
                                            ? (quranPreferences.primaryLanguage as keyof typeof i.ws_quran_footnotes)
                                            : "english"
                                        ]
                                    }
                                </p>
                            )}
                        </div>
                        {i.verse_id !== props.data.data[props.data.data.length - 1].verse_id &&
                            <hr className="w-full" />
                        }
                    </div>
                ))}
            </section>
        </main>
    )
}