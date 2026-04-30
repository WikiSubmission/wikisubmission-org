'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ZakatCalculator() {
  const t = useTranslations('zakatCalculator')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  const parsed = parseFloat(amount.replace(/,/g, ''))
  const zakatDue = isNaN(parsed) || parsed <= 0 ? null : parsed * 0.025
  const isSmall = zakatDue !== null && zakatDue < 1

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10">
      {/* Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[var(--ed-accent)]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--ed-fg-muted)] opacity-40">
            {t('moduleLabel')}
          </span>
        </div>
        <h2 className="text-3xl font-serif font-medium text-[var(--ed-fg)]">
          {t('title')}
        </h2>
        <p className="text-sm text-[var(--ed-fg-muted)] leading-relaxed opacity-70">
          {t('description')}
        </p>
      </div>

      {/* Input row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <label className="block font-mono text-[8px] uppercase tracking-widest text-[var(--ed-fg-muted)] mb-2 opacity-50">
            {t('currency')}
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-12 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ed-accent)]/20 transition-all appearance-none"
          >
            {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'TRY'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block font-mono text-[8px] uppercase tracking-widest text-[var(--ed-fg-muted)] mb-2 opacity-50">
            {t('amountLabel')}
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder={t('amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-12 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ed-accent)]/20 transition-all placeholder:text-[var(--ed-fg-muted)]/30"
          />
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {zakatDue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'relative overflow-hidden rounded-3xl p-8 space-y-4 border transition-all duration-700',
              isSmall
                ? 'bg-[var(--ed-surface)]/40 border-[var(--ed-rule)]'
                : 'bg-gradient-to-br from-[var(--ed-accent-soft)]/20 to-transparent border-[var(--ed-accent)]/20 shadow-2xl'
            )}
          >
            {/* Background HUD marker */}
            <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none">
              <Wallet size={160} />
            </div>

            <div className="relative z-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ed-fg-muted)] opacity-50">
                {t('calculatedLiability')}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-mono text-[var(--ed-accent)] opacity-60">{currency}</span>
                <p className="text-5xl md:text-6xl font-mono font-bold text-[var(--ed-fg)] tracking-tighter tabular-nums">
                  {zakatDue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-sm text-[var(--ed-fg-muted)] font-serif italic mt-2 opacity-60">
                {t('exactPercent', {
                  currency,
                  amount: parsed.toLocaleString(),
                })}
              </p>

              {isSmall && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 pt-6 border-t border-[var(--ed-rule)] text-sm text-[var(--ed-fg-muted)] space-y-2"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ed-accent)]">
                    {t('recommendationTitle')}
                  </p>
                  <p className="leading-relaxed opacity-80">
                    {t('recommendationBody')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[var(--ed-rule)]">
        <div className="space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest text-[var(--ed-accent)] font-bold">
            {t('protocolTitle')}
          </h4>
          <p className="text-xs text-[var(--ed-fg-muted)] leading-relaxed opacity-60">
            {t('protocolBody')}
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-mono text-[9px] uppercase tracking-widest text-[var(--ed-fg-muted)] font-bold">
            {t('variableTitle')}
          </h4>
          <p className="text-xs text-[var(--ed-fg-muted)] leading-relaxed opacity-60">
            {t('variableBody')}
          </p>
        </div>
      </div>
    </div>
  )
}
