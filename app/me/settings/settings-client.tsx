'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { meApi } from '@/src/api/me-client'
import { getSession } from 'next-auth/react'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'

type ConsentState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; consent: boolean }

type ExportStatus = 'queued' | 'running' | 'sent' | 'failed'

type ExportState = {
  status: ExportStatus
  sent_at?: string
}

export function SettingsClient() {
  const t = useTranslations('meSettings')
  const [consent, setConsent] = useState<ConsentState>({ status: 'loading' })
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [exportState, setExportState] = useState<ExportState | null>(null)
  const [requestingExport, setRequestingExport] = useState(false)
  const [userEmail, setUserEmail] = useState('')

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

  useEffect(() => {
    getSession().then((s) => setUserEmail(s?.user?.email ?? ''))
    const exportTimer = window.setTimeout(() => {
      void refreshExportStatus()
    }, 0)
    meApi.activity
      .getConsent()
      .then(({ consent }) => setConsent({ status: 'ready', consent }))
      .catch(() => setConsent({ status: 'error' }))

    return () => window.clearTimeout(exportTimer)
  }, [refreshExportStatus])

  async function requestExport() {
    if (requestingExport) return
    setRequestingExport(true)
    setExportMsg(null)
    try {
      const res = await authFetch('/me/export', { method: 'POST' })
      if (res.status === 429) {
        const body = await res.json()
        setExportMsg(t('export.nextAvailable', { eta: formatHHMM(Number(body.retry_after_seconds ?? 0)) }))
        return
      }
      if (res.ok) {
        setExportMsg(t('export.queued', { email: userEmail || 'your email' }))
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

  async function clearAll() {
    if (clearing) return
    if (!window.confirm(t('clearButton'))) return
    setClearing(true)
    try {
      await meApi.activity.clear()
      flash(t('clearedToast'))
    } finally {
      setClearing(false)
    }
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2400)
  }

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
            <h2 style={h2Style}>{t('export.heading')}</h2>
            <p style={bodyStyle}>{t('export.disclosure', { email: userEmail || 'your email' })}</p>
            {(exportState == null || exportState.status === 'failed') && (
              <button type="button" onClick={requestExport} disabled={requestingExport} style={{ ...buttonStyle, marginTop: 16 }}>
                {t('export.button')}
              </button>
            )}
            {(exportState?.status === 'queued' || exportState?.status === 'running') && (
              <p style={bodyStyle}>{t('export.queued', { email: userEmail || 'your email' })}</p>
            )}
            {exportState?.status === 'sent' && within24h(exportState.sent_at) && (
              <p style={bodyStyle}>{t('export.sent', { when: relative(exportState.sent_at), eta: formatHHMM(secondsUntil24h(exportState.sent_at)) })}</p>
            )}
            {exportMsg && <p style={bodyStyle}>{exportMsg}</p>}
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>{t('clearHeading')}</h2>
            <p style={bodyStyle}>{t('clearBody')}</p>
            <button type="button" onClick={clearAll} disabled={clearing} style={{ ...buttonStyle, marginTop: 16 }}>
              {t('clearButton')}
            </button>
          </section>
        </>
      )}

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

function formatHHMM(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(clamped / 3600)
  const m = Math.floor((clamped % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function within24h(sentAt?: string): boolean {
  if (!sentAt) return false
  return Date.now() - new Date(sentAt).getTime() < 24 * 3600 * 1000
}

function secondsUntil24h(sentAt?: string): number {
  if (!sentAt) return 0
  const end = new Date(sentAt).getTime() + 24 * 3600 * 1000
  return Math.max(0, Math.floor((end - Date.now()) / 1000))
}

function relative(sentAt?: string): string {
  if (!sentAt) return ''
  const diffMin = Math.floor((Date.now() - new Date(sentAt).getTime()) / 60000)
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}
