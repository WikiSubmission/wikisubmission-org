'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { setQuranReferenceVersionAction } from './actions'

export function ReferenceVersionPicker({
  versions,
  initialVersionId,
}: {
  versions: Array<{ id: number; name: string }>
  initialVersionId: number | null
}) {
  const router = useRouter()
  const [value, setValue] = useState(
    initialVersionId === null ? '' : String(initialVersionId)
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="mb-6 rounded-[3px] border border-border bg-card p-4">
      <label className="block font-[family-name:var(--font-cormorant)] text-[21px]">
        Word-by-word reference
      </label>
      <p className="mt-1 mb-3 text-[13px] leading-relaxed text-muted-foreground">
        Your personal reference version is shown beside word-by-word editing. It
        does not change anyone else’s workspace.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value}
          disabled={pending}
          onChange={(event) => setValue(event.target.value)}
          className="h-9 min-w-[240px] rounded-[2px] border border-input bg-background px-3 text-[14px]"
        >
          <option value="">No reference version</option>
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          disabled={
            pending ||
            value ===
              (initialVersionId === null ? '' : String(initialVersionId))
          }
          onClick={() =>
            startTransition(async () => {
              setError(null)
              const result = await setQuranReferenceVersionAction(
                value === '' ? null : Number(value)
              )
              if (!result.ok) {
                setError(result.error)
                return
              }
              router.refresh()
            })
          }
        >
          {pending ? 'Saving…' : 'Save reference'}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}
