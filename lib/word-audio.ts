'use client'

import { useSyncExternalStore } from 'react'

const PRIMARY_BASE = 'https://audio.qurancdn.com/wbw'
// Hard fallback: if neither `playing` nor `error` fires within this window,
// we assume the load is dead. Set generously — slow networks may take 10s+.
const LOAD_TIMEOUT_MS = 15000

function pad3(n: number): string {
  return n.toString().padStart(3, '0')
}

export function buildWordAudioUrl(
  chapter: number,
  verse: number,
  word1Based: number,
): string {
  return `${PRIMARY_BASE}/${pad3(chapter)}_${pad3(verse)}_${pad3(word1Based)}.mp3`
}

export function wordAudioId(
  chapter: number,
  verse: number,
  word1Based: number,
): string {
  return `${chapter}:${verse}:${word1Based}`
}

interface WordAudioState {
  playingId: string | null
  loadingId: string | null
}

let audioEl: HTMLAudioElement | null = null
// The id whose URL is currently loaded into audioEl. Tracked separately from
// `state.loadingId` so the `playing` event can recover even if the safety
// timeout already cleared loading state.
let currentSrcId: string | null = null
let state: WordAudioState = { playingId: null, loadingId: null }
let timeoutId: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<() => void>()
const preloadCache = new Set<string>()

function emit(): void {
  for (const listener of listeners) listener()
}

function setState(next: Partial<WordAudioState>): void {
  const merged: WordAudioState = { ...state, ...next }
  if (merged.playingId === state.playingId && merged.loadingId === state.loadingId) {
    return
  }
  state = merged
  emit()
}

function clearTimeoutSafe(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function reset(): void {
  clearTimeoutSafe()
  setState({ playingId: null, loadingId: null })
}

function getAudio(): HTMLAudioElement {
  if (audioEl) return audioEl
  const el = new Audio()
  el.preload = 'auto'

  el.addEventListener('playing', () => {
    if (currentSrcId) {
      setState({ playingId: currentSrcId, loadingId: null })
      clearTimeoutSafe()
    }
  })
  el.addEventListener('ended', () => {
    if (state.playingId === currentSrcId) reset()
  })
  el.addEventListener('error', reset)

  audioEl = el
  return el
}

function pauseVerseAudioIfPlaying(): void {
  if (typeof document === 'undefined') return
  const others = document.querySelectorAll('audio')
  others.forEach((node) => {
    if (node !== audioEl && !node.paused) node.pause()
  })
}

export function playWordAudio(
  chapter: number,
  verse: number,
  word1Based: number,
): void {
  if (typeof window === 'undefined') return
  const id = wordAudioId(chapter, verse, word1Based)

  if (state.playingId === id || state.loadingId === id) {
    stopWordAudio()
    return
  }

  pauseVerseAudioIfPlaying()

  const el = getAudio()
  currentSrcId = id
  setState({ playingId: null, loadingId: id })
  preloadCache.add(id)

  el.src = buildWordAudioUrl(chapter, verse, word1Based)
  el.currentTime = 0
  void el.play().catch(() => reset())

  clearTimeoutSafe()
  timeoutId = setTimeout(() => {
    if (state.loadingId === id && currentSrcId === id) reset()
  }, LOAD_TIMEOUT_MS)
}

export function stopWordAudio(): void {
  if (audioEl) {
    audioEl.pause()
    audioEl.currentTime = 0
  }
  reset()
}

/**
 * Warm the HTTP cache for a word's audio file so a subsequent click resolves
 * from cache. Safe to call repeatedly — deduped via an in-memory Set.
 *
 * Uses opaque cross-origin fetch (`mode: 'no-cors'`) since the qurancdn host
 * does not expose CORS headers. We can't read the response, but the browser
 * still caches it for the later `<audio>` request.
 */
export function preloadWordAudio(
  chapter: number,
  verse: number,
  word1Based: number,
): void {
  if (typeof window === 'undefined') return
  const id = wordAudioId(chapter, verse, word1Based)
  if (preloadCache.has(id)) return
  preloadCache.add(id)
  const url = buildWordAudioUrl(chapter, verse, word1Based)
  void fetch(url, { mode: 'no-cors', credentials: 'omit' }).catch(() => {
    preloadCache.delete(id)
  })
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): WordAudioState {
  return state
}

const SERVER_SNAPSHOT: WordAudioState = { playingId: null, loadingId: null }
function getServerSnapshot(): WordAudioState {
  return SERVER_SNAPSHOT
}

export interface UseWordAudio {
  playingId: string | null
  loadingId: string | null
  play: (chapter: number, verse: number, word1Based: number) => void
  preload: (chapter: number, verse: number, word1Based: number) => void
  stop: () => void
}

export function useWordAudio(): UseWordAudio {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    playingId: snapshot.playingId,
    loadingId: snapshot.loadingId,
    play: playWordAudio,
    preload: preloadWordAudio,
    stop: stopWordAudio,
  }
}
