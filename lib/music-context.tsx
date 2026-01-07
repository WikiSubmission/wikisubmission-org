
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedTrack, LoopMode, PlaybackContextType, DBTrackRow, DBArtist, DBCategory } from '@/types/music';
import { ws } from '@/lib/wikisubmission-sdk';
import useLocalStorage from '@/hooks/use-local-storage';

interface MusicContextType {
    currentTrack: UnifiedTrack | null;
    isPlaying: boolean;
    loopMode: LoopMode;
    playbackContext: PlaybackContextType;
    queue: UnifiedTrack[];
    favorites: string[]; // Track URLs
    progress: number; // 0 to 1
    duration: number; // seconds
    currentTime: number; // seconds
    volume: number; // 0 to 1
    isBuffering: boolean;

    playTrack: (track: UnifiedTrack, context?: PlaybackContextType, tracks?: UnifiedTrack[]) => void;
    togglePlayPause: () => void;
    skipNext: () => void;
    skipPrevious: () => void;
    seek: (progress: number) => void;
    setVolume: (volume: number) => void;
    setLoopMode: (mode: LoopMode) => void;
    toggleFavorite: (trackUrl: string) => void;
    allTracks: UnifiedTrack[];
    categories: DBCategory[];
    artists: DBArtist[];
    isLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

function formatTracks(data: DBTrackRow[]): UnifiedTrack[] {
    return data.map((row: DBTrackRow) => ({
        id: row.id,
        title: row.name,
        url: row.url,
        artist: row.artistObj as DBArtist,
        category: row.categoryObj as DBCategory,
        releaseDate: new Date(row.release_date || '2025-01-01'),
        featured: row.featured || false,
    }));
}

export function MusicProvider({
    children,
    initialTracks = [],
    initialCategories = [],
    initialArtists = []
}: {
    children: React.ReactNode;
    initialTracks?: DBTrackRow[];
    initialCategories?: DBCategory[];
    initialArtists?: DBArtist[];
}) {
    const [currentTrack, setCurrentTrack] = useState<UnifiedTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loopMode, setLoopMode] = useLocalStorage<LoopMode>('zikr_loop_mode', 'context');
    const [playbackContext, setPlaybackContext] = useState<PlaybackContextType>('allTracks');
    const [queue, setQueue] = useState<UnifiedTrack[]>([]);
    const [favorites, setFavorites] = useLocalStorage<string[]>('zikr_favorited_tracks', []);
    const [volume, setVolume] = useLocalStorage<number>('zikr_volume', 1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);

    // Initialize with props if available
    const [allTracks, setAllTracks] = useState<UnifiedTrack[]>(() => formatTracks(initialTracks));
    const [categories, setCategories] = useState<DBCategory[]>(initialCategories);
    const [artists, setArtists] = useState<DBArtist[]>(initialArtists);
    const [isLoading, setIsLoading] = useState(initialTracks.length === 0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial Fetch (only if no initial data)
    useEffect(() => {
        if (initialTracks.length > 0) {
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const { data: tracksData } = await ws.supabase
                    .from('ws_music_tracks')
                    .select('*, artistObj:ws_music_artists(*), categoryObj:ws_music_categories(*)')
                    .order('release_date', { ascending: false });

                const { data: catsData } = await ws.supabase
                    .from('ws_music_categories')
                    .select('*')
                    .order('display_priority', { ascending: false });

                const { data: artistsData } = await ws.supabase
                    .from('ws_music_artists')
                    .select('*')
                    .order('display_priority', { ascending: false });

                if (tracksData) {
                    const formattedTracks = formatTracks(tracksData);
                    setAllTracks(formattedTracks);
                }
                if (catsData) setCategories(catsData);
                if (artistsData) setArtists(artistsData);
            } catch (err) {
                console.error('Error fetching music data:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [initialTracks]);

    const handleSkipNext = useCallback(() => {
        if (queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % queue.length;

        if (loopMode === 'off' && nextIndex === 0) {
            setIsPlaying(false);
            return;
        }

        setCurrentTrack(queue[nextIndex]);
        setIsPlaying(true);
    }, [queue, currentTrack, loopMode]);

    const skipNext = useCallback(() => handleSkipNext(), [handleSkipNext]);

    const skipPrevious = useCallback(() => {
        if (queue.length === 0) return;
        if (currentTime > 3) {
            if (audioRef.current) audioRef.current.currentTime = 0;
            return;
        }
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        setCurrentTrack(queue[prevIndex]);
        setIsPlaying(true);
    }, [queue, currentTrack, currentTime]);

    // Audio Element Setup
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;

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
            if (loopMode === 'repeatOne') {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleSkipNext();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [loopMode, handleSkipNext]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (currentTrack) {
            const isNewSource = audioRef.current.src !== currentTrack.url;
            if (isNewSource) {
                audioRef.current.src = currentTrack.url;
                if (isPlaying) {
                    audioRef.current.play().catch(err => {
                        console.warn('Autoplay prevented or interrupted:', err);
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [currentTrack, isPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.warn('Playback failed:', err);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // System Media Session Support
    useEffect(() => {
        if (!('mediaSession' in navigator) || !currentTrack) return;

        const artworkUrl = currentTrack.artist.image_url || '/android-chrome-512x512.png';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist.name,
            album: currentTrack.category.name,
            artwork: [
                { src: artworkUrl, sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => skipPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => skipNext());

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [currentTrack, isPlaying, skipNext, skipPrevious]);

    const playTrack = (track: UnifiedTrack, context?: PlaybackContextType, customQueue?: UnifiedTrack[]) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying);
            return;
        }

        if (context) {
            setPlaybackContext(context);
            let newQueue: UnifiedTrack[] = [];
            if (customQueue) {
                newQueue = customQueue;
            } else {
                switch (context) {
                    case 'category': newQueue = allTracks.filter(t => t.category.id === track.category.id); break;
                    case 'favorites': newQueue = allTracks.filter(t => favorites.includes(t.url)); break;
                    case 'allTracks': default: newQueue = allTracks; break;
                }
            }
            setQueue(newQueue);
        }

        setCurrentTrack(track);
        setIsPlaying(true);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('track', track.id);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const togglePlayPause = () => setIsPlaying(!isPlaying);

    const seek = (newProgress: number) => {
        if (audioRef.current && audioRef.current.duration) {
            const newTime = newProgress * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(newProgress);
            setCurrentTime(newTime);
        }
    };

    const toggleFavorite = (trackUrl: string) => {
        setFavorites((prev: string[]) => {
            if (prev.includes(trackUrl)) return prev.filter((u: string) => u !== trackUrl);
            return [...prev, trackUrl];
        });
    };

    return (
        <MusicContext.Provider value={{
            currentTrack, isPlaying, loopMode, playbackContext, queue, favorites,
            progress, duration, currentTime, volume, isBuffering,
            playTrack, togglePlayPause, skipNext, skipPrevious, seek, setVolume, setLoopMode, toggleFavorite,
            allTracks, categories, artists, isLoading
        }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within a MusicProvider');
    return context;
}
