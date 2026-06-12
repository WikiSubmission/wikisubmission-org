'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAllNotes } from '@/hooks/use-notes'
import { EditorialMarkdown } from '@/components/editorial/markdown'
import { TagChip } from '@/components/editorial/tag-chip'

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

export default function NotesPage() {
  const t = useTranslations('meNotes')
  const allNotes = useAllNotes()
  const [filter, setFilter] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const n of allNotes) {
      const tags = n.tags ?? []
      for (const t of tags) set.add(t)
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
    <>
      <div className="profile-mast">
        <div>
          <h1>
            {t('title')} <em>{t('titleEm')}</em>
          </h1>
          <div className="profile-mast-meta">
            <span>{t('count', { count: allNotes.length })}</span>
            <span className="sep">·</span>
            <span>{t('subtitle')}</span>
          </div>
        </div>
        <div className="profile-mast-side">
          <label className="flex items-center gap-2 border-b border-[var(--ed-rule)] focus-within:border-[var(--ed-accent)] min-w-[260px]">
            <Search className="w-4 h-4 text-[var(--ed-fg-muted)]" aria-hidden />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent outline-none py-2 font-[var(--font-source-serif)] text-[14px] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)]"
            />
            <span className="font-[var(--font-jetbrains)] text-[10px] tracking-[0.04em] text-[var(--ed-fg-muted)] border border-[var(--ed-rule)] px-1.5 py-0.5">
              ⌘K
            </span>
          </label>
        </div>
      </div>
      <div className="profile-mast-mobile">
        <h1>
          {t('title')} <em>{t('titleEm')}</em>
        </h1>
        <div className="profile-mast-meta">
          <span>{t('count', { count: allNotes.length })}</span>
          <span className="sep">·</span>
          <span>{t('subtitle')}</span>
        </div>
      </div>

      {allTags.length > 0 ? (
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <span className="font-[var(--font-glacial)] text-[10.5px] tracking-[0.18em] uppercase text-[var(--ed-fg-muted)]">
            {t('filterLabel')}
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
      ) : null}

      {filtered.length === 0 ? (
        <div className="empty mt-8">
          <p className="empty-verse">
            {filter || tagFilter ? t('emptyFiltered') : t('empty')}
          </p>
          {!(filter || tagFilter) ? (
            <Link href="/quran/1" className="empty-cta">
              {t('emptyCta')}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="notes-index mt-6">
          {filtered.map((note) => {
            const [chapter, verse] = note.verse_key.split(':')
            const href =
              note.scripture === 'quran'
                ? `/quran/${chapter}?verse=${verse}`
                : `/bible/${note.verse_key}`
            const tags = note.tags ?? []
            return (
              <article key={note.id} className="notes-row">
                <div className="key">
                  <Link href={href} className="hover:underline">
                    {note.verse_key}
                  </Link>
                  <b>{relative(note.updated_at)}</b>
                </div>
                <div className="body">
                  <EditorialMarkdown content={note.content} scripture={note.scripture} />
                  {tags.length > 0 ? (
                    <div className="tags">
                      {tags.map((t) => (
                        <span key={t} className="tag-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
