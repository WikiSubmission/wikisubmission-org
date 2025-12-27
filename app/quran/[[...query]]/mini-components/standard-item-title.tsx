'use client';

import { QueryResultChapter, QueryResultMultipleVerses, QueryResultVerse } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";

export function StandardItemTitle({ props }: { props: { data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses } }) {
    const quranPreferences = useQuranPreferences();
    return (
        <main className="space-y-2">
            <section>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold">
                            {props.data.metadata.allMatchesInSameChapter ? `Sura ${props.data.data[0].chapter_number}, ${props.data.data[0].ws_quran_chapters[`title_${quranPreferences.primaryLanguage}`]}` : props.data.metadata.formattedChapterTitle}
                        </h1>
                        <section className="flex w-fit justify-end items-center bg-muted/50 rounded-lg text-sm text-muted-foreground space-x-2">
                            <p>
                                {props.data.data[0].ws_quran_chapters.title_transliterated}
                            </p>
                            <p>
                                •
                            </p>
                            <p>
                                {props.data.metadata.allMatchesInSameChapter ? `${props.data.data[0].chapter_verses} verses` : ""}
                            </p>
                        </section>
                    </div>

                    <div className="flex flex-col text-right">
                        <h1 className="text-2xl font-bold">
                            {props.data.data[0].ws_quran_chapters.title_arabic}
                        </h1>
                    </div>
                </div>
            </section>
        </main>
    )
}