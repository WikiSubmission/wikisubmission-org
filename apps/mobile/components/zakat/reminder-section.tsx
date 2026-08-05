'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellRing } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { ensureNotificationPermission } from '@/lib/notification-permission'
import { cancelZakatReminder, scheduleZakatReminder } from '@/lib/notifications/zakat'
import {
  DEFAULT_ZAKAT_TIME,
  daysUntil,
  nextDueDate,
  readZakatReminderPrefs,
  writeZakatReminderPrefs,
  type ZakatFrequency,
  type ZakatReminderPrefs,
} from '@/lib/zakat-reminder'
import { cn } from '@/lib/utils'

const FREQUENCIES: { value: ZakatFrequency; labelKey: string }[] = [
  { value: 'weekly', labelKey: 'weekly' },
  { value: 'biweekly', labelKey: 'biweekly' },
  { value: 'monthly', labelKey: 'monthly' },
]

function todayISO(): string {
  const now = new Date()
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Zakat reminder setup: cadence, first due date, and time of day. Device-local
 * (Preferences + local notifications) — works signed out, no backend involved.
 */
export function ZakatReminderSection() {
  const t = useTranslations('mobile.zakat.reminder')
  // The app locale, not the device locale — the two diverge as soon as the user
  // picks a UI language in settings.
  const locale = useLocale()
  const [enabled, setEnabled] = useState(false)
  const [frequency, setFrequency] = useState<ZakatFrequency>('monthly')
  const [anchor, setAnchor] = useState(todayISO)
  const [timeOfDay, setTimeOfDay] = useState(DEFAULT_ZAKAT_TIME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    readZakatReminderPrefs().then((stored) => {
      if (stored) {
        setEnabled(stored.enabled)
        setFrequency(stored.frequency)
        setAnchor(stored.anchor)
        setTimeOfDay(stored.timeOfDay)
      }
      setLoading(false)
    })
  }, [])

  const preview = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(anchor) || !/^\d{2}:\d{2}$/.test(timeOfDay)) return null
    const prefs: ZakatReminderPrefs = { version: 1, enabled: true, frequency, anchor, timeOfDay }
    const next = nextDueDate(prefs)
    return { next, days: daysUntil(next) }
  }, [anchor, frequency, timeOfDay])

  async function save() {
    if (!preview) {
      toast.error(t('invalidDate'))
      return
    }
    setSaving(true)
    try {
      const granted = await ensureNotificationPermission({ force: true })
      if (!granted) {
        toast.error(t('blocked'))
        return
      }
      const prefs: ZakatReminderPrefs = { version: 1, enabled: true, frequency, anchor, timeOfDay }
      await writeZakatReminderPrefs(prefs)
      await scheduleZakatReminder(prefs)
      setEnabled(true)
      toast.success(t('saved'))
    } finally {
      setSaving(false)
    }
  }

  async function disable() {
    setSaving(true)
    try {
      await writeZakatReminderPrefs({ version: 1, enabled: false, frequency, anchor, timeOfDay })
      await cancelZakatReminder()
      setEnabled(false)
      toast(t('turnedOff'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className={cn(
        'border-border/50 bg-background/55 rounded-2xl border p-5 backdrop-blur-md',
        loading && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="text-primary size-4" aria-hidden="true" />
          <h2 className="text-foreground text-sm font-semibold">{t('heading')}</h2>
        </div>
        <Switch
          checked={enabled}
          disabled={saving}
          onCheckedChange={(on) => void (on ? save() : disable())}
          aria-label={t('toggleLabel')}
        />
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{t('body')}</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-widest uppercase">
            {t('howOften')}
          </p>
          <div className="border-border/50 grid grid-cols-3 overflow-hidden rounded-full border text-xs">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                className={cn(
                  'py-2 transition-colors',
                  frequency === f.value
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-muted-foreground mb-2 block text-[10px] font-medium tracking-widest uppercase">
              {t(frequency === 'monthly' ? 'dueDate' : 'firstDueDay')}
            </span>
            <input
              type="date"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              className="border-border/50 bg-background/70 text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-muted-foreground mb-2 block text-[10px] font-medium tracking-widest uppercase">
              {t('time')}
            </span>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="border-border/50 bg-background/70 text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
        </div>

        {frequency === 'monthly' && Number.parseInt(anchor.slice(8, 10), 10) > 28 && (
          <p className="text-muted-foreground text-xs">{t('shortMonthNote')}</p>
        )}

        {preview && (
          <div className="border-border/40 flex items-baseline justify-between border-t pt-3">
            <span className="text-muted-foreground text-xs">{t('nextDue')}</span>
            <span className="text-foreground text-sm">
              {preview.next.toLocaleDateString(locale, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              <span className="text-muted-foreground">
                {' '}
                · {preview.days <= 0 ? t('dueToday') : t('dueInDays', { days: preview.days })}
              </span>
            </span>
          </div>
        )}

        {enabled && (
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="text-primary text-sm font-medium"
          >
            {t('saveChanges')}
          </button>
        )}
      </div>
    </section>
  )
}
