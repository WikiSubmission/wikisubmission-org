'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Library, Plus, Trash2, Share2, Lock } from 'lucide-react'
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useUpdateCollection,
} from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CollectionData } from '@/types/collections'

function CollectionCard({
  col,
  onDelete,
  onTogglePublic,
}: {
  col: CollectionData
  onDelete: () => void
  onTogglePublic: () => void
}) {
  const shareUrl = col.share_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/collections/${col.share_token}`
    : null

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
      <Library className="w-4 h-4 shrink-0 text-muted-foreground" />
      <Link href={`/me/collections/${col.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{col.name}</p>
        {col.description && (
          <p className="text-xs text-muted-foreground truncate">{col.description}</p>
        )}
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        {shareUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            title="Copy share link"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${col.is_public ? 'text-primary' : 'text-muted-foreground'}`}
          title={col.is_public ? 'Make private' : 'Make public'}
          onClick={onTogglePublic}
        >
          {col.is_public ? <Share2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const collections = useCollections()
  const { mutate: create, isPending: creating } = useCreateCollection()
  const { mutate: del } = useDeleteCollection()
  const { mutate: update } = useUpdateCollection()
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPublic, setNewPublic] = useState(false)

  function handleCreate() {
    if (!newName.trim()) return
    create(
      { name: newName.trim(), description: newDesc.trim(), is_public: newPublic },
      {
        onSuccess: () => {
          setNewOpen(false)
          setNewName('')
          setNewDesc('')
          setNewPublic(false)
        },
      }
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Collections</h1>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> New
        </Button>
      </div>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              col={col}
              onDelete={() => del(col.id)}
              onTogglePublic={() =>
                update({
                  id: col.id,
                  name: col.name,
                  description: col.description,
                  is_public: !col.is_public,
                  regenerate_token: !col.is_public,
                })
              }
            />
          ))}
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Collection</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newPublic}
                onChange={(e) => setNewPublic(e.target.checked)}
                className="rounded"
              />
              Make public (creates share link)
            </label>
            <Button disabled={creating || !newName.trim()} onClick={handleCreate}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
