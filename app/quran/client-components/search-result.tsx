'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { QueryResultSuccess } from "wikisubmission-sdk";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { SearchIcon } from "lucide-react";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { QuranSearchResultItem } from "./verse-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ws } from "@/lib/wikisubmission-sdk";
import useLocalStorage from "@/hooks/use-local-storage";
import ChapterCard from "./chapter-card";
import { useRouter } from "next/navigation";

export default function SearchResult() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q");
    const forceTab = searchParams.get("tab");

    const [loading, setLoading] = useState(false);
    const [loadingWordByWord, setLoadingWordByWord] = useState(false);

    const [results, setResults] = useState<QueryResultSuccess | null>(null);
    const [searchTab, setSearchTab] = useState<"all" | "words">("all");
    const [searchWordByWordMatches, setSearchWordByWordMatches] = useState<SearchHitWordByWord[]>([]);
    const [lastWordByWordQuery, setLastWordByWordQuery] = useState("");

    const [quranPreferences, setQuranPreferences] = useLocalStorage("quranPreferences", {
        text: true,
        subtitles: true,
        footnotes: true,
    });

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
        if (forceTab) {
            setSearchTab(forceTab as typeof searchTab);
            if (forceTab === "words" && searchWordByWordMatches.length === 0) {
                runWordByWordQuery("english")
            }
        }
    }, [runQuery]);

    const searchAllMatches = results?.type === "search" ? results.data : [];
    const searchChapterMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "chapter") : [];
    const searchSubtitleMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "subtitle") : [];
    const searchTextMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "text") : [];
    const searchFootnoteMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "footnote") : [];

    const runWordByWordQuery = async (field: "english" | "meanings") => {

        if (searchWordByWordMatches.length > 0) {
            return;
        }

        if (!searchQuery) {
            toast.error("No search query provided");
            return;
        }

        setLoadingWordByWord(true);
        setSearchWordByWordMatches([]);

        const dbQuery = await ws.Quran.query(searchQuery, {
            language: "english",
            strategy: "default",
            highlight: true,
            normalizeGodCasing: true,
            adjustments: {
                index: false,
                chapters: false,
                subtitles: false,
                footnotes: false,
                wordByWord: {
                    field
                },
            }
        });

        if (dbQuery.status === "success" && dbQuery.type === "search" && dbQuery.data && dbQuery.data.length > 0) {
            setSearchWordByWordMatches(
                dbQuery.data.filter((i) => i.hit === "word_by_word")
            );
        } else {
            toast.error(dbQuery?.status || `No results found for '${searchQuery}'`);
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
                        {results.metadata.formattedQuery}
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
                            onValueChange={(v) => {
                                setSearchTab(v as typeof searchTab);
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("tab", v);
                                router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
                                if (v === "words") runWordByWordQuery("english");
                            }}
                            className="space-y-2"
                        >

                            {/* Tab Selection */}

                            <TabsList className="flex [&>*]:text-xs">
                                <TabsTrigger value="all">
                                    Results ({searchAllMatches.length})
                                </TabsTrigger>
                                {searchChapterMatches.length > 0 && (
                                    <TabsTrigger value="chapters">
                                        Chapters ({searchChapterMatches.length})
                                    </TabsTrigger>
                                )}
                                <TabsTrigger
                                    value="words"
                                >
                                    <SearchIcon />
                                    Words{searchWordByWordMatches.length > 0 ? searchWordByWordMatches.length > 2999 ? " (3,000+)" : ` (${searchWordByWordMatches.length})` : ""}
                                </TabsTrigger>
                            </TabsList>

                            {/* Filter Selection */}
                            {searchTab === "all" && (
                                <section className="flex items-center gap-4">
                                    {searchTextMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.text} onCheckedChange={(v) => setQuranPreferences({ ...quranPreferences, text: v ? true : false })} id="text" />
                                            <Label htmlFor="text">
                                                Text ({searchTextMatches.length})
                                            </Label>
                                        </div>
                                    )}

                                    {searchSubtitleMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.subtitles} onCheckedChange={(v) => setQuranPreferences({ ...quranPreferences, subtitles: v ? true : false })} id="subtitles" />
                                            <Label htmlFor="subtitles">
                                                Subtitles ({searchSubtitleMatches.length})
                                            </Label>
                                        </div>
                                    )}

                                    {searchFootnoteMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.footnotes} onCheckedChange={(v) => setQuranPreferences({ ...quranPreferences, footnotes: v ? true : false })} id="footnotes" />
                                            <Label htmlFor="footnotes">
                                                Footnotes ({searchFootnoteMatches.length})
                                            </Label>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Content */}
                            <TabsContent value="all" className="space-y-2">
                                {searchChapterMatches.length > 0 && (
                                    <div>
                                        <section className="space-y-2">
                                            {searchChapterMatches.map((r) => (
                                                <div key={`chapter:${r.hit}:${r.chapter_number}`}>
                                                    <ChapterCard chapter={r} />
                                                </div>
                                            ))}
                                        </section>
                                    </div>
                                )}
                                <div>
                                    <section className="space-y-2">
                                        {searchAllMatches.filter((r) => {
                                            let fields: ("text" | "subtitle" | "footnote")[] = [];

                                            if (quranPreferences.text) fields.push("text");
                                            if (quranPreferences.subtitles) fields.push("subtitle");
                                            if (quranPreferences.footnotes) fields.push("footnote");

                                            return fields.some((f) => r.hit.includes(f));
                                        }).map((r) => (
                                            <div key={`all:${r.hit}:${'verse_id' in r ? r.verse_id : ''}`}>
                                                <QuranSearchResultItem verse={r} />
                                            </div>
                                        ))}
                                    </section>
                                </div>
                            </TabsContent>
                            <TabsContent value="words">
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