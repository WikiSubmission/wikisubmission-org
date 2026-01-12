'use client';

import { QueryResultChapter, QueryResultMultipleVerses, QueryResultVerse } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { useSearchParams } from "next/navigation";
import { isRtlLanguage } from "@/lib/is-rtl-language";
import { useEffect, useState } from "react";
import { ArabicDetailed } from "./arabic-detailed";
import { useQuranPlayer, QuranVerse } from "@/lib/quran-audio-context";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StandardItemVerses({ props }: { props: { data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses } }) {
    const quranPreferences = useQuranPreferences();
    const verseSearchParam = useSearchParams().get("verse");
    const [isHighlighted, setIsHighlighted] = useState(false);
    const { playFromVerse, currentVerse, isPlaying, isBuffering, togglePlayPause } = useQuranPlayer();

    useEffect(() => {
        if (!verseSearchParam) return;

        const element = document.getElementById(`${props.data.data[0].chapter_number}:${verseSearchParam}`);
        if (!element) return;

        element.scrollIntoView({ block: "center" });

        requestAnimationFrame(() => {
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 300);
        });
    }, [verseSearchParam, props.data.data]);

    return (
        <main className="w-full">
            <section className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
                {props.data.data.map((i, index) => (
                    <div
                        id={i.verse_id}
                        key={i.verse_id}
                        className={`transition-colors duration-500 ${(isHighlighted && i.verse_id === `${props.data.data[0].chapter_number}:${verseSearchParam}`) ||
                            (currentVerse?.verse_id === i.verse_id)
                            ? "bg-violet-600/10 border-l-4 border-l-violet-600"
                            : "border-l-4 border-l-transparent"
                            }`}
                    >
                        <div className="p-6 sm:p-8 space-y-2">
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

                            <div className="flex items-center justify-between gap-2">
                                <div className="w-fit shrink-0 flex items-start space-x-0.5 border px-2 bg-muted/30 backdrop-blur-sm rounded-full">
                                    <span className="w-full text-lg font-semibold">
                                        {i.verse_id.split(":")[0]}
                                    </span>
                                    <span>:</span>
                                    <span className="w-full text-lg font-semibold text-primary/80">
                                        {i.verse_id.split(":")[1]}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-violet-600/10 hover:text-violet-600"
                                    onClick={() => {
                                        if (currentVerse?.verse_id === i.verse_id) {
                                            togglePlayPause();
                                        } else {
                                            playFromVerse(i as unknown as QuranVerse, props.data.data as unknown as QuranVerse[]);
                                        }
                                    }}
                                >
                                    {currentVerse?.verse_id === i.verse_id && isPlaying ? (
                                        isBuffering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-current" />
                                    ) : (
                                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                                    )}
                                </Button>
                            </div>


                            <div className="flex gap-4 sm:gap-6">
                                {/* Right Column: Verses & Translations */}
                                <div className="flex-1 min-w-0 space-y-2">
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
                                        <div>
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