
'use client';

import { useState } from 'react';
import { useMusic } from '@/lib/music-context';
import { GeometryDots } from "@/components/geometry-dots";
import { PageSwitcher } from "@/components/page-switcher";
import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { FeaturedCard } from '@/components/music/featured-card';
import { TrackRow } from '@/components/music/track-row';
import { MusicPlayer } from '@/components/music/music-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Heart, Music2, Search, Clock } from 'lucide-react';

export default function ZikrPage() {
    const { allTracks, categories, isLoading, favorites } = useMusic();
    const [searchQuery, setSearchQuery] = useState('');

    const featuredTracks = allTracks.filter(t => t.featured);
    const favoriteTracks = allTracks.filter(t => favorites.includes(t.url));

    const filteredTracks = searchQuery
        ? allTracks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allTracks;

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center pb-32">
            <GeometryDots />

            {/* Nav Header */}
            <div className="w-full max-w-5xl px-4 h-16 flex items-center justify-between z-10 top-0 bg-background/50 backdrop-blur-md">
                <PageSwitcher currentPage="music" />
                <ThemeToggle />
            </div>

            {/* Hero Section */}
            <div className="w-full max-w-5xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
                <div className="flex-grow space-y-4 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent italic">
                        ZIKR
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                        Glorification and commemoration of God through beautiful recitations and melodies.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search tracks or artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="w-full max-w-5xl px-4 z-10 space-y-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse font-medium">Preparing your spiritual journey...</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        {!searchQuery && featuredTracks.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Music2 className="text-accent" /> Featured
                                    </h2>
                                </div>
                                <div className="w-full overflow-x-auto no-scrollbar shadow-inner rounded-3xl">
                                    <div className="flex p-4 gap-4">
                                        {featuredTracks.map(track => (
                                            <FeaturedCard key={track.id} track={track} />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Main Content Tabs */}
                        <Tabs defaultValue="all" className="w-full">
                            <div className="flex items-center justify-between mb-8 overflow-x-auto custom-scrollbar">
                                <TabsList className="bg-muted/30 p-1 rounded-2xl">
                                    <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Explore</TabsTrigger>
                                    <TabsTrigger value="favorites" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 flex items-center gap-2">
                                        <Heart className="w-4 h-4" /> Favorites
                                    </TabsTrigger>
                                    <TabsTrigger value="recent" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> New
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="all" className="space-y-8 mt-0 focus-visible:outline-none">
                                {searchQuery ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {filteredTracks.map(track => (
                                            <TrackRow key={track.id} track={track} context="allTracks" />
                                        ))}
                                        {filteredTracks.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-muted-foreground italic">
                                                No results found for &apos;{searchQuery}&apos;
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    categories.map(category => {
                                        const tracksInCategory = allTracks.filter(t => t.category.id === category.id);
                                        if (tracksInCategory.length === 0) return null;
                                        return (
                                            <div key={category.id} className="space-y-4">
                                                <h3 className="text-xl font-bold pl-2 border-l-4 border-accent">
                                                    {category.name}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {tracksInCategory.map(track => (
                                                        <TrackRow key={track.id} track={track} context="category" />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </TabsContent>

                            <TabsContent value="favorites" className="mt-0 focus-visible:outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {favoriteTracks.length > 0 ? (
                                        favoriteTracks.map(track => (
                                            <TrackRow key={track.id} track={track} context="favorites" />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-24 text-center space-y-4">
                                            <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                                            <p className="text-muted-foreground italic">You haven&apos;t favorited any tracks yet.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="recent" className="mt-0 focus-visible:outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[...allTracks].sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime()).slice(0, 10).map(track => (
                                        <TrackRow key={track.id} track={track} context="allTracks" />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Info Footer */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This collection is frequently updated. All materials are copyrighted by their respective holders. WikiSubmission provides this as a service for the community.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Global Music Player Bar */}
            <MusicPlayer />
        </main>
    );
}
