'use client'

import { useOfflineContent } from '@/hooks/use-offline-content'
import { offlineSupportDiagnostics } from '@/lib/offline/web-store-singleton'
import type { BundleDescriptor } from '@/lib/offline/types'

// Bump this string on each debug deploy so it is trivial to confirm from the
// browser whether the freshly-built bundle is actually live. Remove the whole
// OfflineDebugPanel once the offline section is confirmed rendering on preview.
const OFFLINE_DEBUG_BUILD = 'offline-debug-2'

// NOTE: copy is English-only for now; move into the meSettings i18n namespace
// once the offline feature is verified on-device (Phase 2 follow-up).

function formatBytes(n: number): string {
  if (n <= 0) return '0 MB'
  const mb = n / (1024 * 1024)
  if (mb < 1) return `${Math.round(n / 1024)} KB`
  return `${mb.toFixed(1)} MB`
}

export function OfflineSettingsSection() {
  const offline = useOfflineContent()

  if (!offline.loading && !offline.supported) {
    return (
      <>
        <OfflineDebugPanel offline={offline} />
        <section style={cardStyle}>
          <h2 style={h2Style}>Offline reading</h2>
          <p style={bodyStyle}>
            Offline downloads are not available in this browser. Reading still works
            while you are online.
          </p>
        </section>
      </>
    )
  }

  const bundles = offline.manifest?.bundles ?? []

  return (
    <>
      <OfflineDebugPanel offline={offline} />
      <section style={cardStyle}>
        <h2 style={h2Style}>Offline reading</h2>
      <p style={bodyStyle}>
        Download translations to read and search the Quran without a connection.
      </p>

      {offline.usage && (
        <p style={mutedStyle}>
          Using {formatBytes(offline.usage.usage)}
          {offline.usage.quota > 0 ? ` of ${formatBytes(offline.usage.quota)} available` : ''}.
        </p>
      )}

      {offline.error && <p style={{ ...bodyStyle, color: 'var(--destructive, #b91c1c)' }}>{offline.error}</p>}

      {offline.loading && <p style={mutedStyle}>Loading…</p>}

      {!offline.loading && bundles.length === 0 && (
        <p style={mutedStyle}>No downloadable content is available right now.</p>
      )}

      <ul style={listStyle}>
        {bundles.map((bundle) => (
          <BundleRow
            key={bundle.id}
            bundle={bundle}
            installed={offline.isInstalled(bundle.id)}
            busy={offline.busyId === bundle.id}
            progressPct={
              offline.busyId === bundle.id && offline.progress
                ? progressPercent(offline.progress.received, offline.progress.total)
                : null
            }
            progressPhase={offline.busyId === bundle.id ? offline.progress?.phase ?? null : null}
            onInstall={() => offline.install(bundle)}
            onRemove={() => offline.remove(bundle.id)}
          />
          ))}
        </ul>
      </section>
    </>
  )
}

// Temporary diagnostic. Renders unconditionally (independent of support/loading)
// so its presence alone confirms the freshly-built bundle is live, and its
// contents reveal exactly why the offline UI does or does not activate. Delete
// this component and its two call sites once the offline section is confirmed.
function OfflineDebugPanel({ offline }: { offline: ReturnType<typeof useOfflineContent> }) {
  const diag = offlineSupportDiagnostics()
  const rows: Array<[string, string]> = [
    ['build', OFFLINE_DEBUG_BUILD],
    ['supported', String(offline.supported)],
    ['loading', String(offline.loading)],
    ['worker', String(diag.worker)],
    ['webassembly', String(diag.webassembly)],
    ['navigator', String(diag.navigator)],
    ['opfs (storage.getDirectory)', String(diag.opfs)],
    ['manifest', offline.manifest ? `${offline.manifest.bundles.length} bundles` : 'null'],
    ['installed', String(offline.installed.length)],
    ['error', offline.error ?? '—'],
  ]
  return (
    <section
      style={{
        ...cardStyle,
        borderColor: '#f59e0b',
        background: 'rgba(245,158,11,0.06)',
        fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
        fontSize: 12,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 8 }}>
        ⚠ OFFLINE DEBUG ({OFFLINE_DEBUG_BUILD})
      </strong>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td style={{ paddingRight: 16, opacity: 0.7 }}>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function progressPercent(received: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((received / total) * 100))
}

interface BundleRowProps {
  bundle: BundleDescriptor
  installed: boolean
  busy: boolean
  progressPct: number | null
  progressPhase: 'download' | 'verify' | 'import' | null
  onInstall: () => void
  onRemove: () => void
}

function BundleRow({
  bundle,
  installed,
  busy,
  progressPct,
  progressPhase,
  onInstall,
  onRemove,
}: BundleRowProps) {
  return (
    <li style={rowStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{bundle.id}</span>
        <span style={statusStyle}>{formatBytes(bundle.bytes)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {busy && progressPhase && (
          <span style={statusStyle}>
            {progressPhase}
            {progressPhase === 'download' && progressPct != null ? ` ${progressPct}%` : '…'}
          </span>
        )}
        {!busy && installed && (
          <button type="button" onClick={onRemove} style={ghostButtonStyle}>
            Remove
          </button>
        )}
        {!busy && !installed && (
          <button type="button" onClick={onInstall} style={buttonStyle}>
            Download
          </button>
        )}
        {busy && <span style={statusStyle}>Working…</span>}
      </div>
    </li>
  )
}

const cardStyle: React.CSSProperties = {
  padding: '20px 24px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  background: 'var(--ed-surface)',
  marginBottom: 16,
}

const h2Style: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 22,
  fontWeight: 500,
}

const bodyStyle: React.CSSProperties = {
  marginTop: 8,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}

const mutedStyle: React.CSSProperties = { marginTop: 8, color: 'var(--ed-fg-muted)', fontSize: 13 }

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: '16px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 0',
  borderTop: '1px solid var(--ed-rule)',
}

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 13,
  cursor: 'pointer',
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
  fontSize: 13,
  cursor: 'pointer',
}
