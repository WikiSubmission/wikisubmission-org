// Platform seam for OS media integration (lock screen / notification controls).
//
// Web (and SSR) use the default adapter below, a guarded wrapper around
// `navigator.mediaSession`. The Capacitor app registers a native adapter at
// startup (apps/mobile/lib/native-media-session.ts) because an Android WebView
// has no OS-visible media session of its own — without a native MediaSession +
// foreground service, background playback shows no notification controls.
//
// The registry replays the last-known handlers/metadata/playback state when an
// adapter registers, so the native adapter's async dynamic import can land
// after the player provider's mount effects without losing state.

export type MediaPlaybackState = 'none' | 'paused' | 'playing'

export type MediaAction =
  | 'play'
  | 'pause'
  | 'previoustrack'
  | 'nexttrack'
  | 'seekto'
  | 'stop'

export interface MediaMetadataInput {
  title: string
  artist: string
  album: string
  /** Site-relative artwork path; native adapters resolve it to an absolute URL. */
  artworkSrc: string
}

export interface MediaPositionState {
  duration: number
  position: number
  playbackRate?: number
}

export type MediaActionHandler = (details: { seekTime?: number | null }) => void

export interface MediaSessionAdapter {
  setMetadata(metadata: MediaMetadataInput): void
  setPlaybackState(state: MediaPlaybackState): void
  setPositionState(state: MediaPositionState | null): void
  setActionHandler(action: MediaAction, handler: MediaActionHandler | null): void
}

const hasWebMediaSession = (): boolean =>
  typeof navigator !== 'undefined' && 'mediaSession' in navigator

const webAdapter: MediaSessionAdapter = {
  setMetadata(metadata) {
    if (!hasWebMediaSession()) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      artwork: [{ src: metadata.artworkSrc, sizes: '512x512', type: 'image/png' }],
    })
  },
  setPlaybackState(state) {
    if (!hasWebMediaSession()) return
    navigator.mediaSession.playbackState = state
  },
  setPositionState(state) {
    if (!hasWebMediaSession()) return
    try {
      navigator.mediaSession.setPositionState(state ?? undefined)
    } catch {
      // Invalid position state (e.g. NaN duration mid-load) — skip this tick.
    }
  },
  setActionHandler(action, handler) {
    if (!hasWebMediaSession()) return
    try {
      navigator.mediaSession.setActionHandler(
        action,
        handler && ((details) => handler({ seekTime: details.seekTime }))
      )
    } catch {
      // Action not supported by this browser — controls degrade gracefully.
    }
  },
}

// Last-known session state, replayed when an adapter registers late.
const lastHandlers = new Map<MediaAction, MediaActionHandler | null>()
let lastMetadata: MediaMetadataInput | null = null
let lastPlayback: MediaPlaybackState = 'none'
let active: MediaSessionAdapter = webAdapter

/** Swap in a platform adapter (pass null to restore the web default). */
export function registerMediaSessionAdapter(adapter: MediaSessionAdapter | null): void {
  active = adapter ?? webAdapter
  for (const [action, handler] of lastHandlers) active.setActionHandler(action, handler)
  if (lastMetadata) active.setMetadata(lastMetadata)
  active.setPlaybackState(lastPlayback)
}

/** Process-wide media session facade used by the audio providers. */
export const mediaSession: MediaSessionAdapter = {
  setMetadata(metadata) {
    lastMetadata = metadata
    active.setMetadata(metadata)
  },
  setPlaybackState(state) {
    lastPlayback = state
    active.setPlaybackState(state)
  },
  setPositionState(state) {
    active.setPositionState(state)
  },
  setActionHandler(action, handler) {
    lastHandlers.set(action, handler)
    active.setActionHandler(action, handler)
  },
}
