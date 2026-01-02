'use client'

import { PageSwitcher } from "@/components/page-switcher";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { SearchIcon, AlertCircleIcon, PlayIcon, NewspaperIcon, ArrowUpRight, InfoIcon, BookIcon } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, QueryResultSuccess } from "wikisubmission-sdk";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchItemTitle } from "../quran/[[...query]]/mini-components/search-item-title";
import { SearchItemChapter } from "../quran/[[...query]]/mini-components/search-item-chapter-match";
import { SearchItemAllMatches } from "../quran/[[...query]]/mini-components/search-item-all-maches";
import { StandardResult } from "../quran/[[...query]]/client-components/result-standard";
import { ws } from "@/lib/wikisubmission-sdk";
import { highlightMarkdown } from "@/lib/highlight-markdown";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import Image from "next/image";
import Link from "next/link";

type MediaRow = Database["public"]["Tables"]["ws_media"]["Row"];
type NewsletterRow = Database["public"]["Tables"]["ws_newsletters"]["Row"];

export default function SearchClient() {
    return (
        <main className="min-h-screen text-foreground flex flex-col items-center p-4 md:p-2">
            {/* Minimal Header */}
            <div className="w-full max-w-5xl px-4 h-16 flex items-center justify-between z-10">
                <PageSwitcher currentPage="search" />
                <ThemeToggle />
            </div>

            <div className="w-full max-w-4xl py-6 md:py-16 z-10">
                <div className="flex flex-col items-center mb-12">
                    <Link href="/">
                        <Image src="/brand-assets/logo-transparent.png" alt="WikiSubmission Logo"
                            width={48}
                            height={48}
                            className="rounded-full mb-4"
                        />
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent italic uppercase pr-2">
                        Search
                    </h1>
                    <p className="text-muted-foreground">
                        For anything.
                    </p>
                </div>
                <Suspense fallback={<div className="text-center opacity-20"><PlayIcon className="size-8 mx-auto animate-spin" /></div>}>
                    <SearchContent />
                </Suspense>
            </div>
        </main>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeType, setActiveType] = useState(searchParams.get('type') || 'quran');
    const [mediaResults, setMediaResults] = useState<MediaRow[] | null>(null);
    const [newsletterResults, setNewsletterResults] = useState<NewsletterRow[] | null>(null);
    const [quranResults, setQuranResults] = useState<QueryResultSuccess | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['programs', 'sermons', 'audios']);
    const quranPreferences = useQuranPreferences();

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setMediaResults(null);
            setNewsletterResults(null);
            setQuranResults(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [mediaResponse, newsletterResponse, quranResponse] = (await Promise.all([
                ws.Media.query(q, { highlight: true }),
                ws.Newsletters.query(q, { highlight: true }),
                ws.Quran.query(q, {
                    language: quranPreferences.primaryLanguage,
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
                })
            ]));

            setMediaResults(mediaResponse?.data || (Array.isArray(mediaResponse) ? mediaResponse : []));
            setNewsletterResults(newsletterResponse?.data || (Array.isArray(newsletterResponse) ? newsletterResponse : []));

            if (quranResponse.status === 'success') {
                setQuranResults(quranResponse);
            } else {
                setQuranResults(null);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during search');
            setMediaResults(null);
            setNewsletterResults(null);
            setQuranResults(null);
        } finally {
            setLoading(false);
        }
    }, [quranPreferences.primaryLanguage]);

    // Auto-switch type if current selection has no results
    useEffect(() => {
        if (loading || !mediaResults || !newsletterResults) return;

        const qCount = quranResults?.type === 'search' ? quranResults.data.filter((r) => r.hit !== 'word_by_word').length : (quranResults ? 1 : 0);
        const mCount = mediaResults.length;
        const nCount = newsletterResults.length;

        const currentType = searchParams.get('type') || activeType;
        const currentTypeCount = currentType === 'quran' ? qCount : currentType === 'media' ? mCount : nCount;

        if (currentTypeCount === 0 && (qCount + mCount + nCount) > 0) {
            if (qCount > 0) setActiveType('quran');
            else if (mCount > 0) setActiveType('media');
            else if (nCount > 0) setActiveType('newsletters');
        }
    }, [mediaResults, newsletterResults, quranResults, loading, searchParams, activeType]);

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery, performSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', trimmed);
        router.push(`/search?${params.toString()}`);
    };

    const handleTypeChange = (value: string) => {
        setActiveType(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', value);
        router.push(`/search?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full space-y-4">
            {/* Search Section */}
            <div className="w-full max-w-lg mx-auto space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 group">
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                        <Input
                            type="search"
                            placeholder="Keyword or phrase..."
                            className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            {loading && <SearchLoadingSkeleton />}

            {error && (
                <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                    <AlertCircleIcon className="size-4" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {mediaResults && newsletterResults && (
                <Tabs value={activeType} onValueChange={handleTypeChange} className="space-y-2">
                    {(() => {
                        const qCount = quranResults?.type === 'search' ? (quranResults.data.filter(r => r.hit !== 'word_by_word').length) : (quranResults ? 1 : 0);
                        const mCount = mediaResults.length;
                        const nCount = newsletterResults.length;
                        const totalCount = qCount + mCount + nCount;

                        if (totalCount === 0) {
                            return (
                                <div className="text-center py-20 text-muted-foreground font-light animate-in fade-in duration-700">
                                    <SearchIcon className="size-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg">No results found for &quot;{searchQuery}&quot;</p>
                                    <p className="text-sm opacity-60">Try different keywords or check for typos.</p>
                                </div>
                            );
                        }

                        return (
                            <>
                                <div className="flex justify-center">
                                    <TabsList className="bg-secondary/50 p-1 overflow-x-auto no-scrollbar">
                                        {qCount > 0 && (
                                            <TabsTrigger value="quran" className="flex-1 md:flex-initial px-3 md:px-4 h-full flex items-center gap-1.5 md:gap-2 justify-center">
                                                <BookIcon className="size-3.5" />
                                                <span className="text-xs md:text-sm font-medium">Quran ({qCount})</span>
                                            </TabsTrigger>
                                        )}
                                        {mCount > 0 && (
                                            <TabsTrigger value="media" className="flex-1 md:flex-initial px-3 md:px-4 h-full flex items-center gap-1.5 md:gap-2 justify-center">
                                                <PlayIcon className="size-3.5" />
                                                <span className="text-xs md:text-sm font-medium">Media ({mCount})</span>
                                            </TabsTrigger>
                                        )}
                                        {nCount > 0 && (
                                            <TabsTrigger value="newsletters" className="flex-1 md:flex-initial px-3 md:px-4 h-full flex items-center gap-1.5 md:gap-2 justify-center">
                                                <NewspaperIcon className="size-3.5" />
                                                <span className="text-xs md:text-sm font-medium">Newsletters ({nCount})</span>
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </div>



                                {qCount > 0 && quranResults && (
                                    <TabsContent value="quran">
                                        <QuranSection results={quranResults} searchQuery={searchQuery} />
                                    </TabsContent>
                                )}

                                {mCount > 0 && (
                                    <TabsContent value="media" >
                                        <MediaSection
                                            results={mediaResults}
                                            selectedCategories={selectedCategories}
                                            setSelectedCategories={setSelectedCategories}
                                        />
                                    </TabsContent>
                                )}

                                {nCount > 0 && (
                                    <TabsContent value="newsletters">
                                        <NewsletterSection results={newsletterResults} />
                                    </TabsContent>
                                )}
                            </>
                        );
                    })()}
                </Tabs>
            )}
        </div>
    );
}

function SearchLoadingSkeleton() {
    return (
        <div className="space-y-4 pt-8 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="md:flex gap-6 items-start p-4 bg-muted/30 rounded-2xl">
                    <Skeleton className="flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg" />
                    <div className="flex-1 space-y-4 mt-2 md:mt-0">
                        <Skeleton className="h-5 w-2/3 rounded" />
                        <div className="space-y-3">
                            {[1, 2].map((j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 flex-1 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function QuranSection({ results, searchQuery }: { results: QueryResultSuccess, searchQuery: string }) {
    const quranPreferences = useQuranPreferences();

    return (
        <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
                {(results.type === "chapter" || results.type === "verse" || results.type === "multiple_verses") && (
                    <StandardResult props={{ query: searchQuery, data: results }} />
                )}

                {results.type === "search" && (
                    <div className="space-y-4">
                        <SearchItemTitle props={{ results: results }} />

                        {/* Filters */}
                        <section className="flex flex-wrap items-center gap-6 px-1 border-b border-border/40">
                            <div className="flex items-center gap-2 [&>*]:text-[10px] uppercase tracking-widest font-bold">
                                <Checkbox
                                    checked={quranPreferences.text}
                                    onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, text: !!v })}
                                    id="q-text"
                                    className="border-violet-600/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label htmlFor="q-text" className="cursor-pointer group-hover:text-violet-600 transition-colors">
                                    Text ({results.data.filter(r => r.hit === 'text').length})
                                </Label>
                            </div>

                            <div className="flex items-center gap-2 [&>*]:text-[10px] uppercase tracking-widest font-bold">
                                <Checkbox
                                    checked={quranPreferences.subtitles}
                                    onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, subtitles: !!v })}
                                    id="q-subtitles"
                                    className="border-violet-600/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label htmlFor="q-subtitles" className="cursor-pointer group-hover:text-violet-600 transition-colors">
                                    Subtitles ({results.data.filter(r => r.hit === 'subtitle').length})
                                </Label>
                            </div>

                            <div className="flex items-center gap-2 [&>*]:text-[10px] uppercase tracking-widest font-bold">
                                <Checkbox
                                    checked={quranPreferences.footnotes}
                                    onCheckedChange={(v) => quranPreferences.setPreferences({ ...quranPreferences, footnotes: !!v })}
                                    id="q-footnotes"
                                    className="border-violet-600/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label htmlFor="q-footnotes" className="cursor-pointer group-hover:text-violet-600 transition-colors">
                                    Footnotes ({results.data.filter(r => r.hit === 'footnote').length})
                                </Label>
                            </div>
                        </section>

                        <div className="space-y-2">
                            {results.data.filter(r => r.hit === 'chapter').map((r) => (
                                <div key={`chapter:${r.chapter_number}`} className="space-y-4" >
                                    <SearchItemChapter chapter={r} />
                                </div>
                            ))}
                            {results.data.filter(r => r.hit !== 'chapter' && r.hit !== 'word_by_word').map((r) => (
                                <div className="space-y-4" key={`${r.hit}:${r.verse_index}:${'verse_id' in r ? r.verse_id : ''}`}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <SearchItemAllMatches props={{ results: r as any }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MediaSection({
    results,
    selectedCategories,
    setSelectedCategories
}: {
    results: MediaRow[],
    selectedCategories: string[],
    setSelectedCategories: (cats: string[]) => void
}) {
    const categories = ['programs', 'sermons', 'audios'];
    const hasCategorySupport = categories.some(cat => results.filter(item => item.category?.toLowerCase() === cat).length > 0);

    return (
        <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {hasCategorySupport && (
                <div className="flex flex-wrap items-center gap-6 py-2 px-1 border-b border-border/40">
                    {categories.map((cat) => {
                        const count = results.filter(item => item.category?.toLowerCase() === cat).length;
                        if (count === 0) return null;

                        return (
                            <div key={cat} className="flex items-center gap-2 cursor-pointer group">
                                <Checkbox
                                    id={`cat-${cat}`}
                                    checked={selectedCategories.includes(cat)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedCategories([...selectedCategories, cat]);
                                        } else {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                        }
                                    }}
                                    className="border-violet-600/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label
                                    htmlFor={`cat-${cat}`}
                                    className="text-[10px] uppercase tracking-widest font-bold cursor-pointer group-hover:text-violet-600 transition-colors flex items-center gap-1.5 leading-none"
                                >
                                    <span className="leading-none">{cat}</span>
                                    <span className="text-[9px] opacity-40 font-mono leading-none">({count})</span>
                                </Label>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-xs text-muted-foreground flex items-start gap-2">
                <InfoIcon className="text-violet-600 size-3.5" />
                Verify all information. Transcripts derived using AI transcription on the original content.
            </p>

            {(() => {
                const categoryPriority: Record<string, number> = { 'programs': 1, 'sermons': 2, 'audios': 3 };
                const filtered = results
                    .filter(item => !item.category || selectedCategories.includes(item.category.toLowerCase()))
                    .sort((a, b) => {
                        const aP = categoryPriority[a.category?.toLowerCase() || ''] || 99;
                        const bP = categoryPriority[b.category?.toLowerCase() || ''] || 99;
                        return aP - bP;
                    });

                if (filtered.length === 0) return (
                    <div className="text-center py-12 text-muted-foreground font-light">
                        No results for selected categories
                    </div>
                );

                const groups: Record<string, MediaRow[]> = {};
                filtered.forEach(item => {
                    const id = item.youtube_id;
                    if (!groups[id]) groups[id] = [];
                    groups[id].push(item);
                });
                return Object.entries(groups).map(([id, items]) => (
                    <MediaSearchResult key={id} items={items} />
                ));
            })()}
        </div>
    );
}

function NewsletterSection({ results }: { results: NewsletterRow[] }) {
    return (
        <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {(() => {
                const groups: Record<string, NewsletterRow[]> = {};
                results.forEach(item => {
                    const id = `${item.year}_${item.month}`;
                    if (!groups[id]) groups[id] = [];
                    groups[id].push(item);
                });
                return Object.entries(groups).map(([id, items]) => (
                    <NewsletterSearchResult key={id} items={items} />
                ));
            })()}
        </div>
    );
}

function MediaSearchResult({ items }: { items: MediaRow[] }) {
    return (
        <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:flex space-y-2 gap-6 items-start p-4 bg-muted/50 rounded-2xl">
                <div className="relative flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg overflow-hidden bg-secondary group-hover:shadow-lg group-hover:shadow-violet-600/10 transition-all duration-300">
                    <Image
                        src={`https://img.youtube.com/vi/${items[0].youtube_id}/mqdefault.jpg`}
                        alt={items[0].title}
                        fill
                        className="object-cover transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                    <h3 className="text-lg font-black text-foreground leading-tight tracking-tight uppercase pr-2 transition-colors">
                        {items[0].title}
                    </h3>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground/80 group/match transition-colors">
                                <span className="flex items-start gap-3">
                                    <Link
                                        href={`https://www.youtube.com/watch?v=${item.youtube_id}&t=${item.youtube_timestamp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-600 flex items-center gap-1.5 bg-violet-600/10 px-2 py-1 rounded-full hover:bg-violet-600/20 transition-all flex-shrink-0 mt-0.5"
                                    >
                                        <PlayIcon className="size-3 text-violet-600" />
                                        <span className="text-[10px] font-mono font-bold">
                                            {item.start_timestamp}
                                        </span>
                                    </Link>
                                    <p className="leading-relaxed">
                                        {highlightMarkdown(item.transcript || '')}
                                    </p>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NewsletterSearchResult({ items }: { items: NewsletterRow[] }) {
    const firstItem = items[0];
    const displayTitle = `${firstItem.month} ${firstItem.year}`;

    return (
        <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:flex gap-6 items-start p-4 space-y-2 bg-muted/50 rounded-2xl transition-colors hover:bg-muted/70">

                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <NewspaperIcon className="size-4 text-violet-600" />
                            <h3 className="text-lg font-black text-foreground leading-tight tracking-tight uppercase transition-colors">
                                {highlightMarkdown(displayTitle)}
                            </h3>
                        </div>
                        <Link
                            href={`https://library.wikisubmission.org/file/sp/${items[0].year}_${items[0].month}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 w-fit flex items-center gap-1.5 bg-muted/100 px-2 py-1 rounded-full hover:bg-muted/80 transition-all flex-shrink-0 mt-0.5"
                        >
                            <ArrowUpRight className="size-3" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                PDF
                            </span>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground/80 group/match transition-colors">
                                <div className="flex items-start gap-3">
                                    <Link
                                        href={`https://masjidtucson.org/publications/books/sp/${item.year}/${item.month}/page${item.page}.html`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-600 flex items-center gap-1.5 bg-violet-600/10 px-2 py-1 rounded-full hover:bg-violet-600/20 transition-all flex-shrink-0 mt-0.5"
                                    >
                                        <ArrowUpRight className="size-3" />
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                            PAGE {item.page}
                                        </span>
                                    </Link>
                                    <p className="leading-relaxed font-light">
                                        {highlightMarkdown(item.content || '')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
