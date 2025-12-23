'use client';

import { useState, useEffect, useCallback } from "react";
import { ws } from "@/lib/wikisubmission-sdk";
import { useSearchParams } from "next/navigation";
import { QueryResultSuccess } from "wikisubmission-sdk";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { SearchIcon } from "lucide-react";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";

export default function SearchResult() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q");

    const [results, setResults] = useState<QueryResultSuccess | null>(null);
    const [searchTab, setSearchTab] = useState<"all" | "chapters" | "text" | "subtitles" | "footnotes" | "word-by-word">("all")
    const [loading, setLoading] = useState(false);
    const [loadingWordByWord, setLoadingWordByWord] = useState(false);
    const [searchWordByWordMatches, setSearchWordByWordMatches] = useState<SearchHitWordByWord[]>([]);
    const [lastWordByWordQuery, setLastWordByWordQuery] = useState("");

    const runQuery = useCallback(async () => {
        setSearchTab("all");

        setSearchWordByWordMatches([]);

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
    }, [searchQuery]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        runQuery();
    }, [runQuery]);

    const searchAllMatches = results?.type === "search" ? results.data : [];
    const searchChapterMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "chapter") : [];
    const searchSubtitleMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "subtitle") : [];
    const searchTextMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "text") : [];
    const searchFootnoteMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "footnote") : [];

    const runWordByWordQuery = async (field: "english" | "meanings") => {

        if (lastWordByWordQuery === searchQuery) return;

        if (!searchQuery) {
            toast.error("No search query provided");
            return;
        }

        setLoadingWordByWord(true);
        setSearchWordByWordMatches([]);

        const dbQuery = await ws.supabase
            .from("ws_quran_word_by_word")
            .select("*")
            .textSearch(field, searchQuery)
            .order("index", { ascending: true })
            .limit(3000);

        if (dbQuery.data && dbQuery.data.length > 0) {
            setSearchWordByWordMatches(
                dbQuery.data.map((d) => ({
                    hit: "word_by_word",
                    ...d
                }))
            );
        } else {
            toast.error(dbQuery?.error?.message || `No results found for '${searchQuery}'`);
        }
        setLoadingWordByWord(false);
        setLastWordByWordQuery(searchQuery);
    }

    return (
        <div>
            {loading && <div>
                <Spinner />
            </div>}

            {results && (searchQuery?.length ?? 0) > 0 && <div className="space-y-4">
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
                        <Tabs
                            value={searchTab}
                            onValueChange={(v) => setSearchTab(v as typeof searchTab)}
                            className="space-y-2"
                        >
                            <TabsList className="flex [&>*]:text-xs">
                                <TabsTrigger value="all">
                                    All ({searchAllMatches.length})
                                </TabsTrigger>
                                {searchChapterMatches.length > 0 && (
                                    <TabsTrigger value="chapters">
                                        Chapters ({searchChapterMatches.length})
                                    </TabsTrigger>
                                )}
                                {searchTextMatches.length > 0 && (
                                    <TabsTrigger value="text">
                                        Text ({searchTextMatches.length})
                                    </TabsTrigger>
                                )}
                                {searchSubtitleMatches.length > 0 && (
                                    <TabsTrigger value="subtitles">
                                        Subtitles ({searchSubtitleMatches.length})
                                    </TabsTrigger>
                                )}
                                {searchFootnoteMatches.length > 0 && (
                                    <TabsTrigger value="footnotes">
                                        Footnotes ({searchFootnoteMatches.length})
                                    </TabsTrigger>
                                )}
                                <TabsTrigger
                                    value="word-by-word"
                                    onClick={() => runWordByWordQuery("english")}
                                >
                                    <SearchIcon />
                                    Words{searchWordByWordMatches.length > 0 ? searchWordByWordMatches.length > 2999 ? " (3,000+)" : ` (${searchWordByWordMatches.length})` : ""}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="all">
                                <div>
                                    All
                                </div>
                            </TabsContent>
                            <TabsContent value="chapters">
                                <div>
                                    {searchChapterMatches.map((r) => (
                                        <div key={`chapter:${r.chapter_number}`}>
                                            <h2>Chapter: {r.chapter_number}, {r.title_english} ({r.title_transliterated})</h2>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="text">
                                <div>
                                    {searchTextMatches.map((r) => (
                                        <div key={`text:${r.verse_id}`}>
                                            <h2>[{r.verse_id}] {r.english}</h2>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="subtitles">
                                <div>
                                    {searchSubtitleMatches.map((r) => (
                                        <div key={`subtitle:${r.verse_id}`}>
                                            <h2>Subtitle: {r.english}</h2>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="footnotes">
                                <div>
                                    {searchFootnoteMatches.map((r) => (
                                        <div key={`footnote:${r.verse_id}`}>
                                            <h2>Footnote: {r.english}</h2>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="word-by-word" onClick={() => { runWordByWordQuery("english") }}>
                                <div>
                                    {loadingWordByWord && (
                                        <Spinner />
                                    )}
                                    {searchWordByWordMatches.map((r) => (
                                        <div key={`word_by_word:${r.index}`}>
                                            <h2>[{r.verse_id}] {r.english}</h2>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>}
        </div>
    );
}