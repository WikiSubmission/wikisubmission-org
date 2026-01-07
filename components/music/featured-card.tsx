
'use client';

import React from 'react';
import { UnifiedTrack } from '@/types/music';
import { useMusic } from '@/lib/music-context';
import { generateColors } from '@/lib/music-utils';
import { Music3 } from 'lucide-react';

export function FeaturedCard({ track }: { track: UnifiedTrack }) {
    const { playTrack } = useMusic();
    const colors = generateColors(track.artist.id);

    return (
        <div
            id={`track-${track.id}`}
            onClick={() => playTrack(track, 'category')}
            className="relative flex-shrink-0 w-64 h-36 rounded-2xl p-4 cursor-pointer overflow-hidden transition-transform active:scale-95 group"
            style={{ background: colors.card }}
        >
            <div className="absolute top-4 left-4 opacity-50">
                <Music3 className="w-8 h-8 text-white" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="text-white font-bold line-clamp-2 leading-tight mb-1">
                    {track.title}
                </div>
                <div className="text-white/60 text-xs truncate">
                    {track.artist.name}
                </div>
            </div>

            {/* Subtle glow effect */}
            <div
                className="absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                style={{ background: colors.accent }}
            />
        </div>
    );
}
