'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  BookOpen,
  Download,
  Eye,
  Globe,
  Lock,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import {
  useCollectionDetail,
  useRemoveVerseFromCollection,
  useUnsubscribeCollection,
  useUpdateCollection,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { meApi } from '@/src/api/me-client'
import { toast } from 'sonner'
import { AddFromReferencesDialog } from '@/components/me/add-from-references-dialog'
import { AddFromCategoryDialog } from '@/components/me/add-from-category-dialog'

// ── Sync-to-bookmarks dialog ──────────────────────────────────────────────

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
  const t = useTranslations('meCollections')
  const tActions = useTranslations('actions')
  const categories = useBookmarkCategories()
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('syncToCategory')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          All verses in this collection will be added to the selected category.
          Duplicates are ignored.
        </p>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No bookmark categories yet.{' '}
            <Link href="/me/bookmarks" className="text-primary hover:underline">
              {t('createOneFirst')}
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelected(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors text-start ${
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
            {tActions('cancel')}
          </Button>
          <Button
            size="sm"
            disabled={selected === null || syncing || categories.length === 0}
            onClick={() => selected !== null && onSync(selected)}
          >
            {tActions('sync')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Visibility dropdown (owner only) ─────────────────────────────────────

type VisibilityOption = 'private' | 'public_owner' | 'public_everyone'

function currentVisibility(isPublic: boolean, editPolicy: string): VisibilityOption {
  if (!isPublic) return 'private'
  return editPolicy === 'everyone' ? 'public_everyone' : 'public_owner'
}

function VisibilityDropdown({
  collectionId,
  name,
  description,
  isPublic,
  editPolicy,
}: {
  collectionId: number
  name: string
  description: string
  isPublic: boolean
  editPolicy: string
}) {
  const t = useTranslations('meCollections')
  const { mutate: update, isPending } = useUpdateCollection()
  const current = currentVisibility(isPublic, editPolicy)

  function choose(opt: VisibilityOption) {
    if (opt === current) return
    const base = { id: collectionId, name, description }
    if (opt === 'private') {
      update({ ...base, is_public: false })
    } else if (opt === 'public_owner') {
      update({ ...base, is_public: true, edit_policy: 'owner_only' })
    } else {
      update({ ...base, is_public: true, edit_policy: 'everyone' })
    }
  }

  const Icon = isPublic ? Globe : Lock

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending} className="gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {isPublic ? t(editPolicy === 'everyone' ? 'anyoneEdits' : 'public') : t('private')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t('visibility')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => choose('private')}
          className={current === 'private' ? 'font-medium' : ''}
        >
          <Lock className="w-4 h-4 me-2" />
          {t('private')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => choose('public_owner')}
          className={current === 'public_owner' ? 'font-medium' : ''}
        >
          <Globe className="w-4 h-4 me-2" />
          {t('publicOnlyYouEdit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => choose('public_everyone')}
          className={current === 'public_everyone' ? 'font-medium' : ''}
        >
          <Users className="w-4 h-4 me-2" />
          {t('publicAnyoneEdits')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Main pane ─────────────────────────────────────────────────────────────

export function CollectionDetailPane({
  collectionId,
  onBack,
}: {
  collectionId: number
  onBack?: () => void
}) {
  const t = useTranslations('meCollections')
  const tCommon = useTranslations('common')
  const { data, isLoading } = useCollectionDetail(collectionId)
  const { mutate: removeVerse } = useRemoveVerseFromCollection()
  const { mutate: unsubscribe } = useUnsubscribeCollection()
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [addRefsOpen, setAddRefsOpen] = useState(false)
  const [addCatOpen, setAddCatOpen] = useState(false)

  const col = data?.data
  const existingKeys = useMemo(
    () => new Set((col?.verses ?? []).map((v) => v.verse_key)),
    [col?.verses],
  )

  const canEdit =
    col?.relation === 'owner' ||
    (col?.is_public === true && col?.edit_policy === 'everyone')

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
      toast.success(t('versesSynced', { count: added }))
    } else {
      toast.warning(`${added} synced, ${failed} skipped (already bookmarked)`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        {tCommon('loading')}
      </div>
    )
  }

  if (!col) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-muted-foreground text-center">
        <p>{t('notFound')}</p>
      </div>
    )
  }

  function copyShareLink() {
    if (!col?.share_token) return
    const url = `${window.location.origin}/collections/${col.share_token}`
    navigator.clipboard.writeText(url)
    toast.success(t('shareLinkCopied'))
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Mobile back */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          ← All collections
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold truncate">{col.name}</h2>
            {col.relation === 'subscriber' && !canEdit && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                <Eye className="w-3 h-3" />
                {t('readOnly')}
              </span>
            )}
          </div>
          {col.description && (
            <p className="text-sm text-muted-foreground">{col.description}</p>
          )}
          {col.relation === 'subscriber' && col.owner_display_name && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Shared by {col.owner_display_name}
            </p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {col.verses.length} {col.verses.length === 1 ? 'verse' : 'verses'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {col.relation === 'owner' && (
            <VisibilityDropdown
              collectionId={col.id}
              name={col.name}
              description={col.description}
              isPublic={col.is_public}
              editPolicy={col.edit_policy}
            />
          )}
          {col.is_public && col.share_token && (
            <Button variant="ghost" size="sm" onClick={copyShareLink} className="gap-1.5">
              {t('shareLink')}
            </Button>
          )}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-3.5 h-3.5 me-1.5" />
                  {t('addVerses')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem onSelect={() => setAddRefsOpen(true)}>
                  <BookOpen className="w-4 h-4" />
                  {t('fromReferences')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setAddCatOpen(true)}>
                  <Download className="w-4 h-4" />
                  {t('fromBookmarkCategory')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {col.verses.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSyncOpen(true)}>
              <Download className="w-3.5 h-3.5 me-1.5" />
              {t('syncToBookmarks')}
            </Button>
          )}
        </div>
      </div>

      {/* Verses */}
      {col.verses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            {canEdit
              ? t('noVersesYet')
              : t('emptyCollection')}
          </p>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setAddRefsOpen(true)}>
                <BookOpen className="w-3.5 h-3.5 me-1.5" />
                {t('fromReferences')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAddCatOpen(true)}>
                <Download className="w-3.5 h-3.5 me-1.5" />
                {t('fromCategory')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
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
                    <p className="text-xs text-muted-foreground truncate">{v.note}</p>
                  )}
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                    {v.scripture}
                  </p>
                </Link>
                {canEdit && (
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
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Subscriber action */}
      {col.relation === 'subscriber' && (
        <div className="pt-2 border-t border-border mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive text-xs"
            onClick={() => {
              unsubscribe(collectionId, {
                onSuccess: () => toast.success(t('removedFromMine')),
              })
            }}
          >
            {t('removeFromMine')}
          </Button>
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
