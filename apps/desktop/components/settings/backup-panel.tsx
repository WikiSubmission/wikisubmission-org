'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'

type Status = { kind: 'idle' } | { kind: 'busy'; label: string } | { kind: 'ok' | 'error'; message: string }

const api = (path: string) => `${resolveBrowserApiBaseUrl()}/desktop/${path}`

/**
 * Save and restore the local user's data. The host adds the access token, so
 * these are plain same-origin requests. The backup downloads as a file (the
 * shell shows a save dialog); restore reads a file the user picks.
 */
export function BackupPanel() {
  const t = useTranslations('desktopSettings')
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const busy = status.kind === 'busy'

  async function saveBackup() {
    setStatus({ kind: 'busy', label: t('backupSaving') })
    try {
      const res = await fetch(api('backup'))
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      const name =
        /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ??
        'wikisubmission-backup.json'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
      setStatus({ kind: 'ok', message: t('backupSaved') })
    } catch {
      setStatus({ kind: 'error', message: t('backupFailed') })
    }
  }

  async function restoreFrom(file: File) {
    if (!window.confirm(t('restoreConfirm'))) return
    setStatus({ kind: 'busy', label: t('restoring') })
    try {
      const res = await fetch(api('restore'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: await file.text(),
      })
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { restored?: Record<string, number> }
      const count = Object.values(body.restored ?? {}).reduce((sum, n) => sum + n, 0)
      // Everything personal may have changed.
      await queryClient.invalidateQueries()
      setStatus({ kind: 'ok', message: t('restoreDone', { count }) })
    } catch {
      setStatus({ kind: 'error', message: t('restoreFailed') })
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">{t('backupTitle')}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">{t('backupBody')}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={saveBackup} disabled={busy}>
          {t('backupSave')}
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={busy}>
          {t('restoreButton')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void restoreFrom(file)
          }}
        />
      </div>
      <p
        role="status"
        className={
          status.kind === 'error' ? 'text-destructive text-sm' : 'text-muted-foreground text-sm'
        }
      >
        {status.kind === 'busy' ? status.label : status.kind === 'idle' ? '' : status.message}
      </p>
    </section>
  )
}
