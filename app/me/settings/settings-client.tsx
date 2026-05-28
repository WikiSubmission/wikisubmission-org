'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { meApi } from '@/src/api/me-client'

type ConsentState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; consent: boolean }

export function SettingsClient() {
  const t = useTranslations('meSettings')
  const [consent, setConsent] = useState<ConsentState>({ status: 'loading' })
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    meApi.activity
      .getConsent()
      .then(({ consent }) => setConsent({ status: 'ready', consent }))
      .catch(() => setConsent({ status: 'error' }))
  }, [])

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
            <h2 style={h2Style}>{t('clearHeading')}</h2>
            <p style={bodyStyle}>{t('clearBody')}</p>
            <button
              type="button"
              onClick={clearAll}
              disabled={clearing}
              style={{ ...buttonStyle, marginTop: 16 }}
            >
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
