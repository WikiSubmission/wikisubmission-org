'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, FileEdit, ArrowRight, BookOpen, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAllNotes } from '@/hooks/use-notes'
import { EditorialMarkdown } from '@/components/editorial/markdown'
import { TagChip } from '@/components/editorial/tag-chip'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function relative(iso: string | undefined): string {
  if (!iso) return ''
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)
  const hour = 3_600_000
  const day = 24 * hour
  if (diff < hour) return `${Math.max(1, Math.round(diff / 60_000))}m ago`
  if (diff < day) return `${Math.round(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.round(diff / day)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotesScreen() {
  const t = useTranslations('meNotes')
  const allNotes = useAllNotes()
  const [filter, setFilter] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const n of allNotes) {
      const tags = n.tags ?? []
      for (const tag of tags) set.add(tag)
    }
    return Array.from(set).sort()
  }, [allNotes])

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return allNotes.filter((n) => {
      if (needle) {
        const hay = `${n.verse_key} ${n.content}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (tagFilter) {
        const tags = n.tags ?? []
        if (!tags.includes(tagFilter)) return false
      }
      return true
    })
  }, [allNotes, filter, tagFilter])

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* ── Masthead ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--ed-rule)]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--ed-accent)] mb-2">
            <FileEdit size={13} />
            <span>Sacred Marginalia</span>
          </div>
          <h1
            style={{ fontFamily: F.display }}
            className="m-0 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            {t('title')} <em className="italic">{t('titleEm')}</em>
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[12px] font-mono text-[var(--ed-fg-muted)]">
            <span>{t('count', { count: allNotes.length })}</span>
            <span className="opacity-40">·</span>
            <span>{t('subtitle')}</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full md:w-72">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[var(--ed-fg-muted)] pointer-events-none" aria-hidden />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2 rounded-[6px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-[13.5px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)] outline-none focus:border-[var(--ed-accent)] transition-colors"
              style={{ fontFamily: F.serif }}
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                className="absolute right-2.5 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tag filter strip ── */}
      {allTags.length > 0 && (
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <span
            style={{ fontFamily: F.glacial }}
            className="text-[10.5px] tracking-[0.18em] uppercase text-[var(--ed-fg-muted)] mr-1"
          >
            {t('filterLabel')}:
          </span>
          <TagChip on={tagFilter === null} onClick={() => setTagFilter(null)}>
            {t('filterAll')} · {allNotes.length}
          </TagChip>
          {allTags.map((tag) => (
            <TagChip key={tag} on={tagFilter === tag} onClick={() => setTagFilter(tag)}>
              {tag}
            </TagChip>
          ))}
        </div>
      )}

      {/* ── Empty State vs Notes List ── */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[10px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] mb-4">
            <BookOpen size={22} />
          </div>

          <h3
            style={{ fontFamily: F.display }}
            className="m-0 text-2xl font-medium tracking-tight text-[var(--ed-fg)]"
          >
            {filter || tagFilter ? t('emptyFiltered') : 'No study notes recorded yet'}
          </h3>

          <p
            style={{ fontFamily: F.serif }}
            className="mt-2 max-w-md mx-auto text-[14px] text-[var(--ed-fg-muted)] leading-relaxed"
          >
            {filter || tagFilter
              ? 'Try adjusting your search keywords or resetting your active tag filters.'
              : 'As you read The Holy Qur’an or Bible, you can add personal reflections and study annotations to any verse. They will be organized here.'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {filter || tagFilter ? (
              <button
                type="button"
                onClick={() => {
                  setFilter('')
                  setTagFilter(null)
                }}
                className="ed-btn-primary inline-flex items-center gap-2 px-4 py-2 text-[13px] cursor-pointer"
                style={{ fontFamily: F.serif }}
              >
                <span>Reset Filters</span>
              </button>
            ) : (
              <Link
                href="/quran/1"
                className="ed-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[14px] no-underline group"
                style={{ fontFamily: F.serif }}
              >
                <span>{t('emptyCta')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((note) => {
            const [chapter, verse] = note.verse_key.split(':')
            const isQuran = note.scripture === 'quran'
            const href = isQuran
              ? `/quran/${chapter}?verse=${verse}`
              : `/bible/${note.verse_key}`
            const tags = note.tags ?? []

            return (
              <article
                key={note.id}
                className="rounded-[8px] border border-[var(--ed-rule)] bg-[var(--ed-surface)] p-5 sm:p-6 hover:border-[var(--ed-accent)] transition-all"
              >
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)]">
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ fontFamily: F.mono }}
                      className="px-2 py-0.5 rounded-[4px] bg-[color-mix(in_oklab,var(--ed-accent),transparent_90%)] text-[var(--ed-accent)] text-[11px] font-bold uppercase tracking-wider"
                    >
                      {isQuran ? `Qur'an ${note.verse_key}` : `Bible ${note.verse_key}`}
                    </span>
                    <span style={{ fontFamily: F.mono }} className="text-[11.5px] text-[var(--ed-fg-muted)]">
                      {relative(note.updated_at)}
                    </span>
                  </div>

                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-[11.5px] font-mono text-[var(--ed-accent)] hover:underline"
                  >
                    <span>View in Reader</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="text-[14.5px] leading-relaxed text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                  <EditorialMarkdown content={note.content} scripture={note.scripture} />
                </div>

                {tags.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[color-mix(in_oklab,var(--ed-rule),transparent_60%)] flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{ fontFamily: F.mono }}
                        className="px-2 py-0.5 rounded-[4px] border border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[11px] text-[var(--ed-fg-muted)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
