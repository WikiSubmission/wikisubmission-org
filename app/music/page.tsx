import MusicClient from './music-client';
import { ws } from "@/lib/wikisubmission-sdk";
import type { Metadata } from 'next';

export default async function MusicPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
    return <MusicClient />;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ track?: string }> }): Promise<Metadata> {
    const { track: trackId } = await searchParams;

    if (trackId) {
        try {
            const { data: track } = await ws.supabase
                .from('ws_music_tracks')
                .select('*, artistObj:ws_music_artists(*)')
                .eq('id', trackId)
                .single();

            if (track && track.artistObj) {
                const title = `${track.name} by ${track.artistObj.name} | Music (Zikr) | WikiSubmission`;
                const description = `Listen to ${track.name} by ${track.artistObj.name} on WikiSubmission. Glorification and commemoration of God through beautiful recitations and melodies.`;

                return {
                    title,
                    description,
                    openGraph: {
                        title,
                        description,
                        type: 'music.song',
                        images: track.artistObj.image_url ? [track.artistObj.image_url] : [],
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title,
                        description,
                        images: track.artistObj.image_url ? [track.artistObj.image_url] : [],
                    }
                };
            }
        } catch (error) {
            console.error('Error fetching track for metadata:', error);
        }
    }

    const defaultTitle = "Music (Zikr) | WikiSubmission";
    const defaultDescription = "Glorification and commemoration of God through beautiful recitations and melodies.";

    return {
        title: defaultTitle,
        description: defaultDescription,
        openGraph: {
            title: defaultTitle,
            description: defaultDescription,
        },
        twitter: {
            card: 'summary_large_image',
            title: defaultTitle,
            description: defaultDescription,
        }
    };
}
