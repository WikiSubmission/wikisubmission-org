'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { useCreateBookmarkCategory } from '@/hooks/use-bookmark-categories'

const PALETTE = [
  { nameKey: 'colorAmber', value: '#f59e0b' },
  { nameKey: 'colorRose', value: '#f43f5e' },
  { nameKey: 'colorViolet', value: '#8b5cf6' },
  { nameKey: 'colorSky', value: '#0ea5e9' },
  { nameKey: 'colorEmerald', value: '#10b981' },
  { nameKey: 'colorSlate', value: '#64748b' },
]

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.55)
  return `#${[r, g, b].map(mix).map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: (id: number) => void
}) {
  const t = useTranslations('meBookmarks')
  const tActions = useTranslations('actions')
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0].value)
  const { mutate: create, isPending } = useCreateBookmarkCategory()

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    create(
      { name: trimmed, color },
      {
        onSuccess: (res) => {
          setName('')
          setColor(PALETTE[0].value)
          onOpenChange(false)
          onCreated?.(res.data.id)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('newCategory')}</DialogTitle>
          <DialogDescription>
            {t('newCategoryHint')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {tActions('name')}
            </label>
            <input
              autoFocus
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) handleCreate()
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {tActions('color')}
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={t(c.nameKey)}
                    onClick={() => setColor(c.value)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      color === c.value
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ background: c.value }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => {
                  const light = lighten(c.value)
                  return (
                    <button
                      key={light}
                      type="button"
                      aria-label={`${t(c.nameKey)} light`}
                      onClick={() => setColor(light)}
                      className={`h-7 w-7 rounded-full transition-all ${
                        color === light
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ background: light }}
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-muted-foreground" htmlFor="cat-color-picker">
                  {tActions('custom')}
                </label>
                <input
                  id="cat-color-picker"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-border bg-background p-0.5"
                />
                <span className="font-mono text-[11px] text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {tActions('cancel')}
          </Button>
          <Button
            size="sm"
            disabled={isPending || !name.trim()}
            onClick={handleCreate}
          >
            {tActions('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
