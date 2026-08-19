import type { components } from '@/src/api/types.gen'

/**
 * Types and pure helpers for the Quran's printed topical index.
 *
 * Deliberately not a `'use client'` module. These are called from both the
 * server-rendered /quran/index page and the client search components, and a
 * client module's exports cannot be invoked from a Server Component at all — the
 * hook that fetches this data lives in hooks/use-topic-index-search.ts.
 */

export type TopicEntry = components['schemas']['TopicIndexEntry']
export type TopicRef = components['schemas']['TopicIndexRef']
export type TopicSubentry = components['schemas']['TopicIndexSubentry']
export type TopicIndexLetter = components['schemas']['TopicIndexLetter']

/** Deep link to an entry on the index page. */
export function topicEntryHref(entry: Pick<TopicEntry, 'letter' | 'slug'>): string {
  return `/quran/index?letter=${entry.letter}#${entry.slug}`
}

/**
 * Link for one printed citation. Verse numbers in the index are 1-based, which is
 * what `?verse=N` expects; a range links to its first verse.
 */
export function topicRefHref(ref: Pick<TopicRef, 'chapter_number' | 'verse_start'>): string {
  return `/quran/${ref.chapter_number}?verse=${ref.verse_start}`
}

/**
 * Search for another entry by its printed title. Cross-references name a title
 * rather than an id, because the printed text does not always spell a target
 * exactly as that entry's own title.
 */
export function topicCrossRefHref(title: string): string {
  return `/quran/index?q=${encodeURIComponent(title)}`
}

/** Every citation under an entry, its own first, then its sub-entries'. */
export function flattenTopicRefs(entry: TopicEntry): TopicRef[] {
  return [...entry.refs, ...entry.subentries.flatMap((sub) => sub.refs)]
}
