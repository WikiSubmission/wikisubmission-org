'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Play, Pause, Volume2, VolumeX, RotateCcw, Video } from 'lucide-react'
import { F } from '../../_sections/shared/server'

const VideoModal = dynamic(
  () => import('../../_sections/shared/video-modal').then((m) => ({ default: m.VideoModal })),
  { ssr: false },
)

type WordData = {
  text: string
  start: number
  end: number
  spaceAfter?: boolean
}

type VerseData = {
  words: WordData[]
  meaning: string
}

const fatihaData: VerseData[] = [
  {
    meaning: 'In the name of God, Most Gracious, Most Merciful.',
    words: [
      { text: 'Bismillaahir', start: 0.64, end: 1.36, spaceAfter: true },
      { text: 'raḥmaani-r', start: 1.36, end: 2.08, spaceAfter: true },
      { text: 'raḥeem', start: 2.08, end: 2.96, spaceAfter: false },
    ],
  },
  {
    meaning: 'Praise be to God, Lord of the universe.',
    words: [
      { text: 'Alḥamdu', start: 3.28, end: 3.85, spaceAfter: true },
      { text: 'lillaahi-r', start: 3.92, end: 4.51, spaceAfter: true },
      { text: 'rabbi-l', start: 4.56, end: 4.87, spaceAfter: true },
      { text: 'aalameen', start: 4.9, end: 6.08, spaceAfter: false },
    ],
  },
  {
    meaning: 'Most Gracious, Most Merciful.',
    words: [
      { text: 'Ar-raḥmaanir', start: 6.48, end: 7.36, spaceAfter: true },
      { text: 'raḥeem', start: 7.36, end: 7.96, spaceAfter: false },
    ],
  },
  {
    meaning: 'Master of the Day of Judgment.',
    words: [
      { text: 'Maaliki', start: 8.72, end: 9.36, spaceAfter: true },
      { text: 'yawmi-d', start: 9.36, end: 9.93, spaceAfter: true },
      { text: 'deen', start: 9.93, end: 10.8, spaceAfter: false },
    ],
  },
  {
    meaning: 'Only You we worship; only You we ask for help.',
    words: [
      { text: 'Iyyaaka', start: 10.96, end: 11.76, spaceAfter: true },
      { text: 'na\'budu', start: 11.76, end: 12.33, spaceAfter: true },
      { text: 'wa', start: 12.34, end: 12.43, spaceAfter: true },
      { text: 'iyyaaka', start: 12.44, end: 13.12, spaceAfter: true },
      { text: 'nasta\'een', start: 13.12, end: 14.24, spaceAfter: false },
    ],
  },
  {
    meaning: 'Guide us in the straight path.',
    words: [
      { text: 'Ihdina-ṣ', start: 14.50, end: 15.30, spaceAfter: true },
      { text: 'ṣiraaṭa-l', start: 15.30, end: 15.95, spaceAfter: true },
      { text: 'mustaqeem', start: 15.96, end: 17.30, spaceAfter: false },
    ],
  },
  {
    meaning: 'The path of those whom You blessed, not of those who incur wrath, nor the strayers.',
    words: [
      { text: 'ṣiraaṭa-l', start: 17.30, end: 18.10, spaceAfter: true },
      { text: 'ladheena', start: 18.10, end: 18.66, spaceAfter: true },
      { text: 'an\'amta', start: 18.66, end: 19.40, spaceAfter: true },
      { text: 'alayhim', start: 19.40, end: 20.34, spaceAfter: true },
      { text: 'ghayri-l', start: 20.58, end: 21.14, spaceAfter: true },
      { text: 'maghdoobi', start: 21.14, end: 21.85, spaceAfter: true },
      { text: 'alayhim', start: 21.85, end: 22.58, spaceAfter: true },
      { text: 'wa-lad-', start: 22.58, end: 22.98, spaceAfter: false },
      { text: 'daalleen', start: 22.98, end: 24.42, spaceAfter: false },
    ],
  },
]

function formatWord(word: string) {
  const parts = word.split(/(aa|ee|uu)/i)
  return parts.map((part, i) => {
    if (/^(aa|ee|uu)$/i.test(part)) {
      return (
        <span key={i} className="underline decoration-1 underline-offset-[3px] decoration-[var(--ed-accent)]/70">
          {part}
        </span>
      )
    }
    return part
  })
}

export function FatihaAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncTime = () => {
      const time = audio.currentTime
      setCurrentTime(time)

      if (stopTimeRef.current !== null && time >= stopTimeRef.current) {
        audio.pause()
        stopTimeRef.current = null
      }
    }

    const updateDuration = () => setDuration(audio.duration)
    
    const onPlay = () => {
      setIsPlaying(true)
      syncTime()
    }

    const onPause = () => {
      setIsPlaying(false)
      syncTime()
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      stopTimeRef.current = null
    }

    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('seeked', syncTime)
    audio.addEventListener('timeupdate', syncTime)

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('seeked', syncTime)
      audio.removeEventListener('timeupdate', syncTime)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      stopTimeRef.current = null
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const playWord = (start: number, end: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = start
    setCurrentTime(start)
    stopTimeRef.current = end
    audioRef.current.play()
    setIsPlaying(true)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const restart = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    setCurrentTime(0)
    stopTimeRef.current = null
    if (!isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
      stopTimeRef.current = null
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  let activeVerseIndex = 0
  let found = false
  for (let i = 0; i < fatihaData.length; i++) {
    const verse = fatihaData[i]
    if (currentTime >= verse.words[0].start - 0.5 && currentTime <= verse.words[verse.words.length - 1].end + 0.2) {
      activeVerseIndex = i
      found = true
      break
    }
  }
  
  if (!found) {
    for (let i = fatihaData.length - 1; i >= 0; i--) {
      if (currentTime >= fatihaData[i].words[0].start) {
        activeVerseIndex = i
        break
      }
    }
  }

  const activeVerse = fatihaData[activeVerseIndex]

  return (
    <>
    <div className="border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-6 md:p-8 lg:p-10 shadow-sm w-full">
      <audio
        ref={audioRef}
        src="/audio/RashadFatiha.mp3"
        preload="metadata"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-8 lg:gap-12">
        {/* Left Column: Interactive Audio & Teleprompter */}
        <div className="flex flex-col min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
              How to Pronounce Al-Fatiha (The Key)
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--ed-accent)] text-[var(--ed-bg)] hover:opacity-90 transition-opacity shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
              </button>
              
              <button
                onClick={restart}
                className="flex size-11 items-center justify-center rounded-full border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-fg)] transition-colors"
                aria-label="Restart"
              >
                <RotateCcw size={16} />
              </button>
              
              <button
                onClick={toggleMute}
                className="flex size-11 items-center justify-center rounded-full border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:border-[var(--ed-fg)] transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            <div className="flex-1 flex items-center gap-3 w-full">
              <span className="text-[10px] font-mono text-[var(--ed-fg-muted)] w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-[var(--ed-rule)] appearance-none cursor-pointer focus:outline-none accent-[var(--ed-accent)]"
              />
              <span className="text-[10px] font-mono text-[var(--ed-fg-muted)] w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Teleprompter Box */}
          <div className="flex flex-col border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 px-4 py-8 relative flex-1 min-h-[220px] items-center justify-center">
            {/* Navigation Pills */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-10">
              {fatihaData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const verse = fatihaData[i]
                    playWord(verse.words[0].start, verse.words[verse.words.length - 1].end)
                  }}
                  className={`size-10 md:size-11 rounded flex items-center justify-center text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    i === activeVerseIndex
                      ? 'bg-[var(--ed-accent)] text-[var(--ed-bg)] shadow-md scale-110'
                      : 'bg-[var(--ed-bg)] border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:border-[var(--ed-accent)]/50 hover:text-[var(--ed-fg)] hover:scale-105'
                  }`}
                  aria-label={`Play verse ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="space-y-4 flex flex-col items-center text-center mt-5 w-full">
              <p className="text-xl md:text-2xl leading-relaxed max-w-lg" style={{ fontFamily: F.serif }}>
                {activeVerse.words.map((w, i) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end
                  return (
                    <span key={i}>
                      <span
                        onClick={() => playWord(w.start, w.end)}
                        className={`transition-colors duration-150 cursor-pointer px-1 py-0.5 rounded ${
                          isActive
                            ? 'text-[var(--ed-accent)] font-bold bg-[var(--ed-accent)]/10'
                            : 'text-[var(--ed-fg)] hover:text-[var(--ed-accent)] hover:bg-[var(--ed-accent)]/10'
                        }`}
                      >
                        {formatWord(w.text)}
                      </span>
                      {w.spaceAfter && ' '}
                    </span>
                  )
                })}
              </p>
              
              <p className="text-sm md:text-base leading-relaxed text-[var(--ed-fg-muted)] italic max-w-sm" style={{ fontFamily: F.serif }}>
                {activeVerse.meaning}
              </p>
            </div>
            
            <div className="absolute bottom-3 right-3">
              <button
                onClick={() => playWord(activeVerse.words[0].start, activeVerse.words[activeVerse.words.length - 1].end)}
                className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-full border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] hover:border-[var(--ed-accent)]/50 transition-all text-[8px] uppercase tracking-[0.2em] font-bold bg-[var(--ed-surface)]/30"
                style={{ fontFamily: F.glacial }}
                aria-label={`Play Verse ${activeVerseIndex + 1}`}
              >
                <Play size={8} className="fill-current" />
                Play Verse
              </button>
            </div>
          </div>

          {/* Pronunciation Tips */}
          <div className="mt-6 pt-6 border-t border-[var(--ed-rule)]">
            <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[var(--ed-fg-muted)] mb-4" style={{ fontFamily: F.glacial }}>
              Pronunciation Tips
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[12px] leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
              <div className="space-y-2">
                <p className="font-bold text-[var(--ed-fg)]">Sounds not in English:</p>
                <ul className="space-y-1.5 list-none pl-1">
                  <li><strong className="text-[var(--ed-accent)] font-mono text-[10px] bg-[var(--ed-surface)] px-1 rounded mr-1">ḥ</strong> — breathe out warmly from deep in your throat</li>
                  <li><strong className="text-[var(--ed-accent)] font-mono text-[10px] bg-[var(--ed-surface)] px-1 rounded mr-1">ṣ/ṭ</strong> — emphatic; flatten tongue against bottom of mouth</li>
                  <li><strong className="text-[var(--ed-accent)] font-mono text-[10px] bg-[var(--ed-surface)] px-1 rounded mr-1">gh</strong> — soft gargle at back of throat</li>
                  <li><strong className="text-[var(--ed-accent)] font-mono text-[10px] bg-[var(--ed-surface)] px-1 rounded mr-1">dh</strong> — heavy &quot;th&quot; (as in &quot;the&quot;)</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-[var(--ed-fg)]">Rhythm:</p>
                <p>Arabic is connected—don&apos;t pause between words. <span className="underline decoration-1 underline-offset-[3px] decoration-[var(--ed-accent)]/70">Long vowels</span> (underlined) are held twice as long.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Significance */}
        <div className="flex flex-col space-y-8 lg:border-l lg:border-[var(--ed-rule)] lg:pl-8 xl:pl-10">
          
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[var(--ed-fg-muted)]" style={{ fontFamily: F.glacial }}>
              Significance
            </h4>
            <div className="text-[13px] leading-relaxed text-[var(--ed-fg-muted)] space-y-4" style={{ fontFamily: F.serif }}>
              <p>
                We learn from 2:37 that we can establish contact with God by uttering the specific Arabic words given to us by God. Sura 1, The Key, is a mathematically composed combination of sounds that unlocks the door between us and God. The first sura in the Quran is mathematically composed in a manner that challenges and stumps the greatest mathematicians on earth.
              </p>
              <p>
                Now we appreciate the fact that when we recite Sura 1, &quot;The Key,&quot; during our Contact Prayers, something happens in the universe, and we establish contact with our Creator. The result is perfect happiness, now and forever.
              </p>
              <p>
                By contacting our Almighty Creator 5 times a day, we nourish and develop our souls in preparation for the Big Day when we meet God. Only those who nourish their soul will be able to withstand and enjoy the physical presence of Almighty God. All submitters, of all nationalities, recite the words of &quot;The Key&quot; which were written by God Himself, and given to us to establish contact with Him (2:37).
              </p>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-300 shadow-md rounded-sm"
            >
              <div className="size-5 rounded-full border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video size={10} fill="currentColor" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: F.glacial }}>
                Watch Recitation Video
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>

    {isModalOpen && (
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Al-Fatiha"
        subtitle="Full Recitation Tutorial"
        youtubeId="GA7M9qfpNUQ"
      />
    )}
    </>
  )
}
