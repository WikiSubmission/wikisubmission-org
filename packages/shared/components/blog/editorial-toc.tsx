'use client'

import React, { useEffect, useState } from 'react'

export interface ArticleHeading {
  id: string
  text: string
  level: 1 | 2 | 3 | 4
}

interface EditorialTocProps {
  headings: ArticleHeading[]
}

const ACTIVE_OFFSET_PX = 140

export function EditorialToc({ headings }: EditorialTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  useEffect(() => {
    if (headings.length === 0) return

    let frame = 0

    const resolveActive = () => {
      frame = 0
      let current = headings[0].id

      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (!element) continue
        if (element.getBoundingClientRect().top > ACTIVE_OFFSET_PX) break
        current = heading.id
      }

      setActiveId((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(resolveActive)
    }

    resolveActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="space-y-3.5">
      <p className="font-[family-name:var(--font-glacial)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ed-fg-muted)] opacity-80">
        Sections & Headings
      </p>
      <ul className="list-none space-y-1.5 pl-0">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          const isSub = heading.level === 3 || heading.level === 4
          return (
            <li key={heading.id} className={isSub ? 'pl-3' : ''}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`group flex items-start gap-2 py-0.5 font-[family-name:var(--font-source-serif)] text-[13px] leading-snug transition-colors ${
                  isActive
                    ? 'font-semibold text-[var(--ed-accent)]'
                    : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'
                }`}
              >
                <span
                  className={`select-none font-mono text-[12px] leading-none transition-colors ${
                    isActive ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-rule)] group-hover:text-[var(--ed-fg-muted)]'
                  }`}
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="flex-1 line-clamp-2">{heading.text}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
