
'use client';

import React from 'react';
import { UnifiedTrack } from '@/types/music';
import { useMusic } from '@/lib/music-context';
import { generateColors } from '@/lib/music-utils';
import { Play, Pause, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackRowProps {
    track: UnifiedTrack;
    context?: any;
}

export function TrackRow({ track, context }: TrackRowProps) {
    const { currentTrack, isPlaying, playTrack, toggleFavorite, favorites } = useMusic();
    const isCurrent = currentTrack?.id === track.id;
    const isFav = favorites.includes(track.url);
    const colors = generateColors(track.artist.id);

    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-2 rounded-xl transition-all hover:bg-muted/50",
                isCurrent && "bg-accent/10"
            )}
        >
            <div
                className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ background: colors.art }}
                onClick={() => playTrack(track, context)}
            >
                {isCurrent && isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="white" />
                ) : (
                    <Play className={cn("w-6 h-6 text-white group-hover:opacity-100 transition-opacity", isCurrent ? "opacity-100" : "opacity-0")} fill="white" />
                )}
            </div>

            <div
                className="flex-grow min-w-0 cursor-pointer"
                onClick={() => playTrack(track, context)}
            >
                <div className={cn("font-medium truncate", isCurrent && "text-violet-500")}>
                    {track.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                    {track.artist.name}
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.url);
                }}
                className="p-2 transition-transform active:scale-90"
            >
                <Heart
                    className={cn(
                        "w-5 h-5 transition-colors",
                        isFav ? "text-red-500 fill-red-500" : "text-muted-foreground"
                    )}
                />
            </button>
        </div>
    );
}
