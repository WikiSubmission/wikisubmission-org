import { MediaSession } from '@capgo/capacitor-media-session'
import type {
  MediaSessionAdapter,
  MediaMetadataInput,
  MediaPlaybackState,
  MediaPositionState,
  MediaAction,
  MediaActionHandler,
} from '@/lib/media-session-adapter'
import { ensureNotificationPermission } from './notification-permission'

// The Android notification loads artwork natively — it cannot fetch from the
// webview-only https://localhost origin, so site-relative paths are resolved
// against the public website host.
const ARTWORK_HOST = 'https://www.wikisubmission.org'

const resolveArtwork = (src: string): string =>
  src.startsWith('/') ? `${ARTWORK_HOST}${src}` : src

let permissionRequested = false

/**
 * Native MediaSession bridge (Android foreground service + notification).
 * Registered into the shared media-session adapter seam by NativeInit; every
 * call is fire-and-forget so a plugin failure can never break playback.
 */
export const nativeMediaSessionAdapter: MediaSessionAdapter = {
  setMetadata(metadata: MediaMetadataInput): void {
    void MediaSession.setMetadata({
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      artwork: [{ src: resolveArtwork(metadata.artworkSrc), sizes: '512x512', type: 'image/png' }],
    }).catch(() => {})
  },
  setPlaybackState(playbackState: MediaPlaybackState): void {
    // First playback is the natural moment to ask for POST_NOTIFICATIONS
    // (Android 13+) — the media notification this state change creates is
    // exactly what the permission unlocks.
    if (playbackState === 'playing' && !permissionRequested) {
      permissionRequested = true
      void ensureNotificationPermission()
    }
    void MediaSession.setPlaybackState({ playbackState }).catch(() => {})
  },
  setPositionState(state: MediaPositionState | null): void {
    void MediaSession.setPositionState(
      state ?? { duration: 0, position: 0, playbackRate: 1 }
    ).catch(() => {})
  },
  setActionHandler(action: MediaAction, handler: MediaActionHandler | null): void {
    void MediaSession.setActionHandler(
      { action },
      handler ? (details) => handler({ seekTime: details.seekTime }) : null
    ).catch(() => {})
  },
}
