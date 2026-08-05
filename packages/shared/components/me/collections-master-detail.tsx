'use client'

import { useState } from 'react'
import { Library, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
} from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CollectionDetailPane } from '@/components/me/collection-detail-pane'
import type { CollectionData } from '@/types/collections'

function CollectionListItem({
  col,
  selected,
  onSelect,
  onDelete,
}: {
  col: CollectionData
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const tRow = useTranslations('meCollections')
  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-accent/30'
      }`}
      onClick={onSelect}
    >
      <Library className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{col.name}</p>
        {col.relation === 'subscriber' && col.owner_display_name ? (
          <p className="text-[11px] text-muted-foreground/70 truncate">
            {tRow('sharedBy', { name: col.owner_display_name })}
          </p>
        ) : col.description ? (
          <p className="text-[11px] text-muted-foreground/70 truncate">{col.description}</p>
        ) : null}
      </div>
      {col.relation === 'owner' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}

export function CollectionsMasterDetail({ initialId }: { initialId?: number }) {
  const t = useTranslations('meCollections')
  const tActions = useTranslations('actions')
  const tHeader = useTranslations('meHeader')
  const collections = useCollections()
  const { mutate: del } = useDeleteCollection()
  const { mutate: create, isPending: creating } = useCreateCollection()
  const [selectedId, setSelectedId] = useState<number | null>(initialId ?? null)
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  function handleCreate() {
    if (!newName.trim()) return
    create(
      { name: newName.trim(), description: newDesc.trim() },
      {
        onSuccess: (res) => {
          setNewOpen(false)
          setNewName('')
          setNewDesc('')
          if (res?.data?.id) setSelectedId(res.data.id)
        },
      },
    )
  }

  function handleDelete(id: number) {
    del(id, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null)
      },
    })
  }

  const isEmpty = collections.length === 0

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* List (mobile: always shown unless detail is active; desktop: always visible) */}
      <div
        className={`flex flex-col gap-3 lg:hidden ${selectedId !== null ? 'hidden' : ''}`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{tHeader('collections')}</h1>
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <Plus className="w-3.5 h-3.5 me-1.5" />
            {tActions('new')}
          </Button>
        </div>
        {isEmpty ? (
          <EmptyState onNew={() => setNewOpen(true)} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {collections.map((col) => (
              <CollectionListItem
                key={col.id}
                col={col}
                selected={col.id === selectedId}
                onSelect={() => setSelectedId(col.id)}
                onDelete={() => handleDelete(col.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile detail */}
      {selectedId !== null && (
        <div className="lg:hidden">
          <CollectionDetailPane
            collectionId={selectedId}
            onBack={() => setSelectedId(null)}
          />
        </div>
      )}

      {/* Desktop master-detail */}
      <div className="hidden lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {/* Left: list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{tHeader('collections')}</h1>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="w-3.5 h-3.5 me-1.5" />
              {tActions('new')}
            </Button>
          </div>
          {isEmpty ? (
            <EmptyState onNew={() => setNewOpen(true)} />
          ) : (
            <div className="flex flex-col gap-1.5">
              {collections.map((col) => (
                <CollectionListItem
                  key={col.id}
                  col={col}
                  selected={col.id === selectedId}
                  onSelect={() => setSelectedId(col.id)}
                  onDelete={() => handleDelete(col.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: detail */}
        <div className="border-s border-border ps-6">
          {selectedId !== null ? (
            <CollectionDetailPane collectionId={selectedId} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-16">
              <Library className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {t('selectToView')}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('newCollection')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t('collectionName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t('descriptionOptional')}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>
              {tActions('cancel')}
            </Button>
            <Button size="sm" disabled={creating || !newName.trim()} onClick={handleCreate}>
              {tActions('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  const tEmpty = useTranslations('meCollections')
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center rounded-xl border border-dashed border-border">
      <Library className="w-5 h-5 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{tEmpty('noneYet')}</p>
      <Button variant="outline" size="sm" onClick={onNew}>
        <Plus className="w-3.5 h-3.5 me-1.5" />
        {tEmpty('createOne')}
      </Button>
    </div>
  )
}
