import type { Metadata } from "next";
import { MusicProvider } from "@/lib/music-context";
import { ws } from "@/lib/wikisubmission-sdk";
import { DBTrackRow, DBArtist, DBCategory } from "@/types/music";

export const metadata: Metadata = {
    title: "Music (Zikr) | WikiSubmission",
    description: "Glorification and commemoration of God through beautiful recitations and melodies.",
    openGraph: {
        title: "Music (Zikr) | WikiSubmission",
        description: "Glorification and commemoration of God through beautiful recitations and melodies.",
    },
};

export const dynamic = 'force-dynamic';

export default async function MusicLayout({ children }: { children: React.ReactNode }) {
    let tracks: DBTrackRow[] = [];
    let categories: DBCategory[] = [];
    let artists: DBArtist[] = [];

    try {
        const [tracksRes, catsRes, artistsRes] = await Promise.all([
            ws.supabase
                .from('ws_music_tracks')
                .select('*, artistObj:ws_music_artists(*), categoryObj:ws_music_categories(*)')
                .order('release_date', { ascending: false }),
            ws.supabase
                .from('ws_music_categories')
                .select('*')
                .order('display_priority', { ascending: false }),
            ws.supabase
                .from('ws_music_artists')
                .select('*')
                .order('display_priority', { ascending: false })
        ]);

        if (tracksRes.data) tracks = tracksRes.data as unknown as DBTrackRow[];
        if (catsRes.data) categories = catsRes.data as DBCategory[];
        if (artistsRes.data) artists = artistsRes.data as DBArtist[];
    } catch (e) {
        console.error("Failed to fetch music data server-side:", e);
    }

    return (
        <MusicProvider
            initialTracks={tracks}
            initialCategories={categories}
            initialArtists={artists}
        >
            {children}
        </MusicProvider>
    );
}