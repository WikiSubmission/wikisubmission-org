
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

export function MusicProvider({ children }: { children: React.ReactNode }) {
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

    const [allTracks, setAllTracks] = useState<UnifiedTrack[]>([]);
    const [categories, setCategories] = useState<DBCategory[]>([]);
    const [artists, setArtists] = useState<DBArtist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial Fetch
    useEffect(() => {
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
                    const formattedTracks: UnifiedTrack[] = tracksData.map((row: DBTrackRow) => ({
                        id: row.id,
                        title: row.name,
                        url: row.url,
                        artist: row.artistObj as DBArtist,
                        category: row.categoryObj as DBCategory,
                        releaseDate: new Date(row.release_date || '2025-01-01'),
                        featured: row.featured || false,
                    }));
                    setAllTracks(formattedTracks);

                    const params = new URLSearchParams(window.location.search);
                    const trackId = params.get('track');
                    if (trackId) {
                        const track = formattedTracks.find(t => t.id === trackId);
                        if (track) {
                            setCurrentTrack(track);
                            const categoryTracks = formattedTracks.filter(t => t.category.id === track.category.id);
                            setQueue(categoryTracks);
                            setPlaybackContext('category');
                        }
                    }
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
    }, []);

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

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
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
                if (isPlaying) audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrack, isPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(console.error);
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
        const url = new URL(window.location.href);
        url.searchParams.set('track', track.id);
        window.history.replaceState({}, '', url.toString());
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
            progress, duration, currentTime, volume,
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
