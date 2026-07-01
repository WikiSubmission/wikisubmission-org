'use client'

import Link from 'next/link'
import { Fonts } from '@/constants/fonts'
import { useTranslations } from 'next-intl'

export default function QuranUtilitiesRow() {
  const t = useTranslations('common')

  return (
    <main className="flex items-center justify-center rounded-2xl space-x-4 border border-muted/50 p-2">
      <Link href="/quran">
        <div
          className={`flex items-center ${Fonts.geistMono.className} bg-muted/50 rounded-lg text-center`}
        >
          <p className="p-2 text-xs">{t('finalTestament').toUpperCase()}</p>
        </div>
      </Link>
    </main>
  )
}
