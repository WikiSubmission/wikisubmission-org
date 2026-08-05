'use client'

import { ZakatCalculator } from '@/components/zakat-calculator'
import { ZakatReminderSection } from '@/components/zakat/reminder-section'

/**
 * Zakat screen: reminder setup on top (the reason most visitors arrive, via
 * the Today-screen countdown chip), the shared 2.5% calculator below.
 */
export function ZakatScreen() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-6">
      <ZakatReminderSection />
      <ZakatCalculator />
    </div>
  )
}
