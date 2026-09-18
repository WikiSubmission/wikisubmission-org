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

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

export function CollectionsMasterDetail({ initialId }: { initialId?: number }) {
  const t = useTranslations('meCollections')
  const tActions = useTranslations('actions')
  const collections = useCollections()
  const { mutate: del } = useDeleteCollection()
  const { mutate: create, isPending: creating } = useCreateCollection()
  const [selectedId, setSelectedId] = useState<number | null>(initialId ?? (collections[0]?.id ?? null))
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
        if (selectedId === id) {
          const remaining = collections.filter((c) => c.id !== id)
          setSelectedId(remaining[0]?.id ?? null)
        }
      },
    })
  }

  const isEmpty = collections.length === 0

  return (
    <div className="flex flex-col gap-6">
      {/* ── Masthead ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--ed-rule)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-2">
            <Library size={13} />
            <span>Sacred Library</span>
          </div>
          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            Verse Collections
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
            <span>{collections.length} {collections.length === 1 ? 'collection' : 'collections'}</span>
            <span className="opacity-40">·</span>
            <span>Thematic scripture studies</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="ed-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-[13.5px] shrink-0 self-start sm:self-auto cursor-pointer"
          style={{ fontFamily: F.serif }}
        >
          <Plus size={15} />
          <span>New Collection</span>
        </button>
      </div>

      {/* ── When Empty: Full Centered Card ── */}
      {isEmpty ? (
        <div className="rounded-[10px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-8 sm:p-12 text-center max-w-xl mx-auto w-full mt-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
            <Library size={22} />
          </div>

          <h3
            style={{ fontFamily: F.display }}
            className="m-0 text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            No collections yet
          </h3>

          <p
            style={{ fontFamily: F.serif }}
            className="mt-2 text-[14px] text-[var(--ed-fg-muted)] leading-relaxed"
          >
            Collections allow you to gather and organize related verses by topic, study questions, or spiritual reflections. You can keep them private or share them with fellow readers.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="ed-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[14px] cursor-pointer"
              style={{ fontFamily: F.serif }}
            >
              <Plus size={15} />
              <span>Create Your First Collection</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── Populated: Master-Detail Grid ── */
        <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-6 items-start">
          {/* Left Column: Collection List */}
          <div className="flex flex-col gap-2 rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-3">
            <span
              style={{ fontFamily: F.glacial }}
              className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ed-fg-muted)] px-2 py-1"
            >
              Your Collections ({collections.length})
            </span>
            <div className="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto">
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
          </div>

          {/* Right Column: Selected Collection Detail */}
          <div className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-6 sm:p-7 min-h-[400px]">
            {selectedId !== null ? (
              <CollectionDetailPane
                collectionId={selectedId}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-16 text-[var(--ed-fg-muted)]">
                <Library size={32} className="opacity-30 mb-2" />
                <p style={{ fontFamily: F.serif }} className="text-[14px]">
                  {t('selectToView')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create New Collection Dialog ── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-sm bg-[var(--ed-surface)] border-[var(--ed-rule)] text-[var(--ed-fg)]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: F.display }} className="text-2xl font-medium">
              {t('newCollection')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 my-2">
            <input
              autoFocus
              className="w-full rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-bg)] px-3 py-2 text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)] focus:outline-none focus:border-[var(--ed-accent)] transition-colors"
              placeholder={t('collectionName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <input
              className="w-full rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-bg)] px-3 py-2 text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)] focus:outline-none focus:border-[var(--ed-accent)] transition-colors"
              placeholder={t('descriptionOptional')}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewOpen(false)}
              className="border-[var(--ed-rule)] text-[var(--ed-fg)] hover:bg-[var(--ed-bg)]"
            >
              {tActions('cancel')}
            </Button>
            <button
              type="button"
              disabled={creating || !newName.trim()}
              onClick={handleCreate}
              className="ed-btn-primary px-4 py-1.5 text-[13px] disabled:opacity-50"
            >
              {tActions('create')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
