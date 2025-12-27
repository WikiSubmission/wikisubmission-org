'use client';

import { ws } from "@/lib/wikisubmission-sdk";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { QueryResultSuccess } from "wikisubmission-sdk";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { QuranSearchResultItem } from "../mini-components/hit-verse";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuranWordResultItem } from "../mini-components/hit-word";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import HitChapter from "../mini-components/hit-chapter";
import StandardResult from "./result-standard";
import Link from "next/link";

export default function SearchResult({ props }: { props: { query: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = props.query;
    const forceTab = searchParams.get("tab");

    const quranPreferences = useQuranPreferences();

    const [loading, setLoading] = useState(false);
    const [loadingWordByWord, setLoadingWordByWord] = useState(false);

    const [results, setResults] = useState<QueryResultSuccess | null>(null);
    const [searchTab, setSearchTab] = useState<"all" | "words">("all");
    const [searchWordByWordMatches, setSearchWordByWordMatches] = useState<SearchHitWordByWord[]>([]);

    const didInitRef = useRef(false);
    const lastQueryRef = useRef<string | null>(null);

    const runQuery = useCallback(async () => {
        setSearchTab("all");
        setSearchWordByWordMatches([]);

        if (!searchQuery) return;

        setLoading(true);

        const query = await ws.Quran.query(decodeURIComponent(searchQuery), {
            language: quranPreferences.primaryLanguage,
            strategy: "default",
            highlight: true,
            normalizeGodCasing: true,
            adjustments: {
                index: true,
                chapters: true,
                subtitles: true,
                footnotes: true,
                wordByWord: true,
            }
        });

        if (query.status === "success") {
            if (query.type === "verse") {
                router.replace(
                    `/quran/${query.data[0].chapter_number}?verse=${query.data[0].verse_number}`,
                    { scroll: false }
                );
            } else {
                setResults(query);
            }
        } else {
            toast.error(decodeURIComponent(query.error));
        }

        setLoading(false);
    }, [searchQuery, router, quranPreferences.primaryLanguage]);

    const runWordByWordQuery = useCallback(async (field: "english" | "meanings") => {
        if (searchWordByWordMatches.length > 0) return;
        if (!searchQuery) {
            toast.error("No search query provided");
            return;
        }

        setLoadingWordByWord(true);
        setSearchWordByWordMatches([]);

        const dbQuery = await ws.Quran.query(decodeURIComponent(searchQuery), {
            language: "english",
            strategy: "default",
            highlight: true,
            normalizeGodCasing: true,
            adjustments: {
                index: false,
                chapters: false,
                subtitles: false,
                footnotes: false,
                wordByWord: { field },
            },
        });

        if (dbQuery.status === "success" && dbQuery.type === "search" && dbQuery.data?.some(i => i.hit === "word_by_word")) {
            setSearchWordByWordMatches(dbQuery.data.filter(i => i.hit === "word_by_word"));
        } else if (dbQuery.status === "error") {
            toast.error(decodeURIComponent(dbQuery.error));
        } else {
            toast.error(`No results found for '${decodeURIComponent(searchQuery)}'`);
        }

        setLoadingWordByWord(false);
    }, [searchQuery, searchWordByWordMatches]);

    useEffect(() => {
        const isNewQuery = searchQuery !== lastQueryRef.current;

        if (isNewQuery) {
            lastQueryRef.current = searchQuery;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (searchQuery) runQuery();
            return;
        }

        if (!didInitRef.current) {
            didInitRef.current = true;
            if (forceTab === "words") {
                setSearchTab("words");
                runWordByWordQuery("english");
            }
        }
    }, [searchQuery, forceTab, runQuery, runWordByWordQuery]);

    const searchAllMatches = results?.type === "search" ? results.data : [];
    const searchChapterMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "chapter") : [];
    const searchSubtitleMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "subtitle") : [];
    const searchTextMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "text") : [];
    const searchFootnoteMatches = results?.type === "search" ? searchAllMatches.filter((r) => r.hit === "footnote") : [];

    return (
        <div>
            {loading && <div className="p-4 flex justify-center items-center">
                <Spinner />
            </div>}

            {results && (results.type === "chapter" || results.type === "verse" || results.type === "multiple_verses") && (
                <StandardResult props={{ query: props.query, data: results }} />
            )}

            {results && results.type === "search" && (searchQuery?.length ?? 0) > 0 && <div className="space-y-2">
                <section>
                    <h2 className="text-xl font-bold">
                        {results.metadata.formattedQuery}
                    </h2>
                </section>
                {results.type === "search" && (
                    <div className="space-y-4">
                        <Tabs
                            value={searchTab}
                            onValueChange={(v) => {
                                const tab = v as typeof searchTab;
                                setSearchTab(tab);

                                const params = new URLSearchParams(searchParams.toString());
                                params.set("tab", tab);
                                router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });

                                if (tab === "words") runWordByWordQuery("english");
                            }}
                            className="space-y-2"
                        >

                            {/* Tab Selection */}

                            <TabsList className="flex [&>*]:text-xs">
                                <TabsTrigger value="all">
                                    Results ({searchAllMatches.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="words"
                                >
                                    <SearchIcon />
                                    Word Search{searchWordByWordMatches.length > 0 ? searchWordByWordMatches.length > 2999 ? " (3,000+)" : ` (${searchWordByWordMatches.length})` : ""}
                                </TabsTrigger>
                            </TabsList>

                            {/* Filter Selection */}
                            {searchTab === "all" && (
                                <section className="flex items-center gap-4">
                                    {searchTextMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.text} onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, text: v ? true : false })} id="text" />
                                            <Label htmlFor="text">
                                                Text ({searchTextMatches.length})
                                            </Label>
                                        </div>
                                    )}

                                    {searchSubtitleMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.subtitles} onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, subtitles: v ? true : false })} id="subtitles" />
                                            <Label htmlFor="subtitles">
                                                Subtitles ({searchSubtitleMatches.length})
                                            </Label>
                                        </div>
                                    )}

                                    {searchFootnoteMatches.length > 0 && (
                                        <div className="flex items-center gap-2 [&>*]:text-xs">
                                            <Checkbox checked={quranPreferences.footnotes} onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, footnotes: v ? true : false })} id="footnotes" />
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
                                    <section className="space-y-2">
                                        {searchChapterMatches.map((r) => (
                                            <div key={`chapter:${r.hit}:${r.chapter_number}`}>
                                                <HitChapter chapter={r} />
                                            </div>
                                        ))}
                                    </section>
                                )}
                                <div>
                                    <section className="space-y-2">
                                        {searchAllMatches.filter((r) => {
                                            const fields: ("text" | "subtitle" | "footnote")[] = [];

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
                                <div className="space-y-2">
                                    {loadingWordByWord && (
                                        <Spinner />
                                    )}
                                    {searchWordByWordMatches.length === 0 && !loadingWordByWord && (
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground">
                                                No matches
                                            </p>
                                            {props.query.split(" ").length > 1 && (
                                                <div className="bg-muted/50 p-4 rounded-2xl space-y-2">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <SearchIcon className="size-4" />
                                                        <p>
                                                            Try searching:
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {props.query.split(" ").map((q) => (
                                                            <div key={q} className="flex items-center gap-2 text-violet-600 hover:text-violet-700 hover:cursor-pointer">
                                                                <a href={`?q=${q}&tab=words`}>
                                                                    {q}
                                                                </a>
                                                                <ArrowRightIcon className="size-4" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {searchWordByWordMatches.length > 0 && (
                                        <div className="space-y-2">
                                            {Array.from(new Map(
                                                searchWordByWordMatches.map(item => [item.root_word, item])
                                            ).values()).map((item) => (
                                                <section key={item.root_word} className="bg-muted/50 p-4 rounded-2xl space-y-2">
                                                    <p className="text-xl text-muted-foreground tracking-wider">
                                                        {item.transliterated} / {item.arabic}
                                                    </p>
                                                    <p className="w-fit rounded-2xl">
                                                        <strong>Root word:</strong> {item.root_word}
                                                    </p>
                                                    <p className="w-fit rounded-2xl gap-1 flex flex-wrap">
                                                        <strong>Verses ({searchWordByWordMatches.filter((r) => r.root_word === item.root_word).length}):</strong> {searchWordByWordMatches
                                                            .filter((r) => r.root_word === item.root_word)
                                                            .map((r) => (
                                                                <Link
                                                                    key={`root:${r.verse_id}:${r.word_index}`}
                                                                    href={`/quran/${r.chapter_number}?verse=${r.verse_number}&word=${r.word_index}`}
                                                                    target="_blank"
                                                                    className="hover:cursor-pointer underline text-violet-500"
                                                                >
                                                                    {r.verse_id}
                                                                </Link>
                                                            ))
                                                        }
                                                    </p>
                                                    {item.meanings && (
                                                        <p className="w-fit rounded-2xl">
                                                            <strong>Meanings:</strong> {item.meanings}
                                                        </p>
                                                    )}
                                                </section>
                                            ))}
                                        </div>
                                    )}
                                    {searchWordByWordMatches.map((r) => (
                                        <div key={`word_by_word:${r.index}`}>
                                            <QuranWordResultItem verse={r} />
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