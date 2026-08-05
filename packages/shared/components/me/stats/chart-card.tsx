'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { ParentSize } from '@visx/responsive'

interface ChartCardProps {
  title: string
  subtitle?: string
  full?: boolean
  ariaLabel: string
  minHeight?: number
  children: (size: { width: number; height: number }) => ReactNode
  isEmpty?: boolean
  /** Overrides the translated default empty-state line. */
  emptyLabel?: string
}

export function ChartCard({
  title,
  subtitle,
  full,
  ariaLabel,
  minHeight = 220,
  children,
  isEmpty,
  emptyLabel,
}: ChartCardProps) {
  const t = useTranslations('meStats')
  return (
    <section
      className={full ? 'rs-card rs-card-full' : 'rs-card'}
      aria-label={ariaLabel}
      role="img"
    >
      <header className="rs-card-head">
        <h2 className="rs-card-title">{title}</h2>
        {subtitle ? <span className="rs-card-sub">{subtitle}</span> : null}
      </header>
      {isEmpty ? (
        <div className="rs-card-empty">{emptyLabel ?? t('noReadingsInRange')}</div>
      ) : (
        <div style={{ width: '100%', minHeight }}>
          <ParentSize>
            {(parent) => {
              const w = parent.width
              const h = Math.max(parent.height, minHeight)
              if (!w) return null
              return children({ width: w, height: h })
            }}
          </ParentSize>
        </div>
      )}
    </section>
  )
}
