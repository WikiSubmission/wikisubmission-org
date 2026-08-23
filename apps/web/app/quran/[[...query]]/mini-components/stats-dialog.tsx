'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import StatsScreen from '@/components/me/stats-screen'

/**
 * Reading stats in a dialog, opened from the "Your study" band on /quran.
 *
 * Wraps the same StatsScreen that /me/stats renders, so the numbers, tabs and
 * ranges stay identical wherever the reader opens them. The dialog is wide and
 * scrolls internally: the charts need the room, and the screen is taller than a
 * viewport once every card is laid out.
 */
export function StatsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Reading stats</DialogTitle>
        </DialogHeader>
        <div className="px-5 py-6 sm:px-8">
          <StatsScreen />
        </div>
      </DialogContent>
    </Dialog>
  )
}
