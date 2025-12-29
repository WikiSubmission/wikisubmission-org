
'use client';

import React, { useState } from 'react';
import { useMusic } from '@/lib/music-context';
import { generateColors, formatTime } from '@/lib/music-utils';
import {
    Play, Pause, SkipBack, SkipForward, Repeat, Repeat1,
    ListMusic, Heart, Volume2, Volume1, Volume, VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { TrackRow } from './track-row';

export function MusicPlayer() {
    const {
        currentTrack, isPlaying, togglePlayPause, skipNext, skipPrevious,
        progress, duration, currentTime, seek,
        loopMode, setLoopMode, favorites, toggleFavorite,
        queue, volume, setVolume
    } = useMusic();

    const [isQueueOpen, setIsQueueOpen] = useState(false);

    if (!currentTrack) return null;

    const colors = generateColors(currentTrack.artist.id);
    const isFav = favorites.includes(currentTrack.url);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none mb-4">
            <div className="max-w-5xl mx-auto pointer-events-auto">
                {/* Unified Player Bar for Mobile & Desktop */}
                <div
                    className="bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 md:h-20"
                >
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Upper Section: Info (Mobile & Desktop) / Main controls (Desktop) */}
                        <div className="flex items-center gap-4 p-2 pl-3 flex-grow min-w-0">
                            {/* Track Info */}
                            <div className="flex items-center gap-3 flex-shrink-0 min-w-0 md:w-1/3">
                                <div
                                    className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-500",
                                        isPlaying && "scale-110 shadow-lg shadow-accent/20"
                                    )}
                                    style={{ background: colors.art }}
                                >
                                    {isPlaying ? (
                                        <div className="flex gap-0.5 items-end h-4">
                                            <div className="w-1 bg-white animate-bounce [animation-duration:0.6s]" />
                                            <div className="w-1 bg-white animate-bounce [animation-duration:0.8s]" />
                                            <div className="w-1 bg-white animate-bounce [animation-duration:0.5s]" />
                                        </div>
                                    ) : (
                                        <Play className="w-5 h-5 text-white fill-white" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm md:text-base truncate">{currentTrack.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">{currentTrack.artist.name}</div>
                                </div>
                            </div>

                            {/* Center Controls Section (Desktop) */}
                            <div className="hidden md:flex flex-grow flex-col items-center justify-center gap-1 max-w-xl">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-all",
                                            loopMode === 'context' ? "text-indigo-500 bg-indigo-500/10" :
                                                loopMode === 'repeatOne' ? "text-violet-500 bg-violet-500/10" :
                                                    "text-muted-foreground"
                                        )}
                                        onClick={() => {
                                            if (loopMode === 'off') setLoopMode('context');
                                            else if (loopMode === 'context') setLoopMode('repeatOne');
                                            else setLoopMode('off');
                                        }}
                                        title={loopMode === 'context' ? "Loop Category" : loopMode === 'repeatOne' ? "Loop Track" : "Loop Off"}
                                    >
                                        {loopMode === 'repeatOne' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={skipPrevious}>
                                        <SkipBack className="w-5 h-5" fill="currentColor" />
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        className="h-11 w-11 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform"
                                        onClick={togglePlayPause}
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={skipNext}>
                                        <SkipForward className="w-5 h-5" fill="currentColor" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-8 w-8 text-muted-foreground", isFav && "text-red-500")}
                                        onClick={() => toggleFavorite(currentTrack.url)}
                                    >
                                        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                                    </Button>
                                </div>
                                <div className="w-full flex items-center gap-3">
                                    <span className="text-[10px] tabular-nums text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                                    <Slider
                                        value={[progress * 100]}
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        onValueChange={(val) => seek(val[0] / 100)}
                                        className="flex-grow"
                                    />
                                    <span className="text-[10px] tabular-nums text-muted-foreground w-10">{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Mobile Play/Pause & Next - HIDDEN (Moved to bottom) */}
                            <div className="hidden items-center gap-1 pr-2 ml-auto">
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-10 w-10 bg-accent text-accent-foreground rounded-full shadow-lg shadow-accent/20"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={skipNext}>
                                    <SkipForward className="w-5 h-5" fill="currentColor" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsQueueOpen(true)}>
                                    <ListMusic className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Right Section (Desktop) */}
                            <div className="hidden md:flex items-center justify-end gap-2 md:w-1/3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                                            {volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.33 ? <Volume className="w-5 h-5" /> : volume < 0.66 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="top" align="center" className="w-12 py-4 flex flex-col items-center gap-3">
                                        <div className="h-32">
                                            <Slider
                                                value={[volume * 100]}
                                                min={0}
                                                max={100}
                                                orientation="vertical"
                                                onValueChange={(val) => setVolume(val[0] / 100)}
                                                className="h-full !min-h-0"
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{Math.round(volume * 100)}%</span>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsQueueOpen(true)}
                                >
                                    <ListMusic className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Mobile: Second Row for Progress/Extra Controls */}
                        <div className="md:hidden px-4 pb-2 space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
                                <Slider
                                    value={[progress * 100]}
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    onValueChange={(val) => seek(val[0] / 100)}
                                    className="flex-grow"
                                />
                                <span className="text-[10px] tabular-nums text-muted-foreground">{formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center justify-between px-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 transition-all",
                                        loopMode === 'context' ? "text-indigo-500 bg-indigo-500/10" :
                                            loopMode === 'repeatOne' ? "text-violet-500 bg-violet-500/10" :
                                                "text-foreground/60"
                                    )}
                                    onClick={() => {
                                        if (loopMode === 'off') setLoopMode('context');
                                        else if (loopMode === 'context') setLoopMode('repeatOne');
                                        else setLoopMode('off');
                                    }}
                                >
                                    {loopMode === 'repeatOne' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={skipPrevious}>
                                    <SkipBack className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-12 w-12 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-500/20"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={skipNext}>
                                    <SkipForward className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-10 w-10 text-muted-foreground", isFav && "text-red-500")}
                                    onClick={() => toggleFavorite(currentTrack.url)}
                                >
                                    <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                                            {volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.33 ? <Volume className="w-5 h-5" /> : volume < 0.66 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="top" align="center" className="w-12 py-4 flex flex-col items-center gap-3">
                                        <div className="h-32">
                                            <Slider
                                                value={[volume * 100]}
                                                min={0}
                                                max={100}
                                                orientation="vertical"
                                                onValueChange={(val) => setVolume(val[0] / 100)}
                                                className="h-full !min-h-0"
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{Math.round(volume * 100)}%</span>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={() => setIsQueueOpen(true)}>
                                    <ListMusic className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Sheet */}
            <Sheet open={isQueueOpen} onOpenChange={setIsQueueOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-border bg-background flex flex-col">
                    <SheetHeader className="p-6 border-b border-border bg-muted/20">
                        <SheetTitle className="flex items-center gap-2">
                            <ListMusic className="w-5 h-5 text-accent" />
                            Up Next
                        </SheetTitle>
                        <p className="text-xs text-muted-foreground">
                            {queue.length} tracks in queue
                        </p>
                    </SheetHeader>

                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                        <div className="space-y-1">
                            {queue.map((track, i) => (
                                <TrackRow
                                    key={`${track.id}-${i}`}
                                    track={track}
                                    context={undefined} // Don't reset queue when clicking from queue
                                />
                            ))}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
