'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Download, Plus, Trash2 } from 'lucide-react'
import {
  useCollectionDetail,
  useRemoveVerseFromCollection,
} from '@/hooks/use-collections'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { meApi } from '@/src/api/me-client'
import { toast } from 'sonner'
import { AddFromReferencesDialog } from '@/components/me/add-from-references-dialog'
import { AddFromCategoryDialog } from '@/components/me/add-from-category-dialog'

function SyncDialog({
  open,
  onOpenChange,
  onSync,
  syncing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSync: (categoryId: number) => void
  syncing: boolean
}) {
  const categories = useBookmarkCategories()
  const [selected, setSelected] = useState<number | null>(null)

  function handleConfirm() {
    if (selected === null) return
    onSync(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sync to bookmark category</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          All verses in this collection will be added to the selected category.
          Duplicates are ignored.
        </p>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No bookmark categories yet.{' '}
            <Link href="/me/bookmarks" className="text-primary hover:underline">
              Create one first.
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelected(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                  selected === cat.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/30'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="flex-1 truncate font-medium">{cat.name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {cat.entry_count} verses
                </span>
              </button>
            ))}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={selected === null || syncing || categories.length === 0}
            onClick={handleConfirm}
          >
            Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const collectionId = parseInt(id, 10)
  const { data, isLoading } = useCollectionDetail(collectionId)
  const { mutate: removeVerse } = useRemoveVerseFromCollection()
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [addRefsOpen, setAddRefsOpen] = useState(false)
  const [addCatOpen, setAddCatOpen] = useState(false)
  const existingKeys = useMemo(
    () => new Set((data?.data?.verses ?? []).map((v) => v.verse_key)),
    [data?.data?.verses],
  )

  async function handleSync(categoryId: number) {
    if (!col) return
    setSyncing(true)
    let added = 0
    let failed = 0
    for (const v of col.verses) {
      try {
        await meApi.createBookmarkEntry({
          category_id: categoryId,
          scripture: v.scripture,
          verse_key: v.verse_key,
        })
        added++
      } catch {
        failed++
      }
    }
    setSyncing(false)
    setSyncOpen(false)
    if (failed === 0) {
      toast.success(`${added} verse${added !== 1 ? 's' : ''} synced to category`)
    } else {
      toast.warning(`${added} synced, ${failed} skipped (already bookmarked)`)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  const col = data?.data

  if (!col) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-sm text-muted-foreground">
        Collection not found.
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <Link
        href="/me/collections"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All collections
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl font-semibold">{col.name}</h1>
          {col.description && (
            <p className="text-sm text-muted-foreground">{col.description}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {col.verses.length} {col.verses.length === 1 ? 'verse' : 'verses'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add verses
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem onSelect={() => setAddRefsOpen(true)}>
                <BookOpen className="w-4 h-4" />
                From references
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAddCatOpen(true)}>
                <Download className="w-4 h-4" />
                From bookmark category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {col.verses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncOpen(true)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Sync to bookmarks
            </Button>
          )}
        </div>
      </div>

      {col.verses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No verses yet. Add from references or a bookmark category.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddRefsOpen(true)}>
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              From references
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddCatOpen(true)}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              From category
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {col.verses.map((v) => {
            const [chapter, verse] = v.verse_key.split(':')
            const href =
              v.scripture === 'quran'
                ? `/quran/${chapter}?verse=${verse}`
                : `/bible/${v.verse_key}`
            return (
              <div
                key={v.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors"
              >
                <Link href={href} className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-mono">{v.verse_key}</p>
                  {v.note && (
                    <p className="text-xs text-muted-foreground truncate">
                      {v.note}
                    </p>
                  )}
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    {v.scripture}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    removeVerse({ collectionId: collectionId, verseId: v.id })
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <SyncDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        onSync={handleSync}
        syncing={syncing}
      />
      <AddFromReferencesDialog
        collectionId={collectionId}
        existingKeys={existingKeys}
        open={addRefsOpen}
        onOpenChange={setAddRefsOpen}
      />
      <AddFromCategoryDialog
        collectionId={collectionId}
        existingKeys={existingKeys}
        open={addCatOpen}
        onOpenChange={setAddCatOpen}
      />
    </div>
  )
}
