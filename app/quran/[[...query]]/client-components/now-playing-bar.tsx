'use client'

import React from 'react'
import {
  useQuranPlayer,
  useQuranProgress,
  Reciter,
} from '@/lib/quran-audio-context'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  Volume,
  VolumeX,
  Loader2,
  User,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import Image from 'next/image'
import { formatTime } from '@/lib/music-utils'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'

const RECITER_NAMES: Record<Reciter, string> = {
  mishary: 'Mishary Rashid Alafasy',
  basit: 'Abdul Basit',
  minshawi: 'Mohamed Siddiq El-Minshawi',
}

export function QuranPlayer() {
  const {
    currentVerse,
    isPlaying,
    togglePlayPause,
    nextVerse,
    prevVerse,
    seek,
    reciter,
    setReciter,
    volume,
    setVolume,
    isBuffering,
  } = useQuranPlayer()

  const { progress, duration, currentTime } = useQuranProgress()

  // Smooth local progress for the slider (avoids fighting with RAF vs context updates)
  const [localProgress, setLocalProgress] = React.useState(progress)
  const [isDragging, setIsDragging] = React.useState(false)
  const requestRef = React.useRef<number | undefined>(undefined)
  const previousTimeRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    if (!isDragging) setLocalProgress(progress)
  }, [progress, isDragging])

  React.useEffect(() => {
    if (!isPlaying || isDragging) return

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined && duration > 0) {
        const deltaTime = (time - previousTimeRef.current) / 1000
        setLocalProgress((prev) => Math.min(prev + deltaTime / duration, 1))
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      previousTimeRef.current = undefined
    }
  }, [isPlaying, isDragging, duration])

  const handleSeek = (val: number) => {
    setLocalProgress(val)
    seek(val)
  }

  const { zoomLevel } = useQuranPreferences()

  if (!currentVerse) return null

  const VolumeIcon =
    volume === 0 ? VolumeX : volume < 0.33 ? Volume : volume < 0.66 ? Volume1 : Volume2

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-5 pointer-events-none">
      <div className={`${ZOOM_WIDTH_CLASS[zoomLevel ?? 'comfortable']} mx-auto pointer-events-auto`}>

        {/* ── Liquid glass shell ────────────────────────────────────────────────── */}
        {/* 1-px gradient "border" is created by a wrapper with p-px + gradient bg */}
        <div className="p-px rounded-2xl bg-linear-to-b from-white/30 dark:from-white/15 via-white/5 to-transparent shadow-[0_8px_32px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.3)]">

          <div className="relative bg-background/78 dark:bg-background/65 backdrop-blur-2xl rounded-2xl overflow-hidden md:h-20">

            {/* Top-edge shimmer line — key liquid glass detail */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 dark:via-white/20 to-transparent pointer-events-none" />

            {/* ── Mobile progress bar ──────────────────────────────────────────── */}
            <div className="md:hidden px-1 pt-0.5">
              <Slider
                value={[(localProgress || 0) * 100]}
                min={0}
                max={100}
                step={0.01}
                onValueChange={(val) => setLocalProgress(val[0] / 100)}
                onValueCommit={(val) => handleSeek(val[0] / 100)}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                className="h-3"
              />
            </div>

            <div className="flex flex-col md:flex-row h-full items-center">

              {/* ── Info + mobile controls row ───────────────────────────────── */}
              <div className="flex items-center gap-3 px-3 py-2.5 md:py-0 md:pl-5 w-full md:w-auto md:min-w-[180px] min-w-0 justify-between md:justify-start">
                {/* Thumbnail + verse info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/20 dark:ring-white/10 shadow-sm">
                    <Image src="/graphics/book.png" alt="Quran" fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate leading-tight">
                      {currentVerse.verse_id}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {RECITER_NAMES[reciter]}
                    </div>
                  </div>
                </div>

                {/* Mobile controls (right side of info row) */}
                <div className="flex md:hidden items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={prevVerse}
                  >
                    <SkipBack className="w-4 h-4" fill="currentColor" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 ring-2 ring-primary/20 transition-all active:scale-95"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={nextVerse}
                  >
                    <SkipForward className="w-4 h-4" fill="currentColor" />
                  </Button>

                  {/* Mobile — reciter select */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[90%] max-w-sm rounded-2xl p-6">
                      <DialogHeader className="mb-4">
                        <DialogTitle className="text-left">Select Reciter</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-2">
                        {(Object.keys(RECITER_NAMES) as Reciter[]).map((r) => (
                          <Button
                            key={r}
                            variant={reciter === r ? 'default' : 'outline'}
                            className="justify-start h-12 px-4 rounded-xl text-sm"
                            onClick={() => setReciter(r)}
                          >
                            <User className="w-4 h-4 mr-2 shrink-0" />
                            {RECITER_NAMES[r]}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Mobile — volume */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground"
                      >
                        <VolumeIcon className="w-4 h-4" />
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

              {/* ── Desktop controls + progress (centre) ────────────────────── */}
              <div className="hidden md:flex flex-col items-center justify-center flex-grow min-w-0 px-4 py-3">
                {/* Transport buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={prevVerse}
                  >
                    <SkipBack className="w-4 h-4" fill="currentColor" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 ring-2 ring-primary/20 transition-all active:scale-95"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={nextVerse}
                  >
                    <SkipForward className="w-4 h-4" fill="currentColor" />
                  </Button>
                </div>

                {/* Progress bar + time */}
                <div className="w-full flex items-center gap-2 mt-2">
                  <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right shrink-0">
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
                    className="flex-grow"
                  />
                  <span className="text-[10px] tabular-nums text-muted-foreground w-9 shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* ── Desktop settings (right) ─────────────────────────────────── */}
              <div className="hidden md:flex items-center gap-1 pr-5 shrink-0">
                {/* Reciter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground rounded-full px-3"
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="max-w-[80px] truncate capitalize">{reciter}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="w-52 p-1.5 bg-background/90 backdrop-blur-xl border-border/30 shadow-xl rounded-xl"
                  >
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Reciters
                    </p>
                    {(Object.keys(RECITER_NAMES) as Reciter[]).map((r) => (
                      <DropdownMenuItem
                        key={r}
                        onClick={() => setReciter(r)}
                        className={`rounded-lg mb-0.5 last:mb-0 cursor-pointer text-sm ${
                          reciter === r
                            ? 'bg-primary text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground'
                            : ''
                        }`}
                      >
                        {RECITER_NAMES[r]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Volume */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <VolumeIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="center"
                    className="w-12 py-4 flex flex-col items-center gap-3 bg-background/90 backdrop-blur-xl border-border/30 shadow-xl"
                  >
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
        {/* ─────────────────────────────────────────────────────────────────────── */}

      </div>
    </div>
  )
}
