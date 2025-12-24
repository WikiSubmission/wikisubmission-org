'use client';

import { QueryResultChapter } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { isRtlLanguage } from "@/lib/is-rtl-language";

export default function ChapterResult({ props }: { props: { query: string, data: QueryResultChapter } }) {

    const searchParams = useSearchParams();
    const verseSearchParam = searchParams.get("verse");

    const [isHighlighted, setIsHighlighted] = useState(false);

    const quranPreferences = useQuranPreferences();

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
        <div className="space-y-2">
            <section>
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold">
                            {props.data.metadata.formattedChapterTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {props.data.metadata.allMatchesInSameChapter ? `${props.data.data[0].chapter_verses} verses` : ""}
                        </p>
                    </div>

                    <div className="flex flex-col text-right">
                        <h1 className="text-2xl font-bold">
                            {props.data.data[0].ws_quran_chapters.title_arabic}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {props.data.data[0].ws_quran_chapters.title_transliterated}
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-2">
                {props.data.data.map((i) => (
                    <div id={i.verse_id} key={i.verse_id} className={`bg-muted/20 p-4 rounded-2xl space-y-4 ${isHighlighted && i.verse_id === `${props.data.data[0].chapter_number}:${verseSearchParam}` ? "bg-muted/100 ease-in-out" : ""}`}>
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

                        <div className={`space-y-2 ${isRtlLanguage(quranPreferences.primaryLanguage) ? "text-right" : ""}`}>
                            {quranPreferences.text && (
                                <p>
                                    <strong>[{i.verse_id}]</strong> {i.ws_quran_text[quranPreferences.primaryLanguage]}
                                </p>
                            )}

                            {quranPreferences.secondaryLanguage && (
                                <p className={`text-muted-foreground ${isRtlLanguage(quranPreferences.secondaryLanguage) ? "text-right" : ""}`}>
                                    {i.ws_quran_text[quranPreferences.secondaryLanguage]}
                                </p>
                            )}

                            {quranPreferences.arabic && (
                                <p className="text-right text-lg">
                                    {i.ws_quran_text.arabic}
                                </p>
                            )}
                        </div>

                        {i.ws_quran_footnotes && quranPreferences.footnotes && (
                            <p className="text-sm text-muted-foreground text-left italic">
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
                ))}
            </section>

            <section className="bg-muted/50 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                    {props.data.data[0].chapter_number > 1 && (
                        <a href={`/quran/${props.data.data[0].chapter_number - 1}`}>
                            <Button variant="secondary">
                                <ArrowLeft />
                                Chapter {props.data.data[0].chapter_number - 1}
                            </Button>
                        </a>
                    )}

                    {props.data.data[0].chapter_number < 114 && (
                        <a href={`/quran/${props.data.data[0].chapter_number + 1}`}>
                            <Button variant="secondary">
                                Chapter {props.data.data[0].chapter_number + 1}
                                <ArrowRight />
                            </Button>
                        </a>
                    )}
                </div>
            </section>
        </div>
    );
}