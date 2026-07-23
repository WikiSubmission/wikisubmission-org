'use client'

import { Download, Wifi } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  installWordBundle,
  useWordBundleDownload,
} from '@/hooks/use-word-bundle-download'

interface WordBundleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatMb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1_000_000))} MB`
}

const PHASE_LABELS: Record<string, string> = {
  download: 'Downloading',
  verify: 'Verifying',
  import: 'Preparing',
}

/**
 * Bottom sheet shown when word mode is enabled before the word-by-word bundle
 * is on device. Reflects the background download's live state; on cellular it
 * explains the Wi-Fi deferral and offers an immediate download.
 */
export function WordBundleSheet({ open, onOpenChange }: WordBundleSheetProps) {
  const { status, bundle, progress } = useWordBundleDownload()
  const online = typeof navigator === 'undefined' || navigator.onLine !== false
  const sizeLabel = bundle ? formatMb(bundle.bytes) : '~24 MB'

  const percent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.received / progress.total) * 100))
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <SheetHeader className="pb-0 text-left">
          <SheetTitle>Word-by-word data</SheetTitle>
          <SheetDescription>
            The word-by-word breakdown ({sizeLabel}) is stored on your device so
            it also works offline.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-2 pt-3">
          {status === 'downloading' && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{PHASE_LABELS[progress?.phase ?? 'download'] ?? 'Downloading'}…</span>
                {percent !== null && <span>{percent}%</span>}
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${percent ?? 8}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {online
                  ? 'Word mode already works while this finishes.'
                  : 'Download in progress.'}
              </p>
            </div>
          )}

          {status === 'installed' && (
            <p className="text-muted-foreground text-sm">
              Word-by-word data is ready — it now works offline too.
            </p>
          )}

          {status === 'checking' && (
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              <p className="text-muted-foreground text-sm">Checking downloads…</p>
            </div>
          )}

          {(status === 'waiting-wifi' || status === 'failed' || status === 'idle') && (
            <div className="space-y-3">
              <div className="text-muted-foreground flex items-start gap-3 text-sm">
                <Wifi className="mt-0.5 size-4 shrink-0" />
                <p>
                  {online
                    ? `It will download automatically next time you're on Wi-Fi. Until then, word mode needs a connection.`
                    : `You're offline. It will download automatically next time you're online over Wi-Fi.`}
                </p>
              </div>
              {online && bundle && (
                <Button
                  className="w-full"
                  onClick={() => {
                    void installWordBundle()
                  }}
                >
                  <Download className="size-4" />
                  Download now ({sizeLabel})
                </Button>
              )}
            </div>
          )}

          {status === 'unavailable' && (
            <p className="text-muted-foreground text-sm">
              No offline word-by-word data is published for your language yet —
              word mode uses the network.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
