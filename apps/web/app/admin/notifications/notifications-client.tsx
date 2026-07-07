'use client'

import { useMemo, useState } from 'react'
import type {
  ScheduleDestination,
  ScheduleFrequency,
  ScheduleInput,
  ScheduledNotification,
  ZikrEntry,
} from '@/lib/notifications-admin-client'
import { ThemedSelect } from '@/components/ui/themed-select'
import {
  createScheduleAction,
  createZikrAction,
  deleteScheduleAction,
  deleteZikrAction,
  sendNowAction,
  sendTestAction,
  updateScheduleAction,
  updateZikrAction,
} from './actions'

interface NotificationsClientProps {
  initialSchedules: ScheduledNotification[]
  initialZikr: ZikrEntry[]
  initialError: string | null
}

const DESTINATION_OPTIONS = [
  { value: 'all', label: 'All devices' },
  { value: 'web_push', label: 'Web push' },
  { value: 'fcm', label: 'Mobile (FCM)' },
] as const

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

interface ScheduleFormState {
  title: string
  body: string
  url: string
  category: string
  destination: ScheduleDestination
  category_filter: string
  frequency: ScheduleFrequency
  starts_at: string // datetime-local wall clock, interpreted in `timezone`
  timezone: string
}

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function emptyScheduleForm(): ScheduleFormState {
  return {
    title: '',
    body: '',
    url: '',
    category: '',
    destination: 'all',
    category_filter: '',
    frequency: 'once',
    starts_at: '',
    timezone: browserTimezone(),
  }
}

/** Formats an instant as wall-clock `YYYY-MM-DDTHH:MM` in the given zone
 * (the value shape `<input type="datetime-local">` expects). */
function toWallClock(iso: string, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(iso))
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
    const hour = get('hour') === '24' ? '00' : get('hour')
    return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
  } catch {
    return ''
  }
}

function formatInZone(iso: string | undefined, timeZone: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function scheduleToInput(form: ScheduleFormState): ScheduleInput {
  return {
    title: form.title.trim(),
    body: form.body.trim(),
    url: form.url.trim() || undefined,
    category: form.category.trim() || undefined,
    destination: form.destination,
    category_filter: form.category_filter.trim() || undefined,
    frequency: form.frequency,
    starts_at: form.starts_at,
    timezone: form.timezone,
  }
}

export function NotificationsClient({
  initialSchedules,
  initialZikr,
  initialError,
}: NotificationsClientProps) {
  const [tab, setTab] = useState<'schedules' | 'zikr'>('schedules')
  const [schedules, setSchedules] = useState(initialSchedules)
  const [zikr, setZikr] = useState(initialZikr)
  const [error, setError] = useState<string | null>(initialError)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(emptyScheduleForm)
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null)

  const [zikrText, setZikrText] = useState('')
  const [zikrLang, setZikrLang] = useState('en')
  const [zikrSource, setZikrSource] = useState('')
  const [zikrWeight, setZikrWeight] = useState('0')
  const [editingZikrId, setEditingZikrId] = useState<number | null>(null)

  const timezones = useMemo<string[]>(() => {
    try {
      return Intl.supportedValuesOf('timeZone')
    } catch {
      return ['UTC']
    }
  }, [])

  function report(nextError: string | null, nextNotice: string | null = null) {
    setError(nextError)
    setNotice(nextNotice)
  }

  // ── Schedules ──────────────────────────────────────────────────────────────

  function patchSchedule(updated: ScheduledNotification) {
    setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  function startEditSchedule(s: ScheduledNotification) {
    setEditingScheduleId(s.id)
    setScheduleForm({
      title: s.title,
      body: s.body,
      url: s.url ?? '',
      category: s.category ?? '',
      destination: s.destination,
      category_filter: s.category_filter ?? '',
      frequency: s.frequency,
      starts_at: toWallClock(s.starts_at, s.timezone),
      timezone: s.timezone,
    })
    report(null)
  }

  function resetScheduleForm() {
    setEditingScheduleId(null)
    setScheduleForm(emptyScheduleForm())
  }

  async function submitSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduleForm.title.trim() || !scheduleForm.body.trim() || !scheduleForm.starts_at) {
      report('Title, body, and start time are required.')
      return
    }
    setBusy('schedule-save')
    report(null)
    const input = scheduleToInput(scheduleForm)
    const result = editingScheduleId
      ? await updateScheduleAction(editingScheduleId, input)
      : await createScheduleAction(input)
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    if (editingScheduleId) {
      patchSchedule(result.data)
      report(null, 'Schedule updated.')
    } else {
      setSchedules((prev) => [...prev, result.data])
      report(null, 'Schedule created.')
    }
    resetScheduleForm()
  }

  async function toggleScheduleEnabled(s: ScheduledNotification) {
    setBusy(`schedule-${s.id}`)
    report(null)
    const result = await updateScheduleAction(s.id, { enabled: !s.enabled })
    setBusy(null)
    if (!result.ok) report(result.error)
    else patchSchedule(result.data)
  }

  async function removeSchedule(s: ScheduledNotification) {
    if (!window.confirm(`Delete the schedule "${s.title}"? This cannot be undone.`)) return
    setBusy(`schedule-${s.id}`)
    report(null)
    const result = await deleteScheduleAction(s.id)
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    setSchedules((prev) => prev.filter((row) => row.id !== s.id))
    if (editingScheduleId === s.id) resetScheduleForm()
  }

  async function sendScheduleNow(s: ScheduledNotification) {
    if (!window.confirm(`Send "${s.title}" to its destination (${s.destination}) right now?`))
      return
    setBusy(`schedule-${s.id}`)
    report(null)
    const result = await sendNowAction(s.id)
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    report(
      null,
      `Sent now — web: ${result.data.web_sent ?? 0}, mobile: ${result.data.fcm_sent ?? 0}.`,
    )
    const refreshed = schedules.find((row) => row.id === s.id)
    if (refreshed) {
      patchSchedule({
        ...refreshed,
        last_status: result.data.status,
        last_web_sent: result.data.web_sent,
        last_fcm_sent: result.data.fcm_sent,
      })
    }
  }

  async function sendFormAsTest() {
    if (!scheduleForm.title.trim() || !scheduleForm.body.trim()) {
      report('Fill in a title and body first, then send the test.')
      return
    }
    setBusy('schedule-test')
    report(null)
    const result = await sendTestAction({
      title: scheduleForm.title.trim(),
      body: scheduleForm.body.trim(),
      url: scheduleForm.url.trim() || undefined,
    })
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    report(
      null,
      result.data.web_sent
        ? `Test sent to your ${result.data.web_sent} subscribed browser(s).`
        : 'Test accepted, but you have no push-subscribed browsers. Enable notifications in Settings first.',
    )
  }

  // ── Zikr ───────────────────────────────────────────────────────────────────

  function startEditZikr(entry: ZikrEntry) {
    setEditingZikrId(entry.id)
    setZikrText(entry.text)
    setZikrLang(entry.lang)
    setZikrSource(entry.source ?? '')
    setZikrWeight(String(entry.weight))
    report(null)
  }

  function resetZikrForm() {
    setEditingZikrId(null)
    setZikrText('')
    setZikrLang('en')
    setZikrSource('')
    setZikrWeight('0')
  }

  async function submitZikr(e: React.FormEvent) {
    e.preventDefault()
    const text = zikrText.trim()
    if (!text) {
      report('Zikr text is required.')
      return
    }
    const weight = Number.parseInt(zikrWeight, 10)
    const input = {
      text,
      lang: zikrLang.trim() || 'en',
      source: zikrSource.trim() || undefined,
      weight: Number.isFinite(weight) ? weight : 0,
    }
    setBusy('zikr-save')
    report(null)
    const result = editingZikrId
      ? await updateZikrAction(editingZikrId, input)
      : await createZikrAction(input)
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    if (editingZikrId) {
      setZikr((prev) => prev.map((z) => (z.id === result.data.id ? result.data : z)))
      report(null, 'Zikr updated.')
    } else {
      setZikr((prev) => [...prev, result.data])
      report(null, 'Zikr added.')
    }
    resetZikrForm()
  }

  async function toggleZikrActive(entry: ZikrEntry) {
    setBusy(`zikr-${entry.id}`)
    report(null)
    const result = await updateZikrAction(entry.id, { active: !entry.active })
    setBusy(null)
    if (!result.ok) report(result.error)
    else setZikr((prev) => prev.map((z) => (z.id === result.data.id ? result.data : z)))
  }

  async function removeZikr(entry: ZikrEntry) {
    if (!window.confirm('Delete this zikr entry? This cannot be undone.')) return
    setBusy(`zikr-${entry.id}`)
    report(null)
    const result = await deleteZikrAction(entry.id)
    setBusy(null)
    if (!result.ok) {
      report(result.error)
      return
    }
    setZikr((prev) => prev.filter((z) => z.id !== entry.id))
    if (editingZikrId === entry.id) resetZikrForm()
  }

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 24 }}>
        <p style={kicker}>Administration</p>
        <h1 style={heading}>Notifications</h1>
        <p style={lede}>
          Schedule push notifications to web and mobile devices, and manage the zikr reminder
          texts shown in the app.
        </p>
      </header>

      <div style={tabRow}>
        <button
          type="button"
          style={tab === 'schedules' ? tabOn : tabOff}
          onClick={() => setTab('schedules')}
        >
          Scheduled notifications
        </button>
        <button type="button" style={tab === 'zikr' ? tabOn : tabOff} onClick={() => setTab('zikr')}>
          Zikr entries
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
      {notice && <p style={noticeStyle}>{notice}</p>}

      {tab === 'schedules' && (
        <>
          <form onSubmit={submitSchedule} style={formCard}>
            <div style={formTitleRow}>
              <h2 style={formTitle}>
                {editingScheduleId ? `Edit schedule #${editingScheduleId}` : 'New schedule'}
              </h2>
              {editingScheduleId && (
                <button type="button" style={ghostButton} onClick={resetScheduleForm}>
                  Cancel edit
                </button>
              )}
            </div>

            <div style={fieldGrid}>
              <label style={fieldLabel}>
                Title
                <input
                  style={input}
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={120}
                  required
                />
              </label>
              <label style={fieldLabel}>
                URL / deep link (optional)
                <input
                  style={input}
                  value={scheduleForm.url}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="/quran/1 or https://…"
                />
              </label>
              <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
                Body
                <textarea
                  style={{ ...input, minHeight: 72, resize: 'vertical' }}
                  value={scheduleForm.body}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, body: e.target.value }))}
                  maxLength={500}
                  required
                />
              </label>
              <label style={fieldLabel}>
                Destination
                <ThemedSelect
                  value={scheduleForm.destination}
                  onChange={(v) =>
                    setScheduleForm((f) => ({ ...f, destination: v as ScheduleDestination }))
                  }
                  options={DESTINATION_OPTIONS.map((o) => ({ ...o }))}
                  aria-label="Destination"
                />
              </label>
              <label style={fieldLabel}>
                Category filter (optional)
                <input
                  style={input}
                  value={scheduleForm.category_filter}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, category_filter: e.target.value }))
                  }
                  placeholder="only subscribers of this category"
                />
              </label>
              <label style={fieldLabel}>
                Frequency
                <ThemedSelect
                  value={scheduleForm.frequency}
                  onChange={(v) =>
                    setScheduleForm((f) => ({ ...f, frequency: v as ScheduleFrequency }))
                  }
                  options={FREQUENCY_OPTIONS.map((o) => ({ ...o }))}
                  aria-label="Frequency"
                />
              </label>
              <label style={fieldLabel}>
                Notification tag (optional)
                <input
                  style={input}
                  value={scheduleForm.category}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="groups/replaces notifications"
                />
              </label>
              <label style={fieldLabel}>
                {scheduleForm.frequency === 'once' ? 'Send at' : 'First occurrence'}
                <input
                  type="datetime-local"
                  style={input}
                  value={scheduleForm.starts_at}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, starts_at: e.target.value }))}
                  required
                />
              </label>
              <label style={fieldLabel}>
                Timezone
                <ThemedSelect
                  value={scheduleForm.timezone}
                  onChange={(v) => setScheduleForm((f) => ({ ...f, timezone: v }))}
                  options={timezones.map((tz) => ({ value: tz, label: tz }))}
                  aria-label="Timezone"
                />
              </label>
            </div>

            <div style={formActions}>
              <button type="submit" style={primaryButton} disabled={busy === 'schedule-save'}>
                {editingScheduleId ? 'Save changes' : 'Create schedule'}
              </button>
              <button
                type="button"
                style={ghostButton}
                onClick={sendFormAsTest}
                disabled={busy === 'schedule-test'}
                title="Delivers the title/body above only to your own subscribed browsers."
              >
                Send test to me
              </button>
            </div>
          </form>

          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Notification</th>
                  <th style={th}>Destination</th>
                  <th style={th}>Frequency</th>
                  <th style={th}>Next run</th>
                  <th style={th}>Last run</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 && (
                  <tr>
                    <td style={{ ...td, color: 'var(--ed-fg-muted)' }} colSpan={6}>
                      No scheduled notifications yet.
                    </td>
                  </tr>
                )}
                {schedules.map((s) => {
                  const rowBusy = busy === `schedule-${s.id}`
                  return (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--ed-rule)' }}>
                      <td style={td}>
                        <div style={{ ...emailStyle, opacity: s.enabled ? 1 : 0.5 }}>{s.title}</div>
                        <div style={subStyle}>{s.body}</div>
                        {s.url && <div style={subStyle}>→ {s.url}</div>}
                      </td>
                      <td style={td}>
                        <div>{DESTINATION_OPTIONS.find((o) => o.value === s.destination)?.label}</div>
                        {s.category_filter && <div style={subStyle}>filter: {s.category_filter}</div>}
                      </td>
                      <td style={td}>
                        <div>{s.frequency}</div>
                        <div style={subStyle}>{s.timezone}</div>
                      </td>
                      <td style={td}>
                        {s.enabled ? formatInZone(s.next_run_at, s.timezone) : 'paused'}
                      </td>
                      <td style={td}>
                        <div>{formatInZone(s.last_run_at, s.timezone)}</div>
                        {s.last_status && (
                          <div style={subStyle}>
                            {s.last_status}
                            {s.last_web_sent != null || s.last_fcm_sent != null
                              ? ` — web ${s.last_web_sent ?? 0} / mobile ${s.last_fcm_sent ?? 0}`
                              : ''}
                          </div>
                        )}
                        {s.last_error && <div style={{ ...subStyle, color: '#b91c1c' }}>{s.last_error}</div>}
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={actionCol}>
                          <button
                            type="button"
                            style={ghostButton}
                            disabled={rowBusy}
                            onClick={() => startEditSchedule(s)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={ghostButton}
                            disabled={rowBusy}
                            onClick={() => toggleScheduleEnabled(s)}
                          >
                            {s.enabled ? 'Pause' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            style={ghostButton}
                            disabled={rowBusy}
                            onClick={() => sendScheduleNow(s)}
                          >
                            Send now
                          </button>
                          <button
                            type="button"
                            style={dangerButton}
                            disabled={rowBusy}
                            onClick={() => removeSchedule(s)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'zikr' && (
        <>
          <form onSubmit={submitZikr} style={formCard}>
            <div style={formTitleRow}>
              <h2 style={formTitle}>{editingZikrId ? `Edit zikr #${editingZikrId}` : 'New zikr'}</h2>
              {editingZikrId && (
                <button type="button" style={ghostButton} onClick={resetZikrForm}>
                  Cancel edit
                </button>
              )}
            </div>
            <div style={fieldGrid}>
              <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
                Text
                <input
                  style={input}
                  value={zikrText}
                  onChange={(e) => setZikrText(e.target.value)}
                  maxLength={90}
                  placeholder="Short reminder about God (max 90 characters)"
                  required
                />
              </label>
              <label style={fieldLabel}>
                Source (optional)
                <input
                  style={input}
                  value={zikrSource}
                  onChange={(e) => setZikrSource(e.target.value)}
                  placeholder="e.g. Quran 13:28"
                />
              </label>
              <label style={fieldLabel}>
                Language
                <input
                  style={input}
                  value={zikrLang}
                  onChange={(e) => setZikrLang(e.target.value)}
                  maxLength={8}
                />
              </label>
              <label style={fieldLabel}>
                Order weight
                <input
                  style={input}
                  type="number"
                  value={zikrWeight}
                  onChange={(e) => setZikrWeight(e.target.value)}
                />
              </label>
            </div>
            <div style={formActions}>
              <button type="submit" style={primaryButton} disabled={busy === 'zikr-save'}>
                {editingZikrId ? 'Save changes' : 'Add zikr'}
              </button>
            </div>
          </form>

          <div style={tableWrap}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Text</th>
                  <th style={th}>Lang</th>
                  <th style={th}>Weight</th>
                  <th style={th}>Active</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zikr.length === 0 && (
                  <tr>
                    <td style={{ ...td, color: 'var(--ed-fg-muted)' }} colSpan={5}>
                      No zikr entries yet. The mobile app falls back to its bundled list until
                      entries exist here.
                    </td>
                  </tr>
                )}
                {zikr.map((entry) => {
                  const rowBusy = busy === `zikr-${entry.id}`
                  return (
                    <tr key={entry.id} style={{ borderTop: '1px solid var(--ed-rule)' }}>
                      <td style={td}>
                        <div style={{ ...emailStyle, opacity: entry.active ? 1 : 0.5 }}>
                          {entry.text}
                        </div>
                        {entry.source && <div style={subStyle}>{entry.source}</div>}
                      </td>
                      <td style={td}>{entry.lang}</td>
                      <td style={td}>{entry.weight}</td>
                      <td style={td}>
                        <button
                          type="button"
                          style={entry.active ? buttonOn : buttonOff}
                          disabled={rowBusy}
                          onClick={() => toggleZikrActive(entry)}
                        >
                          {entry.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={actionCol}>
                          <button
                            type="button"
                            style={ghostButton}
                            disabled={rowBusy}
                            onClick={() => startEditZikr(entry)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={dangerButton}
                            disabled={rowBusy}
                            onClick={() => removeZikr(entry)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

const wrap: React.CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
}

const kicker: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  margin: 0,
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(40px, 6vw, 64px)',
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  margin: '6px 0 12px',
}

const lede: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 16,
  maxWidth: 560,
  lineHeight: 1.55,
}

const tabRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 20,
}

const tabBase: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  cursor: 'pointer',
}

const tabOn: React.CSSProperties = {
  ...tabBase,
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  borderColor: 'var(--ed-fg)',
}

const tabOff: React.CSSProperties = {
  ...tabBase,
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg)',
}

const errorStyle: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: 14,
  marginBottom: 16,
}

const noticeStyle: React.CSSProperties = {
  color: 'var(--ed-accent)',
  fontSize: 14,
  marginBottom: 16,
}

const formCard: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  background: 'var(--ed-surface)',
  padding: 20,
  marginBottom: 24,
}

const formTitleRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
}

const formTitle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 24,
  fontWeight: 500,
  margin: 0,
}

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14,
}

const fieldLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const input: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 14,
  color: 'var(--ed-fg)',
  background: 'var(--ed-bg)',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  fontFamily: 'inherit',
  textTransform: 'none',
  letterSpacing: 'normal',
}

const formActions: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 18,
}

const primaryButton: React.CSSProperties = {
  padding: '8px 18px',
  fontSize: 14,
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  border: '1px solid var(--ed-fg)',
  borderRadius: 2,
  cursor: 'pointer',
}

const ghostButton: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  background: 'transparent',
  color: 'var(--ed-fg)',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  cursor: 'pointer',
}

const dangerButton: React.CSSProperties = {
  ...ghostButton,
  color: '#b91c1c',
  borderColor: '#b91c1c55',
}

const tableWrap: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  overflowX: 'auto',
  background: 'var(--ed-surface)',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  fontWeight: 500,
}

const td: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'top',
}

const emailStyle: React.CSSProperties = {
  fontWeight: 500,
}

const subStyle: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 12.5,
  marginTop: 2,
}

const actionCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'stretch',
}

const buttonOn: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  background: 'var(--ed-accent)',
  color: 'var(--ed-bg)',
  border: '1px solid var(--ed-accent)',
  borderRadius: 2,
  cursor: 'pointer',
}

const buttonOff: React.CSSProperties = {
  ...ghostButton,
}
