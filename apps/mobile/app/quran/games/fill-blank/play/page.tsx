'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FillBlankRound } from '@/components/games/fill-blank-round'

// The active variant travels in the `?v=` query (a single static route in the
// export — unbounded variant ids can't be path params here). The shared
// FillBlankRound drives the whole round; we only read the id and render the
// heading client-side.
function PlayScreen() {
  const t = useTranslations('games')
  const searchParams = useSearchParams()
  const variantId = searchParams.get('v') ?? ''

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <div className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
        {t('playKicker', { variantId })}
      </div>
      <h1 className="mt-2 mb-6 font-serif text-2xl font-semibold leading-tight">{t('playTitle')}</h1>
      <FillBlankRound variantId={variantId} />
    </div>
  )
}

export default function FillBlankPlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayScreen />
    </Suspense>
  )
}
