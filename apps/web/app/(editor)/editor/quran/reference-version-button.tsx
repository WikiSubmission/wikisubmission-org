'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/editor/content/combobox'
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
        Your reference translation
      </label>
      <p className="mt-1 mb-3 text-[13px] leading-relaxed text-muted-foreground">
        Pick a translation to show alongside your own while you edit. This is
        just for you — nobody else’s workspace changes.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Combobox
          value={value}
          options={versions.map((version) => ({
            value: String(version.id),
            label: version.name,
          }))}
          placeholder="Don’t show one"
          ariaLabel="Reference translation"
          disabled={pending}
          onChange={setValue}
          className="w-full sm:w-[260px]"
        />
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
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}
