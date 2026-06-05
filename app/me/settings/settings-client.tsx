'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { meApi } from '@/src/api/me-client'
import { getSession } from 'next-auth/react'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConsentState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; consent: boolean }

type ExportStatus = 'queued' | 'running' | 'sent' | 'failed'

type ExportState = {
  status: ExportStatus
  sent_at?: string
  download_url?: string
}

type DeleteStatus = 'queued' | 'running' | 'done' | 'failed'

type DeleteState = {
  status: DeleteStatus
  categories?: string[]
  counts?: Record<string, number>
  completed_at?: string
} | null

// Must match db.DeletionCategories on the backend.
const DELETE_CATEGORIES = [
  'bookmarks',
  'notes',
  'collections',
  'activity',
  'reading_progress',
  'games',
] as const

// The export download link stays valid for 30 days; a new export can only be
// requested every 15 days (enforced server-side). Both windows are mirrored
// here so the UI matches the backend gating.
const EXPORT_COOLDOWN_MS = 15 * 24 * 3600 * 1000

export function SettingsClient() {
  const t = useTranslations('meSettings')
  const push = usePushNotifications()
  const [consent, setConsent] = useState<ConsentState>({ status: 'loading' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [exportState, setExportState] = useState<ExportState | null>(null)
  const [requestingExport, setRequestingExport] = useState(false)
  const [deleteState, setDeleteState] = useState<DeleteState>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [confirmText, setConfirmText] = useState('')
  const [submittingDelete, setSubmittingDelete] = useState(false)

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
    const session = await getSession()
    const headers = new Headers(init?.headers ?? {})
    if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`)
    return fetch(`${resolveBrowserApiBaseUrl()}${path}`, { ...init, headers })
  }, [])

  const refreshExportStatus = useCallback(async () => {
    const res = await authFetch('/me/export/status')
    if (!res.ok) return
    const body = (await res.json()) as { data?: ExportState | null }
    setExportState(body.data ?? null)
  }, [authFetch])

  const refreshDeleteStatus = useCallback(async () => {
    const res = await authFetch('/me/delete-content/status')
    if (!res.ok) return
    const body = (await res.json()) as { data?: DeleteState }
    setDeleteState(body.data ?? null)
  }, [authFetch])

  useEffect(() => {
    let alive = true
    const timer = window.setTimeout(() => {
      void refreshExportStatus()
      void refreshDeleteStatus()
    }, 0)
    meApi.activity
      .getConsent()
      .then(({ consent }) => {
        if (alive) setConsent({ status: 'ready', consent })
      })
      .catch(() => {
        if (alive) setConsent({ status: 'error' })
      })

    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [refreshExportStatus, refreshDeleteStatus])

  // While an export is being prepared, poll the status endpoint until it
  // resolves to sent or failed so the download link appears without a refresh.
  useEffect(() => {
    if (exportState?.status !== 'queued' && exportState?.status !== 'running') return
    const id = window.setInterval(() => {
      void refreshExportStatus()
    }, 3000)
    return () => window.clearInterval(id)
  }, [exportState?.status, refreshExportStatus])

  // Same polling for an in-progress deletion.
  useEffect(() => {
    if (deleteState?.status !== 'queued' && deleteState?.status !== 'running') return
    const id = window.setInterval(() => {
      void refreshDeleteStatus()
    }, 3000)
    return () => window.clearInterval(id)
  }, [deleteState?.status, refreshDeleteStatus])

  async function requestExport() {
    if (requestingExport) return
    setRequestingExport(true)
    setExportMsg(null)
    try {
      const res = await authFetch('/me/export', { method: 'POST' })
      if (res.status === 429) {
        const body = await res.json()
        setExportMsg(t('export.nextAvailable', { eta: formatEta(Number(body.retry_after_seconds ?? 0)) }))
        return
      }
      if (res.ok) {
        await refreshExportStatus()
      }
    } finally {
      setRequestingExport(false)
    }
  }

  async function toggle() {
    if (consent.status !== 'ready' || saving) return
    setSaving(true)
    try {
      const { consent: next } = await meApi.activity.setConsent(!consent.consent)
      setConsent({ status: 'ready', consent: next })
      flash(t('saved'))
    } finally {
      setSaving(false)
    }
  }

  function toggleCategory(key: string) {
    setSelectedCats((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function openDeleteDialog() {
    setSelectedCats(new Set())
    setConfirmText('')
    setDeleteOpen(true)
  }

  async function submitDelete() {
    if (submittingDelete) return
    const categories = [...selectedCats]
    // Re-assert the same guards the button enforces, so the destructive POST
    // can never fire without an explicit selection, a typed confirmation, and a
    // completed export (the server enforces these too).
    if (categories.length === 0) return
    if (confirmText.trim() !== confirmWord) return
    if (!exportReady) return
    setSubmittingDelete(true)
    try {
      const res = await authFetch('/me/delete-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      })
      if (res.status === 409) {
        flash(t('deleteContent.exportFirst'))
        return
      }
      if (res.status === 429) {
        flash(t('deleteContent.inProgress'))
        return
      }
      if (res.ok) {
        setDeleteOpen(false)
        await refreshDeleteStatus()
      }
    } finally {
      setSubmittingDelete(false)
    }
  }

  function toggleCategory(key: string) {
    setSelectedCats((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function openDeleteDialog() {
    setSelectedCats(new Set())
    setConfirmText('')
    setDeleteOpen(true)
  }

  async function submitDelete() {
    if (submittingDelete) return
    const categories = [...selectedCats]
    // Re-assert the same guards the button enforces, so the destructive POST
    // can never fire without an explicit selection, a typed confirmation, and a
    // completed export (the server enforces these too).
    if (categories.length === 0) return
    if (confirmText.trim() !== confirmWord) return
    if (!exportReady) return
    setSubmittingDelete(true)
    try {
      const res = await authFetch('/me/delete-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      })
      if (res.status === 409) {
        flash(t('deleteContent.exportFirst'))
        return
      }
      if (res.status === 429) {
        flash(t('deleteContent.inProgress'))
        return
      }
      if (res.ok) {
        setDeleteOpen(false)
        await refreshDeleteStatus()
      }
    } finally {
      setSubmittingDelete(false)
    }
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2400)
  }

  // A completed, downloadable export is required before any deletion. The
  // backend enforces this too; the UI mirrors it to keep the flow clear.
  const exportReady = exportState?.status === 'sent'
  const deletionInFlight = deleteState?.status === 'queued' || deleteState?.status === 'running'
  const confirmWord = t('deleteContent.confirmWord')
  const canSubmitDelete =
    selectedCats.size > 0 && confirmText.trim() === confirmWord && !submittingDelete

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={titleStyle}>{t('title')}</h1>
      </header>

      {consent.status === 'loading' && <p style={mutedStyle}>{t('loading')}</p>}
      {consent.status === 'error' && <p style={mutedStyle}>{t('error')}</p>}

      {consent.status === 'ready' && (
        <>
          <section style={cardStyle}>
            <h2 style={h2Style}>{t('consentHeading')}</h2>
            <p style={bodyStyle}>{t('consentBody')}</p>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={statusStyle}>
                {consent.consent ? t('consentToggleOn') : t('consentToggleOff')}
              </span>
              <button type="button" onClick={toggle} disabled={saving} style={buttonStyle}>
                {consent.consent ? t('consentDisable') : t('consentEnable')}
              </button>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>{t('notifications.heading')}</h2>
            <p style={bodyStyle}>{t('notifications.body')}</p>
            {!push.supported && (
              <p style={mutedStyle}>{t('notifications.unsupported')}</p>
            )}
            {push.supported && push.permission === 'denied' && (
              <p style={mutedStyle}>{t('notifications.blocked')}</p>
            )}
            {push.supported && push.permission !== 'denied' && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={statusStyle}>
                  {push.subscribed
                    ? t('notifications.statusOn')
                    : t('notifications.statusOff')}
                </span>
                {push.subscribed ? (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await push.unsubscribe()
                        flash(t('notifications.toastDisabled'))
                      }}
                      disabled={push.busy}
                      style={buttonStyle}
                    >
                      {t('notifications.disable')}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await push.sendTest()
                        flash(t('notifications.toastTestSent'))
                      }}
                      disabled={push.busy}
                      style={buttonStyle}
                    >
                      {t('notifications.test')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await push.subscribe()
                      flash(
                        ok
                          ? t('notifications.toastEnabled')
                          : t('notifications.toastFailed'),
                      )
                    }}
                    disabled={push.busy}
                    style={buttonStyle}
                  >
                    {t('notifications.enable')}
                  </button>
                )}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>{t('export.heading')}</h2>
            <p style={bodyStyle}>{t('export.disclosure')}</p>

            {(exportState?.status === 'queued' || exportState?.status === 'running') && (
              <p style={bodyStyle}>{t('export.preparing')}</p>
            )}

            {exportState?.status === 'sent' && exportState.download_url && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href={exportState.download_url}
                  download
                  style={{ ...buttonStyle, textDecoration: 'none', display: 'inline-block', width: 'fit-content' }}
                >
                  {t('export.download')}
                </a>
                {withinCooldown(exportState.sent_at) && (
                  <p style={mutedStyle}>
                    {t('export.ready', { eta: formatEta(secondsUntilCooldownEnd(exportState.sent_at)) })}
                  </p>
                )}
              </div>
            )}

            {exportState?.status === 'failed' && <p style={bodyStyle}>{t('export.failed')}</p>}

            {(exportState == null ||
              exportState.status === 'failed' ||
              (exportState.status === 'sent' && !withinCooldown(exportState.sent_at))) && (
              <button type="button" onClick={requestExport} disabled={requestingExport} style={{ ...buttonStyle, marginTop: 16 }}>
                {t('export.button')}
              </button>
            )}

            {exportMsg && <p style={bodyStyle}>{exportMsg}</p>}
          </section>

          <section style={{ ...cardStyle, borderColor: 'var(--destructive, #b91c1c)' }}>
            <h2 style={h2Style}>{t('deleteContent.heading')}</h2>
            <p style={bodyStyle}>{t('deleteContent.body')}</p>

            {!exportReady && <p style={mutedStyle}>{t('deleteContent.exportFirst')}</p>}

            {deletionInFlight && <p style={bodyStyle}>{t('deleteContent.preparing')}</p>}

            {deleteState?.status === 'done' && (
              <div style={{ marginTop: 12 }}>
                <p style={bodyStyle}>{t('deleteContent.done')}</p>
                {deleteState.counts && (
                  <ul style={{ ...mutedStyle, marginTop: 8, paddingLeft: 18 }}>
                    {Object.entries(deleteState.counts)
                      .filter(([key]) => (DELETE_CATEGORIES as readonly string[]).includes(key))
                      .map(([key, count]) => (
                        <li key={key}>
                          {t(`deleteContent.categories.${key}.label`)}: {count}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {deleteState?.status === 'failed' && <p style={bodyStyle}>{t('deleteContent.failed')}</p>}

            {!deletionInFlight && (
              <button
                type="button"
                onClick={openDeleteDialog}
                disabled={!exportReady}
                style={{
                  ...buttonStyle,
                  marginTop: 16,
                  background: exportReady ? 'var(--destructive, #b91c1c)' : 'var(--ed-rule)',
                  borderColor: exportReady ? 'var(--destructive, #b91c1c)' : 'var(--ed-rule)',
                  color: '#fff',
                  cursor: exportReady ? 'pointer' : 'not-allowed',
                }}
              >
                {t('deleteContent.button')}
              </button>
            )}
          </section>

          <section style={{ ...cardStyle, borderColor: 'var(--destructive, #b91c1c)' }}>
            <h2 style={h2Style}>{t('deleteContent.heading')}</h2>
            <p style={bodyStyle}>{t('deleteContent.body')}</p>

            {!exportReady && <p style={mutedStyle}>{t('deleteContent.exportFirst')}</p>}

            {deletionInFlight && <p style={bodyStyle}>{t('deleteContent.preparing')}</p>}

            {deleteState?.status === 'done' && (
              <div style={{ marginTop: 12 }}>
                <p style={bodyStyle}>{t('deleteContent.done')}</p>
                {deleteState.counts && (
                  <ul style={{ ...mutedStyle, marginTop: 8, paddingLeft: 18 }}>
                    {Object.entries(deleteState.counts)
                      .filter(([key]) => (DELETE_CATEGORIES as readonly string[]).includes(key))
                      .map(([key, count]) => (
                        <li key={key}>
                          {t(`deleteContent.categories.${key}.label`)}: {count}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {deleteState?.status === 'failed' && <p style={bodyStyle}>{t('deleteContent.failed')}</p>}

            {!deletionInFlight && (
              <button
                type="button"
                onClick={openDeleteDialog}
                disabled={!exportReady}
                style={{
                  ...buttonStyle,
                  marginTop: 16,
                  background: exportReady ? 'var(--destructive, #b91c1c)' : 'var(--ed-rule)',
                  borderColor: exportReady ? 'var(--destructive, #b91c1c)' : 'var(--ed-rule)',
                  color: '#fff',
                  cursor: exportReady ? 'pointer' : 'not-allowed',
                }}
              >
                {t('deleteContent.button')}
              </button>
            )}
          </section>
        </>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteContent.dialogTitle')}</DialogTitle>
          </DialogHeader>

          <p className="text-sm font-medium text-destructive">{t('deleteContent.warning')}</p>

          <div className="flex flex-col gap-3 py-2">
            {DELETE_CATEGORIES.map((key) => (
              <label key={key} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedCats.has(key)}
                  onChange={() => toggleCategory(key)}
                />
                <span>
                  <span className="font-medium">{t(`deleteContent.categories.${key}.label`)}</span>
                  <span className="block text-muted-foreground">
                    {t(`deleteContent.categories.${key}.explanation`)}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">
              {t('deleteContent.confirmPrompt', { word: confirmWord })}
            </span>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              placeholder={confirmWord}
              autoComplete="off"
            />
          </label>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
              {t('deleteContent.cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canSubmitDelete}
              onClick={submitDelete}
            >
              {t('deleteContent.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <p style={toastStyle} role="status">
          {toast}
        </p>
      )}
    </section>
  )
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(32px, 5vw, 48px)',
  lineHeight: 1.1,
  margin: 0,
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

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 13,
  cursor: 'pointer',
}

const mutedStyle: React.CSSProperties = { color: 'var(--ed-fg-muted)', fontSize: 14 }

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '8px 16px',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  borderRadius: 2,
  fontSize: 13,
  zIndex: 100,
}

// Renders a coarse "Nd Mh" / "Mh Ms" countdown. Used for the multi-day export
// cooldown, where an HH:MM clock would read awkwardly.
function formatEta(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function withinCooldown(sentAt?: string): boolean {
  if (!sentAt) return false
  return Date.now() - new Date(sentAt).getTime() < EXPORT_COOLDOWN_MS
}

function secondsUntilCooldownEnd(sentAt?: string): number {
  if (!sentAt) return 0
  const end = new Date(sentAt).getTime() + EXPORT_COOLDOWN_MS
  return Math.max(0, Math.floor((end - Date.now()) / 1000))
}
