import { Network } from '@capacitor/network'

/**
 * Thin connectivity seam over @capacitor/network. The plugin has a web
 * implementation too, but browsers rarely expose a reliable connection type —
 * treat anything that is not a confirmed 'wifi' as not-Wi-Fi and let callers
 * decide how conservative to be.
 */

export type ConnectionKind = 'wifi' | 'cellular' | 'none' | 'unknown'

function normalize(connected: boolean, type: string): ConnectionKind {
  if (!connected) return 'none'
  if (type === 'wifi') return 'wifi'
  if (type === 'cellular') return 'cellular'
  return 'unknown'
}

export async function getConnectionKind(): Promise<ConnectionKind> {
  try {
    const status = await Network.getStatus()
    return normalize(status.connected, status.connectionType)
  } catch {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'none'
    return 'unknown'
  }
}

/** Subscribe to connectivity changes; returns an unsubscribe function. */
export function onConnectionChange(
  callback: (kind: ConnectionKind) => void,
): () => void {
  const handle = Network.addListener('networkStatusChange', (status) => {
    callback(normalize(status.connected, status.connectionType))
  })
  return () => {
    void handle.then((h) => h.remove()).catch(() => {})
  }
}
