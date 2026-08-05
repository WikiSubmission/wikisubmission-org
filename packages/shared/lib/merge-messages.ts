/**
 * Message-catalog fallback. next-intl resolves a key against exactly one
 * catalog: a key present in en.json but absent from de.json renders as its
 * literal dotted path ("prayertimes.fajrLabel") instead of falling back. The
 * translated catalogs trail en.json by design — new copy lands in English
 * first — so every locale is layered over en before it reaches the provider.
 */

/** A few entries are string lists read back with `t.raw()` (practices.rites.*.details). */
export type MessageValue = string | string[] | MessageCatalog
export type MessageCatalog = { [key: string]: MessageValue }

function isCatalog(value: MessageValue): value is MessageCatalog {
  return typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep-merge `locale` over `base`, locale winning. Only plain objects recurse;
 * a string or string list in `locale` replaces whatever `base` had at that path
 * (a list is one logical message, not a per-index merge), and a key missing
 * from `locale` keeps the `base` (English) value.
 *
 * Neither input is mutated.
 */
export function mergeMessages(base: MessageCatalog, locale: MessageCatalog): MessageCatalog {
  const merged: MessageCatalog = { ...base }
  for (const [key, value] of Object.entries(locale)) {
    const existing = merged[key]
    merged[key] = isCatalog(value) && isCatalog(existing) ? mergeMessages(existing, value) : value
  }
  return merged
}
