'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import useLocalStorage from '@/hooks/use-local-storage'

export interface QuranVerse {
  verse_id: string
  ws_quran_text: Record<string, string>
}

export type Reciter = 'mishary' | 'basit' | 'minshawi'

// ─── State context — re-renders when player state changes ─────────────────────
// Includes callbacks for backward compat with NowPlayingBar (they're stable refs
// so listing them here doesn't cause extra re-renders beyond state changes).
interface QuranPlayerContextType {
  currentVerse: QuranVerse | null
  isPlaying: boolean
  queue: QuranVerse[]
  reciter: Reciter
  isBuffering: boolean
  volume: number
  playFromVerse: (verse: QuranVerse, fullQueue?: QuranVerse[]) => void
  setChapterQueue: (verses: QuranVerse[]) => void
  togglePlayPause: () => void
  nextVerse: () => void
  prevVerse: () => void
  seek: (progress: number) => void
  setReciter: (reciter: Reciter) => void
  setVolume: (volume: number) => void
}

// ─── Callbacks-only context — stable forever, NEVER causes consumer re-renders ─
// All functions read live state from refs instead of closing over React state.
// VerseCard subscribes to this context so it never re-renders from player state.
interface QuranPlayerCallbacksContextType {
  playFromVerse: (verse: QuranVerse, fullQueue?: QuranVerse[]) => void
  setChapterQueue: (verses: QuranVerse[]) => void
  togglePlayPause: () => void
  nextVerse: () => void
  prevVerse: () => void
  seek: (progress: number) => void
  setReciter: (reciter: Reciter) => void
  setVolume: (volume: number) => void
}

interface QuranProgressContextType {
  progress: number
  duration: number
  currentTime: number
}

const QuranPlayerContext = createContext<QuranPlayerContextType | undefined>(undefined)
const QuranPlayerCallbacksContext = createContext<QuranPlayerCallbacksContextType | undefined>(undefined)
const QuranProgressContext = createContext<QuranProgressContextType | undefined>(undefined)

const RECITER_METADATA_NAMES: Record<Reciter, string> = {
  mishary: 'Mishary Rashid Alafasy',
  basit: 'Abdul Basit',
  minshawi: 'Mohamed Siddiq El-Minshawi',
}

export function QuranPlayerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentVerse, setCurrentVerse] = useState<QuranVerse | null>(null)
  const [queue, setQueue] = useState<QuranVerse[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [reciter, setReciter] = useLocalStorage<Reciter>('reciter', 'mishary')
  const [volume, setVolume] = useState(1)

  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastUrlRef = useRef<string | null>(null)

  // ─── Refs synced each render so stable callbacks can read current state ────────
  // This pattern avoids adding state to useCallback deps (which would destabilize
  // the functions and force re-renders in every VerseCard subscriber).
  const currentVerseRef = useRef(currentVerse)
  const queueRef = useRef(queue)
  const currentTimeRef = useRef(currentTime)
  currentVerseRef.current = currentVerse
  queueRef.current = queue
  currentTimeRef.current = currentTime

  // Used to call the latest nextVerse from the audio 'ended' event handler,
  // which is registered once in a [] effect.
  const nextVerseRef = useRef<() => void>(() => {})

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime)
        setProgress(audio.currentTime / audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleCanPlay = () => setIsBuffering(false)
    const handleEnded = () => {
      nextVerseRef.current()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [])

  // Update Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Construct URL helper
  const getAudioUrl = (verse: QuranVerse, reciterName: string) => {
    const [chapter, verseNum] = verse.verse_id.split(':')
    return `https://cdn.wikisubmission.org/media/quran-recitations/arabic-${reciterName}/${chapter}-${verseNum}.mp3`
  }

  // Handle Current Verse Change
  useEffect(() => {
    if (!audioRef.current || !currentVerse) return

    const url = getAudioUrl(currentVerse, reciter)

    if (url !== lastUrlRef.current) {
      audioRef.current.src = url
      lastUrlRef.current = url
      // Reset progress state immediately so the bar doesn't linger at old position
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
      // Do NOT call play() here — the [isPlaying, currentVerse, reciter] effect
      // below is the single place where play/pause is dispatched.
      // Calling play() in both effects causes the first promise to be aborted by
      // the second (Chrome throws AbortError → catch sets isPlaying=false → stops).
    }
    // Preload next verse
    const currentIdx = queue.findIndex(
      (v) => v.verse_id === currentVerse.verse_id
    )
    if (currentIdx !== -1 && currentIdx < queue.length - 1) {
      const nextVerseObj = queue[currentIdx + 1]
      const nextUrl = getAudioUrl(nextVerseObj, reciter)

      if (nextAudioRef.current?.src !== nextUrl) {
        const nextAudio = new Audio()
        nextAudio.src = nextUrl
        nextAudio.preload = 'auto'
        nextAudioRef.current = nextAudio
      }
    }

    // Update Media Session Metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Verse ${currentVerse.verse_id}`,
        artist: RECITER_METADATA_NAMES[reciter],
        album: 'Quran Recitation',
        artwork: [
          { src: '/graphics/book.png', sizes: '512x512', type: 'image/png' },
        ],
      })
    }
  }, [currentVerse, reciter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current || !currentVerse) return

    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.error('Playback failed', e)
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentVerse, reciter])

  // ─── Stable callbacks — deps intentionally [] (read live state from refs) ─────

  const setChapterQueue = useCallback((verses: QuranVerse[]) => {
    setQueue(verses)
  }, [])

  const playFromVerse = useCallback(
    (verse: QuranVerse, fullQueue?: QuranVerse[]) => {
      const q = fullQueue && fullQueue.length > 0 ? fullQueue : queueRef.current
      const idx = q.findIndex((v) => v.verse_id === verse.verse_id)
      if (idx !== -1) {
        // Keep the full queue — slicing removed earlier verses so prevVerse
        // could never navigate backward past the start of playback.
        setQueue(q)
        setCurrentVerse(verse)
        setIsPlaying(true)
      }
    },
    [] // stable — reads queue from queueRef
  )

  const togglePlayPause = useCallback(() => {
    if (!currentVerseRef.current) return
    setIsPlaying((prev) => !prev)
  }, []) // stable — reads currentVerse from currentVerseRef

  const nextVerse = useCallback(() => {
    const cv = currentVerseRef.current
    const q = queueRef.current
    if (!cv || q.length === 0) return
    const currentIdx = q.findIndex((v) => v.verse_id === cv.verse_id)
    if (currentIdx !== -1 && currentIdx < q.length - 1) {
      setCurrentVerse(q[currentIdx + 1])
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
      setCurrentVerse(null)
      setProgress(0)
    }
  }, []) // stable — reads state from refs

  const prevVerse = useCallback(() => {
    const cv = currentVerseRef.current
    const q = queueRef.current
    const ct = currentTimeRef.current
    if (!cv || q.length === 0) return
    if (ct > 3 && audioRef.current) {
      audioRef.current.currentTime = 0
      return
    }
    const currentIdx = q.findIndex((v) => v.verse_id === cv.verse_id)
    if (currentIdx > 0) {
      setCurrentVerse(q[currentIdx - 1])
      setIsPlaying(true)
    } else {
      if (audioRef.current) audioRef.current.currentTime = 0
    }
  }, []) // stable — reads state from refs

  const seek = useCallback((newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration
      setProgress(newProgress)
    }
  }, [])

  useEffect(() => {
    nextVerseRef.current = nextVerse
  }, [nextVerse])

  // Setup Media Session Action Handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', () => togglePlayPause())
    navigator.mediaSession.setActionHandler('pause', () => togglePlayPause())
    navigator.mediaSession.setActionHandler('previoustrack', () => prevVerse())
    navigator.mediaSession.setActionHandler('nexttrack', () => nextVerse())
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && audioRef.current?.duration) {
        seek(details.seekTime / audioRef.current.duration)
      }
    })

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekto', null)
    }
  }, [togglePlayPause, prevVerse, nextVerse, seek])

  // ─── Context values ────────────────────────────────────────────────────────────

  // Callbacks context — all functions are stable ([] deps + ref-based reads).
  // Created once; never causes re-renders in subscribers (e.g. VerseCard).
  const callbacksContextValue = useMemo(
    () => ({ playFromVerse, setChapterQueue, togglePlayPause, nextVerse, prevVerse, seek, setReciter, setVolume }),
    [playFromVerse, setChapterQueue, togglePlayPause, nextVerse, prevVerse, seek, setReciter, setVolume]
  )

  // State + callbacks context — re-renders only when player STATE changes.
  // Callbacks are stable refs so they don't add invalidation pressure.
  // NowPlayingBar and ChapterReader subscribe here.
  const playerContextValue = useMemo(
    () => ({
      currentVerse, isPlaying, queue, reciter, isBuffering, volume,
      playFromVerse, setChapterQueue, togglePlayPause, nextVerse, prevVerse, seek, setReciter, setVolume,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentVerse, isPlaying, queue, reciter, isBuffering, volume]
  )

  return (
    <QuranPlayerContext.Provider value={playerContextValue}>
      <QuranPlayerCallbacksContext.Provider value={callbacksContextValue}>
        <QuranProgressContext.Provider value={{ progress, duration, currentTime }}>
          {children}
        </QuranProgressContext.Provider>
      </QuranPlayerCallbacksContext.Provider>
    </QuranPlayerContext.Provider>
  )
}

export function useQuranPlayer() {
  const context = useContext(QuranPlayerContext)
  if (!context) {
    throw new Error('useQuranPlayer must be used within a QuranPlayerProvider')
  }
  return context
}

/** Subscribe to player callbacks only — stable references, never triggers re-renders. */
export function useQuranPlayerCallbacks() {
  const context = useContext(QuranPlayerCallbacksContext)
  if (!context) {
    throw new Error('useQuranPlayerCallbacks must be used within a QuranPlayerProvider')
  }
  return context
}

export function useQuranProgress() {
  const context = useContext(QuranProgressContext)
  if (!context) {
    throw new Error(
      'useQuranProgress must be used within a QuranPlayerProvider'
    )
  }
  return context
}
