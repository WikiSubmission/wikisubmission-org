
import MusicClient from './music-client';
import { ws } from "@/lib/wikisubmission-sdk";
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ track?: string }> }): Promise<Metadata> {
    const { track: trackId } = await searchParams;

    if (trackId) {
        try {
            const { data: track } = await ws.supabase
                .from('ws_music_tracks')
                .select('*, artistObj:ws_music_artists(*)')
                .eq('id', trackId)
                .single();

            if (track) {
                const title = `${track.name} by ${track.artistObj?.name || 'Unknown Artist'} | Music (Zikr) | WikiSubmission`;
                const description = `Listen to ${track.name} by ${track.artistObj?.name || 'Unknown Artist'} on WikiSubmission. Glorification and commemoration of God through beautiful recitations and melodies.`;

                return {
                    title,
                    description,
                    openGraph: {
                        title,
                        description,
                        type: 'music.song',
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title,
                        description,
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching track for metadata:', error);
        }
    }

    return {
        title: "Music (Zikr) | WikiSubmission",
        description: "Glorification and commemoration of God through beautiful recitations and melodies.",
        openGraph: {
            title: "Music (Zikr) | WikiSubmission",
            description: "Glorification and commemoration of God through beautiful recitations and melodies.",
        },
    };
}

export default function MusicPage() {
    return <MusicClient />;
}
