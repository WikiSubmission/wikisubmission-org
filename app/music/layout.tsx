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

        const tracks = (tracksRes.data as unknown as DBTrackRow[]) || [];
        const categories = (catsRes.data as DBCategory[]) || [];
        const artists = (artistsRes.data as DBArtist[]) || [];

        return (
            <MusicProvider
                initialTracks={tracks}
                initialCategories={categories}
                initialArtists={artists}
            >
                {children}
            </MusicProvider>
        );
    } catch (e) {
        console.error("Failed to fetch music data server-side:", e);
        // Fallback to client-side fetching by passing empty arrays (MusicProvider handles this logic? 
        // No, current logic only fetches if arrays are empty. 
        // If server error, we pass empty, client might retry if we structured it that way, 
        // but currently client only fetches if initialTracks.length > 0 check fails? 
        // Actually my logic in MusicProvider was: if (initialTracks.length > 0) return; else fetch.
        // So this fallback works perfectly.)
        return (
            <MusicProvider>
                {children}
            </MusicProvider>
        );
    }
}