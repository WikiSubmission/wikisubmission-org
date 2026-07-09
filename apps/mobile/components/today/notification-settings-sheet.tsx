'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NotificationPreferencesList } from '@/components/notification-preferences-list'

interface NotificationSettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Bottom sheet opened from the bell on the prayer card. */
export function NotificationSettingsSheet({ open, onOpenChange }: NotificationSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] overflow-y-auto rounded-t-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <SheetHeader className="pb-0 text-left">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Prayer reminders are scheduled on this device for your location.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-2">
          <NotificationPreferencesList />
        </div>
      </SheetContent>
    </Sheet>
  )
}
