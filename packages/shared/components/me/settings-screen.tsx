'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { meApi } from '@/src/api/me-client'
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
  sent_at?: string | null
  download_url?: string | null
}

type DeleteStatus = 'queued' | 'running' | 'done' | 'failed'

type DeleteState = {
  status: DeleteStatus
  categories?: string[]
  counts?: Record<string, number> | null
  completed_at?: string | null
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

// Settings are split into tabs so downloads stand apart from account and
// privacy controls; the offline fallback page links straight to ?tab=downloads.
const SETTINGS_TABS = ['general', 'privacy', 'downloads'] as const
type SettingsTab = (typeof SETTINGS_TABS)[number]

function resolveTab(candidate: string | undefined, hasDownloads: boolean): SettingsTab {
  const tab = SETTINGS_TABS.find((t) => t === candidate) ?? 'general'
  return tab === 'downloads' && !hasDownloads ? 'general' : tab
}

interface SettingsClientProps {
  /** Optional offline-reading section. Injected by apps/web (sqlite-wasm + OPFS);
   * omitted on Capacitor, which will supply a native adapter in a later phase.
   * Keeping it a slot prevents the web worker/WASM from entering the mobile bundle. */
  offlineSection?: React.ReactNode
  /** Optional replacement for the web-push notifications section. The mobile
   * app injects its native (local + FCM) preferences here — the Capacitor
   * webview has no service-worker push, so the web section would only ever
   * report "unsupported" there. Web omits it and keeps the built-in section. */
  notificationsSection?: React.ReactNode
  /** Initial tab, from the page's ?tab= search param. */
  initialTab?: string
  /** The signed-in account's email. Used as the typed confirmation value for
   * wholesale account deletion. When absent, the delete-account card is hidden
   * (there is nothing to confirm against). */
  accountEmail?: string
  /** App-specific sign-out, invoked after the account is deleted. Web passes
   * next-auth's signOut; mobile passes the Capacitor auth sign-out. When absent,
   * the delete-account card is hidden. */
  onAccountDeleted?: () => void
}

export function SettingsClient({
  offlineSection,
  notificationsSection,
  initialTab,
  accountEmail,
  onAccountDeleted,
}: SettingsClientProps = {}) {
  const t = useTranslations('meSettings')
  const hasDownloads = offlineSection != null
  const [tab, setTab] = useState<SettingsTab>(() => resolveTab(initialTab, hasDownloads))
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
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [accountConfirmText, setAccountConfirmText] = useState('')
  const [submittingAccount, setSubmittingAccount] = useState(false)

  const refreshExportStatus = useCallback(async () => {
    const body = await meApi.privacy.getExportStatus()
    setExportState(body.data ?? null)
  }, [])

  const refreshDeleteStatus = useCallback(async () => {
    const body = await meApi.privacy.getDeletionStatus()
    setDeleteState(body.data ?? null)
  }, [])

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
      const result = await meApi.privacy.requestExport()
      if (!result.queued) {
        setExportMsg(t('export.nextAvailable', { eta: formatEta(result.retryAfterSeconds) }))
        return
      }
      await refreshExportStatus()
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
      const result = await meApi.privacy.requestContentDeletion({ categories })
      if (!result.queued && result.status === 409) {
        flash(t('deleteContent.exportFirst'))
        return
      }
      if (!result.queued && result.status === 429) {
        flash(t('deleteContent.inProgress'))
        return
      }
      setDeleteOpen(false)
      await refreshDeleteStatus()
    } finally {
      setSubmittingDelete(false)
    }
  }

  function openDeleteAccountDialog() {
    setAccountConfirmText('')
    setDeleteAccountOpen(true)
  }

  async function submitDeleteAccount() {
    if (submittingAccount) return
    // Re-assert the same guards the button enforces: a completed export and an
    // exact email match. The server independently enforces the export gate.
    if (!exportReady) return
    if (!accountEmail || accountConfirmText.trim() !== accountEmail) return
    setSubmittingAccount(true)
    try {
      const result = await meApi.privacy.deleteAccount()
      if (!result.deleted && result.status === 409) {
        flash(t('deleteAccount.exportFirst'))
        return
      }
      setDeleteAccountOpen(false)
      onAccountDeleted?.()
    } catch {
      flash(t('deleteAccount.failed'))
    } finally {
      setSubmittingAccount(false)
    }
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2400)
  }

  function switchTab(next: SettingsTab) {
    setTab(next)
    // Keep the URL shareable. replaceState (not router.replace) so frequent
    // URL updates never re-render the app's useSearchParams consumers.
    const url = new URL(window.location.href)
    if (next === 'general') url.searchParams.delete('tab')
    else url.searchParams.set('tab', next)
    window.history.replaceState(window.history.state, '', url)
  }

  const visibleTabs = SETTINGS_TABS.filter((key) => key !== 'downloads' || hasDownloads)

  // A completed, downloadable export is required before any deletion. The
  // backend enforces this too; the UI mirrors it to keep the flow clear.
  const exportReady = exportState?.status === 'sent'
  const deletionInFlight = deleteState?.status === 'queued' || deleteState?.status === 'running'
  const confirmWord = t('deleteContent.confirmWord')
  const canSubmitDelete =
    selectedCats.size > 0 && confirmText.trim() === confirmWord && !submittingDelete
  // Account deletion is only offered when the host app supplied both the email
  // to confirm against and a sign-out callback to run afterwards.
  const accountDeletionAvailable = accountEmail != null && onAccountDeleted != null
  const canSubmitDeleteAccount =
    exportReady &&
    accountEmail != null &&
    accountConfirmText.trim() === accountEmail &&
    !submittingAccount

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={titleStyle}>{t('title')}</h1>
      </header>

      <nav style={tabBarStyle} role="tablist" aria-label={t('title')}>
        {visibleTabs.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => switchTab(key)}
            style={tabButtonStyle(tab === key)}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </nav>

      {tab === 'general' && (
        <>
          {consent.status === 'loading' && <p style={mutedStyle}>{t('loading')}</p>}
          {consent.status === 'error' && <p style={mutedStyle}>{t('error')}</p>}

          {consent.status === 'ready' && (
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
          )}

          {notificationsSection != null ? (
            <section style={cardStyle}>
              <h2 style={h2Style}>{t('notifications.heading')}</h2>
              {notificationsSection}
            </section>
          ) : (
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
          )}
        </>
      )}

      {tab === 'privacy' && (
        <>
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
                {exportState.sent_at && (
                  <p style={mutedStyle}>
                    {t('export.collectedAt', { date: formatExportDate(exportState.sent_at) })}
                  </p>
                )}
                {withinCooldown(exportState.sent_at ?? undefined) && (
                  <p style={mutedStyle}>
                    {t('export.ready', { eta: formatEta(secondsUntilCooldownEnd(exportState.sent_at ?? undefined)) })}
                  </p>
                )}
              </div>
            )}

            {exportState?.status === 'failed' && <p style={bodyStyle}>{t('export.failed')}</p>}

            {(exportState == null ||
              exportState.status === 'failed' ||
              (exportState.status === 'sent' && !withinCooldown(exportState.sent_at ?? undefined))) && (
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

          {accountDeletionAvailable && (
            <section style={{ ...cardStyle, borderColor: 'var(--destructive, #b91c1c)' }}>
              <h2 style={h2Style}>{t('deleteAccount.heading')}</h2>
              <p style={bodyStyle}>{t('deleteAccount.body')}</p>

              {!exportReady && <p style={mutedStyle}>{t('deleteAccount.exportFirst')}</p>}

              <button
                type="button"
                onClick={openDeleteAccountDialog}
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
                {t('deleteAccount.button')}
              </button>
            </section>
          )}
        </>
      )}

      {/* Offline downloads are independent of the account fetches on the other
          tabs — a failing/slow /me request must not hide the download manager. */}
      {tab === 'downloads' && offlineSection}

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

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteAccount.dialogTitle')}</DialogTitle>
          </DialogHeader>

          <p className="text-sm font-medium text-destructive">{t('deleteAccount.warning')}</p>

          <label className="block text-sm pt-2">
            <span className="text-muted-foreground">
              {t('deleteAccount.confirmPrompt', { email: accountEmail ?? '' })}
            </span>
            <input
              type="text"
              value={accountConfirmText}
              onChange={(e) => setAccountConfirmText(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              placeholder={accountEmail}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteAccountOpen(false)}>
              {t('deleteAccount.cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canSubmitDeleteAccount}
              onClick={submitDeleteAccount}
            >
              {t('deleteAccount.confirm')}
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

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  marginBottom: 24,
  borderBottom: '1px solid var(--ed-rule)',
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 14px',
    marginBottom: -1,
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--ed-fg)' : '2px solid transparent',
    color: active ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
    fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  }
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

// Format the export collection date. Shows full date/time if from same day,
// otherwise just the date.
function formatExportDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
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
