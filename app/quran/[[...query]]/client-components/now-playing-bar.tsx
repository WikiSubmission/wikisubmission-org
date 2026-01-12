'use client';

import React from 'react';
import { useQuranPlayer, useQuranProgress, Reciter } from '@/lib/quran-audio-context';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, Volume1, Volume, VolumeX, Loader2, User
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import Image from 'next/image';
import { formatTime } from '@/lib/music-utils';

const RECITER_NAMES: Record<Reciter, string> = {
    mishary: 'Mishary Rashid Alafasy',
    basit: 'Abdul Basit',
    minshawi: 'Mohamed Siddiq El-Minshawi'
};

export function QuranPlayer() {
    const {
        currentVerse, isPlaying, togglePlayPause, nextVerse, prevVerse,
        seek, reciter, setReciter, volume, setVolume, isBuffering
    } = useQuranPlayer();

    const { progress, duration, currentTime } = useQuranProgress();

    // Smooth Slider Logic
    const [localProgress, setLocalProgress] = React.useState(progress);
    const [isDragging, setIsDragging] = React.useState(false);
    const requestRef = React.useRef<number | undefined>(undefined);
    const previousTimeRef = React.useRef<number | undefined>(undefined);

    // Sync local progress with context progress when it changes
    // This avoids the 'fighting' between RAF and context updates
    React.useEffect(() => {
        if (!isDragging) {
            setLocalProgress(progress);
        }
    }, [progress, isDragging]);

    React.useEffect(() => {
        if (!isPlaying || isDragging) {
            return;
        }

        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined && duration > 0) {
                const deltaTime = (time - previousTimeRef.current) / 1000;
                setLocalProgress((prev) => {
                    const next = prev + (deltaTime / duration);
                    return next > 1 ? 1 : next;
                });
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            previousTimeRef.current = undefined;
        };
    }, [isPlaying, isDragging, duration]);

    const handleSeek = (val: number) => {
        setLocalProgress(val);
        seek(val);
    };

    if (!currentVerse) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none mb-4">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                <div className="bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden md:h-20">

                    {/* Progress Bar (Global for Mobile, inside Flex for Desktop) */}
                    <div className="md:hidden w-full px-0 pt-0 bg-background/50">
                        <Slider
                            value={[(localProgress || 0) * 100]}
                            min={0}
                            max={100}
                            step={0.01}
                            onValueChange={(val) => setLocalProgress(val[0] / 100)}
                            onValueCommit={(val) => handleSeek(val[0] / 100)}
                            onPointerDown={() => setIsDragging(true)}
                            onPointerUp={() => setIsDragging(false)}
                            className="w-full h-full pt-4 px-4"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row h-full items-center">

                        {/* Info Section */}
                        <div className="flex items-center gap-3 p-3 pl-4 flex-grow w-full md:w-auto min-w-0 justify-between md:justify-start">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shrink-0 border border-border/10">
                                    <Image
                                        src="/graphics/book.png"
                                        alt="Quran"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex flex-col">
                                    <div className="font-semibold text-sm md:text-base truncate leading-tight">
                                        {currentVerse.verse_id}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                                        {RECITER_NAMES[reciter]}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Controls (Right aligned on mobile row) */}
                            <div className="flex md:hidden items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={prevVerse}>
                                    <SkipBack className="w-5 h-5" fill="currentColor" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-500/20"
                                    onClick={togglePlayPause}
                                >
                                    {isBuffering ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />
                                    )}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={nextVerse}>
                                    <SkipForward className="w-5 h-5" fill="currentColor" />
                                </Button>

                                {/* Mobile Reciter Dialog */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                                            <User className="w-5 h-5" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[90%] max-w-[340px] rounded-2xl p-6">
                                        <DialogHeader className="mb-4">
                                            <DialogTitle className="text-left">Select Reciter</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-2">
                                            {(Object.keys(RECITER_NAMES) as Reciter[]).map((r) => (
                                                <Button
                                                    key={r}
                                                    variant={reciter === r ? "default" : "outline"}
                                                    className={`justify-start h-12 px-4 rounded-xl text-sm transition-all ${reciter === r ? 'bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20' : ''
                                                        }`}
                                                    onClick={() => setReciter(r)}
                                                >
                                                    <User className={`w-4 h-4 mr-3 ${reciter === r ? 'text-white' : 'text-violet-600'}`} />
                                                    {RECITER_NAMES[r]}
                                                </Button>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Mobile Volume Dialog */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                                            {volume === 0 ? <VolumeX className="w-5 h-5" /> :
                                                volume < 0.33 ? <Volume className="w-5 h-5" /> :
                                                    volume < 0.66 ? <Volume1 className="w-5 h-5" /> :
                                                        <Volume2 className="w-5 h-5" />}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[85%] max-w-[320px] rounded-2xl p-6">
                                        <DialogHeader className="mb-4">
                                            <DialogTitle className="text-left">Volume</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <VolumeX className="w-5 h-5 text-muted-foreground shrink-0" />
                                            <Slider
                                                value={[volume * 100]}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onValueChange={(val) => setVolume(val[0] / 100)}
                                                className="flex-grow"
                                            />
                                            <Volume2 className="w-5 h-5 text-muted-foreground shrink-0" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Desktop Controls & Progress */}
                        <div className="hidden md:flex flex-col items-center justify-center flex-grow px-2">
                            {/* Buttons */}
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevVerse}>
                                    <SkipBack className="w-5 h-5" fill="currentColor" />
                                </Button>

                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-500/20"
                                    onClick={togglePlayPause}
                                >
                                    {isBuffering ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />
                                    )}
                                </Button>

                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextVerse}>
                                    <SkipForward className="w-5 h-5" fill="currentColor" />
                                </Button>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full flex items-center gap-2 mt-1">
                                <span className="text-[10px] tabular-nums text-muted-foreground w-10 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <Slider
                                    value={[(localProgress || 0) * 100]}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    onValueChange={(val) => setLocalProgress(val[0] / 100)}
                                    onValueCommit={(val) => handleSeek(val[0] / 100)}
                                    onPointerDown={() => setIsDragging(true)}
                                    onPointerUp={() => setIsDragging(false)}
                                    className="flex-grow w-64"
                                />
                                <span className="text-[10px] tabular-nums text-muted-foreground w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        {/* Desktop Reciter & Volume (Separate) */}
                        <div className="hidden md:flex items-center justify-end gap-1 pr-6 min-w-[220px]">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2 h-9 text-xs text-muted-foreground hover:text-foreground">
                                        <User className="w-4 h-4" />
                                        <span className="max-w-[100px] truncate">
                                            {reciter.charAt(0).toUpperCase() + reciter.slice(1)}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="top" className="w-56 p-2 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Reciters
                                    </div>
                                    {(Object.keys(RECITER_NAMES) as Reciter[]).map((r) => (
                                        <DropdownMenuItem
                                            key={r}
                                            onClick={() => setReciter(r)}
                                            className={`rounded-lg mb-1 last:mb-0 cursor-pointer ${reciter === r ? 'bg-violet-600 text-white focus:bg-violet-700 focus:text-white' : 'focus:bg-violet-600/10'}`}
                                        >
                                            <User className={`w-3.5 h-3.5 mr-2 ${reciter === r ? 'text-white' : 'text-violet-600'}`} />
                                            {RECITER_NAMES[r]}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                        {volume === 0 ? <VolumeX className="w-5 h-5" /> :
                                            volume < 0.33 ? <Volume className="w-5 h-5" /> :
                                                volume < 0.66 ? <Volume1 className="w-5 h-5" /> :
                                                    <Volume2 className="w-5 h-5" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="center" className="w-12 py-4 flex flex-col items-center gap-3 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                                    <div className="h-24">
                                        <Slider
                                            value={[volume * 100]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            orientation="vertical"
                                            onValueChange={(val) => setVolume(val[0] / 100)}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className="h-full !min-h-0"
                                        />
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
