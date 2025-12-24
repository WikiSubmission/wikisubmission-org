'use client';

import { useParams, useSearchParams } from "next/navigation";
import { QueryResultChapter } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { QuranSearchResultItem } from "./verse-card";

export default function ChapterResult({ props }: { props: { query: string, data: QueryResultChapter } }) {
    return (
        <div className="space-y-2">
            <section>
                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl">
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
                    <div key={i.verse_id} className="bg-muted/20 p-4 rounded-2xl space-y-4">
                        {i.ws_quran_subtitles && (
                            <p className="text-sm text-violet-600 text-center">
                                {i.ws_quran_subtitles.english}
                            </p>
                        )}

                        <div>
                            <p>
                                <strong>[{i.verse_id}]</strong> {i.ws_quran_text.english}
                            </p>
                        </div>

                        <div>
                            <p className="text-right text-lg">
                                {i.ws_quran_text.arabic}
                            </p>
                        </div>

                        {i.ws_quran_footnotes && (
                            <p className="text-sm text-muted-foreground text-left italic">
                                {i.ws_quran_footnotes.english}
                            </p>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}