'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface QuranVerse {
    verse_id: string;
    ws_quran_text: Record<string, string>;
}

export type Reciter = 'mishary' | 'basit' | 'minshawi';

interface QuranPlayerContextType {
    currentVerse: QuranVerse | null;
    isPlaying: boolean;
    queue: QuranVerse[];
    reciter: Reciter;
    isBuffering: boolean;
    volume: number;

    playFromVerse: (verse: QuranVerse, fullQueue: QuranVerse[]) => void;
    togglePlayPause: () => void;
    nextVerse: () => void;
    prevVerse: () => void;
    seek: (progress: number) => void;
    setReciter: (reciter: Reciter) => void;
    setVolume: (volume: number) => void;
}

interface QuranProgressContextType {
    progress: number;
    duration: number;
    currentTime: number;
}

const QuranPlayerContext = createContext<QuranPlayerContextType | undefined>(undefined);
const QuranProgressContext = createContext<QuranProgressContextType | undefined>(undefined);

const RECITER_METADATA_NAMES: Record<Reciter, string> = {
    mishary: 'Mishary Rashid Alafasy',
    basit: 'Abdul Basit',
    minshawi: 'Mohamed Siddiq El-Minshawi'
};

export function QuranPlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null);
    const [queue, setQueue] = useState<QuranVerse[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [reciter, setReciter] = useState<Reciter>('mishary'); // Default reciter
    const [volume, setVolume] = useState(1);

    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const nextAudioRef = useRef<HTMLAudioElement | null>(null);
    const lastUrlRef = useRef<string | null>(null);

    // Next.js Navigation
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Use Refs for callbacks to avoid stale closures in event listeners
    const nextVerseRef = useRef<() => void>(() => { });

    // Initialize Audio
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setProgress(audio.currentTime / audio.duration);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);
        const handleEnded = () => {
            nextVerseRef.current();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audioRef.current = null;
        };
    }, []);

    // Update Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Construct URL helper
    const getAudioUrl = (verse: QuranVerse, reciterName: string) => {
        const [chapter, verseNum] = verse.verse_id.split(':');
        return `https://cdn.wikisubmission.org/media/quran-recitations/arabic-${reciterName}/${chapter}-${verseNum}.mp3`;
    };

    // Handle Current Verse Change
    useEffect(() => {
        if (!audioRef.current || !currentVerse) return;

        const url = getAudioUrl(currentVerse, reciter);

        if (url !== lastUrlRef.current) {
            audioRef.current.src = url;
            lastUrlRef.current = url;

            if (isPlaying) {
                audioRef.current.play().catch(e => {
                    console.error("Playback failed", e);
                    setIsPlaying(false);
                });
            }
        }
        // Update URL param for scrolling
        const verseNum = currentVerse.verse_id.split(':')[1];
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (params.get('verse') !== verseNum) {
            params.set('verse', verseNum);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }

        // Preload next verse
        const currentIdx = queue.findIndex(v => v.verse_id === currentVerse.verse_id);
        if (currentIdx !== -1 && currentIdx < queue.length - 1) {
            const nextVerseObj = queue[currentIdx + 1];
            const nextUrl = getAudioUrl(nextVerseObj, reciter);

            // Avoid duplicate loading if already loaded
            if (nextAudioRef.current?.src !== nextUrl) {
                const nextAudio = new Audio();
                nextAudio.src = nextUrl;
                nextAudio.preload = 'auto';
                nextAudioRef.current = nextAudio;
            }
        }

        // Update Media Session Metadata
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Verse ${currentVerse.verse_id}`,
                artist: RECITER_METADATA_NAMES[reciter],
                album: 'Quran Recitation',
                artwork: [
                    { src: '/graphics/book.png', sizes: '512x512', type: 'image/png' }
                ]
            });
        }
    }, [currentVerse, reciter]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle Play/Pause
    useEffect(() => {
        if (!audioRef.current || !currentVerse) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => {
                console.error("Playback failed", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentVerse]);

    const playFromVerse = useCallback((verse: QuranVerse, fullQueue: QuranVerse[]) => {
        // Find index of verse in fullQueue
        const idx = fullQueue.findIndex(v => v.verse_id === verse.verse_id);
        if (idx !== -1) {
            // Slice queue from this verse onwards
            const newQueue = fullQueue.slice(idx);
            setQueue(newQueue);
            setCurrentVerse(verse);
            setIsPlaying(true);
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        if (!currentVerse) return;
        setIsPlaying(prev => !prev);
    }, [currentVerse]);

    const nextVerse = useCallback(() => {
        if (!currentVerse || queue.length === 0) return;

        const currentIdx = queue.findIndex(v => v.verse_id === currentVerse.verse_id);
        if (currentIdx !== -1 && currentIdx < queue.length - 1) {
            setCurrentVerse(queue[currentIdx + 1]);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
            setCurrentVerse(null);
            setProgress(0);
        }
    }, [currentVerse, queue]);

    useEffect(() => {
        nextVerseRef.current = nextVerse;
    }, [nextVerse]);

    const prevVerse = useCallback(() => {
        if (!currentVerse || queue.length === 0) return;

        // If played more than 3 seconds, restart current
        if (currentTime > 3 && audioRef.current) {
            audioRef.current.currentTime = 0;
            return;
        }

        const currentIdx = queue.findIndex(v => v.verse_id === currentVerse.verse_id);

        if (currentIdx > 0) {
            setCurrentVerse(queue[currentIdx - 1]);
            setIsPlaying(true);
        } else {
            // Restart current
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
    }, [currentVerse, queue, currentTime]);

    const seek = useCallback((newProgress: number) => {
        if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = newProgress * audioRef.current.duration;
            setProgress(newProgress);
        }
    }, []);

    // Setup Media Session Action Handlers
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            prevVerse();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextVerse();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime && audioRef.current?.duration) {
                seek(details.seekTime / audioRef.current.duration);
            }
        });

        return () => {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
            navigator.mediaSession.setActionHandler('seekto', null);
        };
    }, [togglePlayPause, prevVerse, nextVerse, seek]);

    return (
        <QuranPlayerContext.Provider value={{
            currentVerse, isPlaying, queue, reciter,
            isBuffering, volume,
            playFromVerse, togglePlayPause, nextVerse, prevVerse, seek, setReciter, setVolume
        }}>
            <QuranProgressContext.Provider value={{ progress, duration, currentTime }}>
                {children}
            </QuranProgressContext.Provider>
        </QuranPlayerContext.Provider>
    );
}

export function useQuranPlayer() {
    const context = useContext(QuranPlayerContext);
    if (!context) {
        throw new Error('useQuranPlayer must be used within a QuranPlayerProvider');
    }
    return context;
}

export function useQuranProgress() {
    const context = useContext(QuranProgressContext);
    if (!context) {
        throw new Error('useQuranProgress must be used within a QuranPlayerProvider');
    }
    return context;
}
