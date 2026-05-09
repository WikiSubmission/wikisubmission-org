'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Library, Lock, Plus, Share2, Trash2 } from 'lucide-react'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CollectionData } from '@/types/collections'
import { toast } from 'sonner'

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

  function copyShare() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied')
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
      <Library className="w-4 h-4 shrink-0 text-muted-foreground" />
      <Link href={`/me/collections/${col.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{col.name}</p>
        {col.description && (
          <p className="text-xs text-muted-foreground truncate">
            {col.description}
          </p>
        )}
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        {shareUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            title="Copy share link"
            onClick={copyShare}
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
          {col.is_public ? (
            <Share2 className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
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
      {
        name: newName.trim(),
        description: newDesc.trim(),
        is_public: newPublic,
      },
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
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to profile
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Collections</h1>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-2">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          What are collections?
        </h2>
        <p className="text-sm text-muted-foreground/90 leading-relaxed">
          A collection is a curated series of verses you assemble around a
          theme, then share with anyone via a public link. Bookmarks are{' '}
          <span className="text-foreground">private to you</span>; collections
          are <span className="text-foreground">made for sharing</span>.
        </p>
        <ul className="text-xs text-muted-foreground/80 list-disc list-inside space-y-1 pt-1">
          <li>
            Add verses from the reader (any verse card has an &ldquo;add to
            collection&rdquo; action).
          </li>
          <li>
            Toggle <span className="text-foreground">public</span> to generate a
            share link, or keep it private as a draft.
          </li>
          <li>
            Open a collection to export its verses into one of your bookmark
            categories.
          </li>
        </ul>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center rounded-xl border border-dashed border-border">
          <Library className="w-6 h-6 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground max-w-xs">
            No collections yet. Build your first one.
          </p>
        </div>
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
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
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
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={creating || !newName.trim()}
              onClick={handleCreate}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
