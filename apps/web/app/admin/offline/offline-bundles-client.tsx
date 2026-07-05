'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchManifest, OFFLINE_MANIFEST_URL } from '@/lib/offline/manifest'
import type { Manifest } from '@/lib/offline/types'
import type { PublishedState, RebuildStatus } from '@/lib/offline-admin-client'
import { publishedFilesAction, rebuildBundlesAction, rebuildStatusAction } from './actions'

function formatBytes(n: number): string {
  if (n <= 0) return '0 MB'
  const mb = n / (1024 * 1024)
  if (mb < 1) return `${Math.round(n / 1024)} KB`
  return `${mb.toFixed(1)} MB`
}

function formatTime(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function formatDate(httpDate?: string): string {
  if (!httpDate) return ''
  const parsed = new Date(httpDate)
  return Number.isNaN(parsed.getTime()) ? httpDate : parsed.toLocaleDateString()
}

export function OfflineBundlesClient() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [job, setJob] = useState<RebuildStatus | null>(null)
  const [published, setPublished] = useState<PublishedState | null>(null)
  const [publishedError, setPublishedError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  // The publish flips the manifest a moment after the job reports done; track
  // the last finished_at we refreshed for so the list updates exactly once.
  const refreshedFor = useRef<string | null>(null)

  const loadManifest = useCallback(async () => {
    try {
      setManifest(await fetchManifest(OFFLINE_MANIFEST_URL))
      setManifestError(null)
    } catch (err) {
      setManifestError(err instanceof Error ? err.message : 'Failed to load the manifest')
    }
  }, [])

  const loadStatus = useCallback(async () => {
    const result = await rebuildStatusAction()
    if (result.ok) {
      setJob(result.data)
      setActionError(null)
    } else {
      setActionError(result.error)
    }
  }, [])

  const loadPublished = useCallback(async () => {
    const result = await publishedFilesAction()
    if (result.ok) {
      setPublished(result.data)
      setPublishedError(null)
    } else {
      setPublishedError(result.error)
    }
  }, [])

  useEffect(() => {
    // Deferred a tick so the effect body itself schedules no state updates
    // (react-hooks/set-state-in-effect), matching the settings screen.
    const id = window.setTimeout(() => {
      void loadManifest()
      void loadStatus()
      void loadPublished()
    }, 0)
    return () => window.clearTimeout(id)
  }, [loadManifest, loadStatus, loadPublished])

  // Poll while a rebuild runs; refresh the published list when it lands.
  useEffect(() => {
    if (job?.status === 'running') {
      const id = window.setInterval(() => void loadStatus(), 3000)
      return () => window.clearInterval(id)
    }
    if (job?.status === 'done' && job.finished_at && refreshedFor.current !== job.finished_at) {
      refreshedFor.current = job.finished_at
      void loadManifest()
      void loadPublished()
    }
  }, [job, loadStatus, loadManifest, loadPublished])

  async function startRebuild() {
    if (starting || job?.status === 'running') return
    setStarting(true)
    setActionError(null)
    try {
      const result = await rebuildBundlesAction()
      if (result.ok) setJob(result.data)
      else setActionError(result.error)
    } finally {
      setStarting(false)
    }
  }

  const running = job?.status === 'running'
  const bundles = manifest?.bundles ?? []

  return (
    <>
      <section style={card}>
        <h2 style={h2}>Published bundles</h2>
        <p style={body}>
          What the CDN currently serves at{' '}
          <a href={OFFLINE_MANIFEST_URL} target="_blank" rel="noopener noreferrer" style={link}>
            /offline/manifest.json
          </a>
          . Readers download these from the Downloads section of their settings.
        </p>

        {manifestError && <p style={{ ...body, color: 'var(--destructive, #b91c1c)' }}>{manifestError}</p>}
        {!manifestError && !manifest && <p style={muted}>Loading…</p>}
        {manifest && bundles.length === 0 && <p style={muted}>Nothing is published yet.</p>}

        {bundles.length > 0 && (
          <ul style={list}>
            {bundles.map((b) => (
              <li key={b.id} style={row}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{b.id}</span>
                  <span style={mono}>
                    {b.kind ?? 'text'} · v{b.dataVersion} · {formatBytes(b.bytes)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>On the CDN</h2>
        <p style={body}>
          Every bundle and manifest version that exists on the CDN, newest first. Old versions
          stay downloadable at their immutable URLs; the live badge marks what manifest.json
          currently points at. A version without a badge that is newer than the live one was
          left behind by a failed publish.
        </p>

        {publishedError && (
          <p style={{ ...body, color: 'var(--destructive, #b91c1c)' }}>{publishedError}</p>
        )}
        {!publishedError && !published && <p style={muted}>Loading…</p>}
        {published && (published.versions?.length ?? 0) === 0 && (
          <p style={muted}>Nothing is published yet.</p>
        )}

        {published?.versions?.map((version) => (
          <div key={version.data_version} style={{ marginTop: 16 }}>
            <h3 style={{ ...mono, margin: 0 }}>
              Version {version.data_version}
              {version.live && <span style={liveBadge}>live</span>}
            </h3>
            <ul style={list}>
              {version.files.map((file) => (
                <li key={file.name} style={row}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ ...link, fontSize: 14 }}>
                      {file.name}
                    </a>
                    <span style={mono}>
                      {formatBytes(file.bytes)}
                      {file.last_modified ? ` · ${formatDate(file.last_modified)}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section style={card}>
        <h2 style={h2}>Rebuild and publish</h2>
        <p style={body}>
          Regenerates every bundle from the current database content (Arabic and English Quran
          text plus the English word-by-word data) and publishes them to the CDN under a new
          version. Run this after content changes, e.g. word-by-word edits. Readers keep their
          installed copies; new downloads get the new version.
        </p>

        {actionError && <p style={{ ...body, color: 'var(--destructive, #b91c1c)' }}>{actionError}</p>}

        {job && job.status !== 'idle' && (
          <div style={{ marginTop: 12 }}>
            <p style={mono}>
              {job.status === 'running' && `Building v${job.data_version}… started ${formatTime(job.started_at)}`}
              {job.status === 'done' &&
                `Published v${job.data_version} (${job.bundles?.length ?? 0} bundles) at ${formatTime(job.finished_at)}`}
              {job.status === 'failed' && `Failed at ${formatTime(job.finished_at)}`}
            </p>
            {job.status === 'failed' && job.error && (
              <p style={{ ...body, color: 'var(--destructive, #b91c1c)' }}>{job.error}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={startRebuild}
          disabled={starting || running}
          style={{ ...button, marginTop: 16, opacity: starting || running ? 0.6 : 1 }}
        >
          {running ? 'Rebuilding…' : 'Rebuild and publish'}
        </button>
      </section>
    </>
  )
}

const card: React.CSSProperties = {
  padding: '20px 24px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  background: 'var(--ed-surface)',
  marginBottom: 16,
}

const h2: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 22,
  fontWeight: 500,
}

const body: React.CSSProperties = {
  marginTop: 8,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}

const muted: React.CSSProperties = { marginTop: 8, color: 'var(--ed-fg-muted)', fontSize: 13 }

const link: React.CSSProperties = { color: 'inherit', textDecoration: 'underline' }

const list: React.CSSProperties = {
  listStyle: 'none',
  margin: '12px 0 0',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
}

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 0',
  borderTop: '1px solid var(--ed-rule)',
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const liveBadge: React.CSSProperties = {
  marginLeft: 8,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

const button: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 13,
  cursor: 'pointer',
}
