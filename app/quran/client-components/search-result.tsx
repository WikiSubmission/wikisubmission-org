'use client';

import { useState, useEffect } from "react";
import { ws } from "@/lib/wikisubmission-sdk";
import { useSearchParams } from "next/navigation";
import { QueryResultSuccess } from "wikisubmission-sdk";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function SearchResult() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q");

    const [results, setResults] = useState<QueryResultSuccess | null>(null);

    const [loading, setLoading] = useState(false);

    const runQuery = async () => {
        setResults(null);

        if (searchQuery) {
            setLoading(true);
            const query = await ws.Quran.query(searchQuery, {
                language: "english",
                strategy: "default",
                highlight: true,
                normalizeGodCasing: true,
                adjustments: {
                    index: true,
                    chapters: true,
                    subtitles: true,
                    footnotes: true,
                    wordByWord: false,
                }
            });

            if (query.status === "success") {
                setResults(query);
            } else {
                toast.error(query.error);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        runQuery();
    }, [searchQuery]);

    return (
        <div>
            {loading && <div>
                <Spinner />
            </div>}

            {results && <div className="space-y-4">
                <section>
                    <h2 className="text-xl font-bold">
                        {results.metadata.formattedChapterTitle}
                    </h2>
                    {results.type === "search" && (
                        <p className="text-sm text-muted-foreground">
                            {results.totalMatches} verses found with &apos;{searchQuery}&apos;
                        </p>
                    )}
                </section>
                {results.type === "search" && (
                    <div className="space-y-8">
                        <section className="space-y-4">
                            {results.data.filter((r) => r.hit === "chapter").length > 0 && (
                                <h2 className="text-xl font-bold">
                                    Chapters
                                </h2>
                            )}
                            {results.data.filter((r) => r.hit === "chapter").map((r) => (
                                <div key={`chapter:${r.chapter_number}`}>
                                    <h2>Chapter: {r.chapter_number}, {r.title_english} ({r.title_transliterated})</h2>
                                </div>
                            ))}
                        </section>
                        <section className="space-y-4">
                            {results.data.filter((r) => r.hit === "subtitle").length > 0 && (
                                <h2 className="text-xl font-bold">
                                    Subtitles
                                </h2>
                            )}
                            {results.data.filter((r) => r.hit === "subtitle").map((r) => (
                                <div key={`subtitle:${r.verse_id}`}>
                                    <h2>Subtitle: {r.english}</h2>
                                </div>
                            ))}
                        </section>
                        <section className="space-y-4">
                            {results.data.filter((r) => r.hit === "text").length > 0 && (
                                <h2 className="text-xl font-bold">
                                    Verses
                                </h2>
                            )}
                            {results.data.filter((r) => r.hit === "text").map((r) => (
                                <div key={`text:${r.verse_id}`}>
                                    <h2>[{r.verse_id}] {r.english}</h2>
                                </div>
                            ))}
                        </section>
                        <section className="space-y-4">
                            {results.data.filter((r) => r.hit === "footnote").length > 0 && (
                                <h2 className="text-xl font-bold">
                                    Footnotes
                                </h2>
                            )}
                            {results.data.filter((r) => r.hit === "footnote").map((r) => (
                                <div key={`footnote:${r.verse_id}`}>
                                    <h2>Footnote: {r.english}</h2>
                                </div>
                            ))}
                        </section>
                        <section className="space-y-4">
                            {results.data.filter((r) => r.hit === "word_by_word").length > 0 && (
                                <h2 className="text-xl font-bold">
                                    Word by Word
                                </h2>
                            )}
                            {results.data.filter((r) => r.hit === "word_by_word").map((r) => (
                                <div key={`word_by_word:${r.verse_id}`}>
                                    <h2>[{r.verse_id}] Word by Word: {r.english}</h2>
                                </div>
                            ))}
                        </section>
                    </div>
                )}
            </div>}
        </div>
    );
}