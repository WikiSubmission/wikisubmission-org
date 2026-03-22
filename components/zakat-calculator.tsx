'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ZakatCalculator() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  const parsed = parseFloat(amount.replace(/,/g, ''))
  const zakatDue = isNaN(parsed) || parsed <= 0 ? null : parsed * 0.025
  const isSmall = zakatDue !== null && zakatDue < 1

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Heading */}
      <div>
        <h2 className="font-headline text-2xl font-bold">Zakat Calculator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Based on the Quran: 2.5% of income is owed the moment you receive it —
          no waiting period, no minimum threshold.
        </p>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="h-12 rounded-lg border border-border bg-muted/50 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'TRY'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Amount received"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 h-12 rounded-lg border border-border bg-muted/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </div>

      {/* Result */}
      {zakatDue !== null && (
        <div
          className={cn(
            'rounded-xl p-6 space-y-2 border',
            isSmall
              ? 'bg-muted/50 border-border'
              : 'bg-primary/5 border-primary/20'
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Zakat due now
          </p>
          <p className="font-headline text-4xl font-extrabold text-primary">
            {currency}{' '}
            {zakatDue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            2.5% of {currency}{' '}
            {parsed.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          {isSmall && (
            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Recommendation</p>
              <p>
                This amount is very small. We recommend collecting your Zakat
                over several payments and giving it all at once — or better yet,
                giving it preemptively before you receive the income if you are
                able to.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Guidance */}
      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
        <p>
          <span className="font-semibold text-foreground">How this works:</span>{' '}
          When you receive income, 2.5% belongs to those in need — give it
          immediately or as soon as possible. There is no nisab (minimum
          threshold) and no annual cycle in this understanding.
        </p>
      </div>
    </div>
  )
}
