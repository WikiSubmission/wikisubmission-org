'use client'

import { Download, Wifi } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

/** Download-phase message keys under `mobile.reader`. */
const PHASE_KEYS: Record<string, string> = {
  download: 'wordBundleDownloading',
  verify: 'wordBundleVerifying',
  import: 'wordBundlePreparing',
}

/**
 * Bottom sheet shown when word mode is enabled before the word-by-word bundle
 * is on device. Reflects the background download's live state; on cellular it
 * explains the Wi-Fi deferral and offers an immediate download.
 */
export function WordBundleSheet({ open, onOpenChange }: WordBundleSheetProps) {
  const t = useTranslations('mobile.reader')
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
          <SheetTitle>{t('wordBundleTitle')}</SheetTitle>
          <SheetDescription>{t('wordBundleBody', { size: sizeLabel })}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-2 pt-3">
          {status === 'downloading' && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{t(PHASE_KEYS[progress?.phase ?? 'download'] ?? 'wordBundleDownloading')}…</span>
                {percent !== null && <span>{percent}%</span>}
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${percent ?? 8}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {t(online ? 'wordBundleWorksMeanwhile' : 'wordBundleInProgress')}
              </p>
            </div>
          )}

          {status === 'installed' && (
            <p className="text-muted-foreground text-sm">{t('wordBundleReady')}</p>
          )}

          {status === 'checking' && (
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              <p className="text-muted-foreground text-sm">{t('wordBundleChecking')}</p>
            </div>
          )}

          {(status === 'waiting-wifi' || status === 'failed' || status === 'idle') && (
            <div className="space-y-3">
              <div className="text-muted-foreground flex items-start gap-3 text-sm">
                <Wifi className="mt-0.5 size-4 shrink-0" />
                <p>{t(online ? 'wordBundleWifiOnline' : 'wordBundleWifiOffline')}</p>
              </div>
              {online && bundle && (
                <Button
                  className="w-full"
                  onClick={() => {
                    void installWordBundle()
                  }}
                >
                  <Download className="size-4" />
                  {t('wordBundleDownloadNow', { size: sizeLabel })}
                </Button>
              )}
            </div>
          )}

          {status === 'unavailable' && (
            <p className="text-muted-foreground text-sm">{t('wordBundleUnavailable')}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
