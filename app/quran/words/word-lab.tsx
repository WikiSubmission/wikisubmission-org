'use client'

import Link from 'next/link'
import { ChevronDown, ArrowUp, ArrowDown, Keyboard } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ABJAD,
  abjadiCompare,
  arabicToLatin,
  stripDiacritics,
  toArabicLetters,
} from '@/lib/transliteration'
import {
  filterRoots,
  useRootDetail,
  useRootOccurrences,
  useRootsIndex,
  type Occurrence,
  type RootRecord,
} from '@/hooks/use-roots-index'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { PlayWordButton } from '@/components/play-word-button'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import './word-lab.css'

type SortMode = 'frequency' | 'abjadi' | 'reverse'

const INDEX_RENDER_CAP = 300
const ENGLISH_LOOKUP_MIN = 3
const ENGLISH_LOOKUP_LIMIT = 40
const ENGLISH_LOOKUP_DEBOUNCE_MS = 220
const SHOW_MORPHOLOGY_SECTION = false

const CHEAT_PAIRS: ReadonlyArray<{ lat: string; ar: string; insert: string }> = [
  { lat: 'a', ar: 'ا', insert: 'a' },
  { lat: 'b', ar: 'ب', insert: 'b' },
  { lat: 't', ar: 'ت', insert: 't' },
  { lat: 'th', ar: 'ث', insert: 'th' },
  { lat: 'j', ar: 'ج', insert: 'j' },
  { lat: 'H', ar: 'ح', insert: 'H' },
  { lat: 'kh', ar: 'خ', insert: 'kh' },
  { lat: 'd', ar: 'د', insert: 'd' },
  { lat: 'dh', ar: 'ذ', insert: 'dh' },
  { lat: 'r', ar: 'ر', insert: 'r' },
  { lat: 'z', ar: 'ز', insert: 'z' },
  { lat: 's', ar: 'س', insert: 's' },
  { lat: 'sh', ar: 'ش', insert: 'sh' },
  { lat: 'S', ar: 'ص', insert: 'S' },
  { lat: 'D', ar: 'ض', insert: 'D' },
  { lat: 'T', ar: 'ط', insert: 'T' },
  { lat: 'Z', ar: 'ظ', insert: 'Z' },
  { lat: 'c', ar: 'ع', insert: 'c' },
  { lat: '`', ar: 'ع', insert: '`' },
  { lat: 'gh', ar: 'غ', insert: 'gh' },
  { lat: 'f', ar: 'ف', insert: 'f' },
  { lat: 'q', ar: 'ق', insert: 'q' },
  { lat: 'k', ar: 'ك', insert: 'k' },
  { lat: 'l', ar: 'ل', insert: 'l' },
  { lat: 'm', ar: 'م', insert: 'm' },
  { lat: 'n', ar: 'ن', insert: 'n' },
  { lat: 'h', ar: 'ه', insert: 'h' },
  { lat: 'w', ar: 'و', insert: 'w' },
  { lat: 'y', ar: 'ي', insert: 'y' },
  { lat: "'", ar: 'ء', insert: "'" },
]

type VerseData = components['schemas']['VerseData']

function normalizeLetters(letters: string): string {
  return stripDiacritics(letters).replace(/\s+/g, '')
}

function toSpacedLetters(flatLetters: string): string {
  return Array.from(flatLetters).join(' ')
}

function tokenizeEnglish(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= ENGLISH_LOOKUP_MIN)
}

function extractEnglishRootCandidates(
  verses: VerseData[],
  query: string,
): Map<string, number> {
  const scores = new Map<string, number>()
  const terms = tokenizeEnglish(query)
  const exact = query.trim().toLowerCase()
  for (const verse of verses) {
    for (const word of verse.w ?? []) {
      const rootFlat = normalizeLetters(word.r ?? '')
      if (!rootFlat) continue
      const meaning = (word.m ?? '').toLowerCase()
      let bump = 1
      if (exact && meaning === exact) bump += 6
      if (terms.some((term) => meaning.includes(term))) bump += 4
      scores.set(rootFlat, (scores.get(rootFlat) ?? 0) + bump)
    }
  }
  return scores
}

/**
 * Word-boundary highlight. Splits the verse on whitespace, finds the token
 * whose diacritic-stripped form equals the diacritic-stripped target, and
 * wraps only that token in <mark>. Avoids the indexOf trap where a short
 * surface form like مِن matches as a substring inside مُؤْمِنُونَ.
 *
 * If `wi` is provided (1-based word_index from the backend), highlights the
 * token at that exact position — the most accurate path.
 */
type FormMeanings = {
  /** Map of diacritic-stripped surface form → its English gloss. */
  byForm: Map<string, string>
  /** Whole-root meaning to use when the string isn't structured per form. */
  fallback: string | null
}

/**
 * The corpus stores the root meaning denormalized as a single string. When a
 * root has multiple distinct surface forms with different meanings, the string
 * encodes them as `surface = meaning [/ surface = meaning ...]` (e.g.
 * `مَن = he; she; who / مِن = from; of`). For roots with one shared meaning
 * the string is just the gloss with no `=` separator. Parse both shapes so the
 * derivative cards can show the form-specific gloss when available.
 */
function parseFormMeanings(meaning: string | null): FormMeanings {
  if (!meaning) return { byForm: new Map(), fallback: null }
  const trimmed = meaning.trim()
  if (!trimmed) return { byForm: new Map(), fallback: null }

  const byForm = new Map<string, string>()
  const segments = trimmed.split(/\s*\/\s*(?=\S+\s*=)/)
  for (const segment of segments) {
    const eqIdx = segment.indexOf('=')
    if (eqIdx <= 0) continue
    const surface = segment.slice(0, eqIdx).trim()
    const text = segment.slice(eqIdx + 1).trim()
    if (!surface || !text) continue
    byForm.set(stripDiacritics(surface), text)
  }
  return { byForm, fallback: trimmed }
}

function meaningToEnglishWord(meaning: string | null): string | null {
  if (!meaning) return null
  const firstSense = meaning.split(/[;/]/)[0]?.trim() ?? ''
  if (!firstSense) return null
  const cleaned = firstSense.replace(/^to\s+/i, '')
  const match = cleaned.match(/[A-Za-z][A-Za-z'-]*/)
  return match ? match[0] : null
}

function highlight(ar: string, hi: string, wi?: number | null): React.ReactNode {
  if (!ar) return ar
  const tokens = ar.split(/(\s+)/)
  // Tokens are interleaved: [word, sep, word, sep, ...]. Word slots have even index.
  const wordSlots: number[] = []
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0 && tokens[i].length > 0) wordSlots.push(i)
  }

  let matchIdx = -1
  if (typeof wi === 'number' && wi > 0 && wi <= wordSlots.length) {
    matchIdx = wordSlots[wi - 1]
  } else if (hi) {
    const targetBare = stripDiacritics(hi).replace(/^ٱ|^ا/, '')
    for (const slot of wordSlots) {
      const tok = tokens[slot]
      const bare = stripDiacritics(tok).replace(/^ٱ|^ا/, '')
      if (bare === stripDiacritics(hi) || bare === targetBare) {
        matchIdx = slot
        break
      }
    }
    // Fallback: any token containing the diacritic-stripped target as a *whole-token* match
    if (matchIdx < 0) {
      for (const slot of wordSlots) {
        if (stripDiacritics(tokens[slot]) === stripDiacritics(hi)) {
          matchIdx = slot
          break
        }
      }
    }
  }

  if (matchIdx < 0) return ar
  return (
    <>
      {tokens.slice(0, matchIdx).join('')}
      <mark className="wl-hl">{tokens[matchIdx]}</mark>
      {tokens.slice(matchIdx + 1).join('')}
    </>
  )
}

export function WordLab({ initialLetters }: { initialLetters?: string }) {
  const t = useTranslations('wordLab')
  const { status, data, error } = useRootsIndex()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('frequency')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [englishLookupStatus, setEnglishLookupStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [englishLookupRoots, setEnglishLookupRoots] = useState<Map<string, number>>(new Map())
  const [activeKey, setActiveKey] = useState<string | null>(initialLetters ?? null)
  const [activeDeriv, setActiveDeriv] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const englishLookupCacheRef = useRef(new Map<string, Map<string, number>>())
  const englishLookupRequestRef = useRef(0)

  const arabicTarget = useMemo(() => toArabicLetters(query), [query])
  const isArabicQuery = useMemo(() => /[؀-ۿ]/.test(query), [query])
  const queryTerms = useMemo(() => tokenizeEnglish(query), [query])
  const shouldTryEnglishLookup = useMemo(
    () => !isArabicQuery && queryTerms.length > 0,
    [isArabicQuery, queryTerms.length],
  )
  const showPreview = useMemo(
    () => query.length > 0 && !/[؀-ۿ]/.test(query) && arabicTarget.length > 0,
    [query, arabicTarget],
  )

  useEffect(() => {
    const key = query.trim().toLowerCase()
    const requestId = ++englishLookupRequestRef.current
    const timeout = window.setTimeout(() => {
      if (!key || !shouldTryEnglishLookup) {
        setEnglishLookupRoots(new Map())
        setEnglishLookupStatus('idle')
        return
      }

      const cached = englishLookupCacheRef.current.get(key)
      if (cached) {
        setEnglishLookupRoots(cached)
        setEnglishLookupStatus('ready')
        return
      }

      setEnglishLookupStatus('loading')
      void wsApi.GET('/search', {
        params: {
          query: {
            q: key,
            langs: ['en'],
            scope: 'verses',
            limit: ENGLISH_LOOKUP_LIMIT,
            offset: 0,
            include_words: true,
            include_root: true,
            include_meaning: true,
            word_langs: ['ar'],
          },
        },
      }).then(({ data: searchData, error: searchError }) => {
        if (requestId !== englishLookupRequestRef.current) return
        if (searchError || !searchData) {
          setEnglishLookupRoots(new Map())
          setEnglishLookupStatus('error')
          return
        }
        const verses = (searchData.chapters ?? []).flatMap((chapter) => chapter.verses ?? [])
        const extracted = extractEnglishRootCandidates(verses, key)
        englishLookupCacheRef.current.set(key, extracted)
        setEnglishLookupRoots(extracted)
        setEnglishLookupStatus('ready')
      }).catch(() => {
        if (requestId !== englishLookupRequestRef.current) return
        setEnglishLookupRoots(new Map())
        setEnglishLookupStatus('error')
      })
    }, ENGLISH_LOOKUP_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [query, shouldTryEnglishLookup])

  const visible = useMemo(() => {
    if (!data) return []
    const filtered = filterRoots(data, query, arabicTarget)
    const queryFlat = query.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')
    const arabicFlat = normalizeLetters(arabicTarget)

    const sortByMode = (a: RootRecord, b: RootRecord) => {
      if (sort === 'abjadi') return abjadiCompare(a.letters, b.letters)
      if (sort === 'reverse') return abjadiCompare(b.letters, a.letters)
      return b.count - a.count
    }

    const strict: RootRecord[] = []
    const fuzzy: RootRecord[] = []
    for (const root of filtered) {
      const rootFlat = normalizeLetters(root.letters)
      const trFlat = root.tr.toLowerCase().replace(/-/g, '')
      const exactArabic = arabicFlat.length > 0 && rootFlat === arabicFlat
      const exactTranslit = queryFlat.length > 0 && trFlat === queryFlat
      if (exactArabic || exactTranslit) strict.push(root)
      else fuzzy.push(root)
    }

    strict.sort(sortByMode)
    fuzzy.sort(sortByMode)

    const seen = new Set<string>([...strict, ...fuzzy].map((root) => root.letters))
    const englishInferred = Array.from(englishLookupRoots.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([flatLetters]) => toSpacedLetters(flatLetters))
      .map((letters) => data.find((r) => r.letters === letters) ?? null)
      .filter((root): root is RootRecord => !!root && !seen.has(root.letters))

    return [...strict, ...fuzzy, ...englishInferred]
  }, [data, query, arabicTarget, sort, englishLookupRoots])

  const totalRoots = data?.length ?? 0
  const indexRendered = useMemo(() => visible.slice(0, INDEX_RENDER_CAP), [visible])
  const isCapped = visible.length > INDEX_RENDER_CAP
  const englishInferredSet = useMemo(() => {
    if (!data) return new Set<string>()
    const direct = new Set(filterRoots(data, query, arabicTarget).map((root) => root.letters))
    const out = new Set<string>()
    for (const rootFlat of englishLookupRoots.keys()) {
      const spaced = toSpacedLetters(rootFlat)
      if (!direct.has(spaced)) out.add(spaced)
    }
    return out
  }, [data, query, arabicTarget, englishLookupRoots])

  const grouped = useMemo(() => {
    if (sort !== 'abjadi' && sort !== 'reverse') return null
    const out: Record<string, RootRecord[]> = {}
    for (const r of visible) {
      const first = r.letters.split(' ')[0] ?? ''
      if (!first) continue
      out[first] = out[first] ?? []
      out[first].push(r)
    }
    return out
  }, [visible, sort])

  const activeRoot = useMemo<RootRecord | null>(() => {
    if (!visible.length) return null
    if (activeKey) {
      const found = visible.find((r) => r.letters === activeKey)
      if (found) return found
    }
    return visible[0]
  }, [visible, activeKey])

  useEffect(() => {
    if (activeRoot && activeRoot.letters !== activeKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveKey(activeRoot.letters)
      setActiveDeriv(0)
    }
  }, [activeRoot, activeKey])

  // Keep the URL in sync with the active root. We use replaceState (not
  // router.push/replace) so the change is silent — no Next router re-render
  // and no entry in the history stack per click. Browser Back still works
  // because each genuine navigation (initial mount via [letters] route) goes
  // through the App Router normally.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!activeRoot) return
    const target = `/quran/words/${encodeURIComponent(activeRoot.letters)}`
    if (window.location.pathname !== target) {
      window.history.replaceState(window.history.state, '', target)
    }
  }, [activeRoot])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const cmd = (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey
      if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        const el = inputRef.current
        if (el) {
          el.focus()
          el.select()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [])

  const onSearchChange = (value: string) => {
    setQuery(value)
  }

  const onInsertKey = (token: string) => {
    const el = inputRef.current
    if (!el) {
      setQuery((prev) => `${prev}${token}`)
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const before = query.slice(0, start)
    const after = query.slice(end)
    const needsSpaceBefore = before.length > 0 && !/\s$/.test(before)
    const insert = needsSpaceBefore ? ` ${token}` : token
    const nextQuery = `${before}${insert}${after}`
    setQuery(nextQuery)
    requestAnimationFrame(() => {
      el.focus()
      const nextPos = before.length + insert.length
      el.setSelectionRange(nextPos, nextPos)
    })
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="wl-page">
        <Hero />
        <div className="wl-loading">{t('loadingIndex')}</div>
      </div>
    )
  }
  if (status === 'error' || !data) {
    return (
      <div className="wl-page">
        <Hero />
        <div className="wl-loading">{error ?? t('indexError')}</div>
      </div>
    )
  }

  return (
    <div className="wl-page">
      <Hero />

      <section className="wl-search">
        <div className="wl-search-row">
          <div className="wl-search-box">
            <span className="wl-search-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              spellCheck={false}
              autoComplete="off"
              aria-label={t('searchAria')}
            />
            {showPreview && (
              <div className="wl-search-preview" aria-live="polite">
                <span className="wl-search-preview-label">→</span>
                <span className="wl-search-preview-arab">{Array.from(arabicTarget).join(' ')}</span>
              </div>
            )}
            <kbd>⌘K</kbd>
          </div>

          <button
            type="button"
            className={`wl-keyboard-toggle ${showKeyboard ? 'on' : ''}`}
            onClick={() => setShowKeyboard((v) => !v)}
            aria-expanded={showKeyboard}
            aria-controls="wl-keyboard"
          >
            <Keyboard size={14} aria-hidden />
            <span>{t('keyboardToggle')}</span>
            <ChevronDown size={14} className="chevron" aria-hidden />
          </button>

          <div className="wl-sort" role="radiogroup" aria-label={t('sortAria')}>
            <span className="wl-sort-label">{t('sortLabel')}</span>
            {([
              ['frequency', t('sortFrequency')],
              ['abjadi', t('sortAbjadi')],
              ['reverse', t('sortReverse')],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                role="radio"
                aria-checked={sort === k}
                className={`wl-sort-btn ${sort === k ? 'on' : ''}`}
                onClick={() => setSort(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {showKeyboard && (
          <div id="wl-keyboard" className="wl-cheat">
            <div className="wl-cheat-hint">{t('keyboardHint')}</div>
            <div className="wl-cheat-grid">
              {CHEAT_PAIRS.map(({ lat, ar, insert }) => (
                <button
                  key={`${lat}-${ar}`}
                  type="button"
                  className="wl-cheat-cell"
                  onClick={() => onInsertKey(insert)}
                  title={t('keyboardInsertHint', { key: insert })}
                >
                  <span className="lat">{lat}</span>
                  <span className="ar">{ar}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim().length >= ENGLISH_LOOKUP_MIN && (
          <div className="wl-search-meta">
            {englishLookupStatus === 'loading' && <span>{t('englishLookupLoading')}</span>}
            {englishLookupStatus === 'error' && <span>{t('englishLookupError')}</span>}
            {englishLookupStatus === 'ready' && englishLookupRoots.size > 0 && (
              <span>{t('englishLookupReady', { count: englishLookupRoots.size })}</span>
            )}
          </div>
        )}
      </section>

      <div className="wl-lab">
        <aside className="wl-index">
          <div className="wl-index-head">
            <span>{t('sectionRoots')}</span>
            <span className="wl-index-count">
              {isCapped
                ? t('indexCount', {
                    cap: INDEX_RENDER_CAP.toLocaleString(),
                    total: visible.length.toLocaleString(),
                  })
                : visible.length.toLocaleString()}
            </span>
          </div>
          {grouped ? (
            ABJAD.filter((l) => grouped[l]?.length).map((letter) => {
              const slice = grouped[letter]!.slice(0, INDEX_RENDER_CAP)
              return (
                <div key={letter} className="wl-index-group">
                  <div className="wl-index-group-head">
                    <span className="letter">{letter}</span>
                    <span className="count">{grouped[letter]!.length}</span>
                  </div>
                  {slice.map((r) => (
                    <RootRow
                      key={r.letters}
                      root={r}
                      inferred={englishInferredSet.has(r.letters)}
                      active={activeRoot?.letters === r.letters}
                      onClick={() => {
                        setActiveKey(r.letters)
                        setActiveDeriv(0)
                      }}
                    />
                  ))}
                </div>
              )
            })
          ) : (
            indexRendered.map((r) => (
              <RootRow
                key={r.letters}
                root={r}
                inferred={englishInferredSet.has(r.letters)}
                active={activeRoot?.letters === r.letters}
                onClick={() => {
                  setActiveKey(r.letters)
                  setActiveDeriv(0)
                }}
              />
            ))
          )}
          {visible.length === 0 && (
            <div className="wl-empty">{t('noRoots')}</div>
          )}
          {isCapped && (
            <div className="wl-empty">
              {t('showingTopN', {
                cap: INDEX_RENDER_CAP.toLocaleString(),
                total: totalRoots.toLocaleString(),
              })}
            </div>
          )}
        </aside>

        {activeRoot && <Detail root={activeRoot} activeDeriv={activeDeriv} setActiveDeriv={setActiveDeriv} />}
      </div>
    </div>
  )
}

function Hero() {
  const t = useTranslations('wordLab')
  return (
    <header className="wl-hero">
      <h1 className="wl-title">
        {t('heroTitle')} <em>{t('heroTitleAccent')}</em>.
      </h1>
      <p className="wl-lede">
        {t.rich('heroLede', {
          mono: (chunks) => <span className="wl-mono">{chunks}</span>,
          arab: (chunks) => <span className="wl-arab">{chunks}</span>,
        })}
      </p>
    </header>
  )
}

function RootRow({
  root,
  inferred,
  active,
  onClick,
}: {
  root: RootRecord
  inferred: boolean
  active: boolean
  onClick: () => void
}) {
  const t = useTranslations('wordLab')
  return (
    <button onClick={onClick} className={`wl-row ${active ? 'on' : ''}`}>
      <span className="ar" dir="rtl" lang="ar">
        {root.letters}
      </span>
      <span className="mid">
        <span className="tr">{root.tr}</span>
        {inferred && <span className="inferred">{t('englishInferredBadge')}</span>}
      </span>
      <span className="num">{root.count.toLocaleString()}</span>
    </button>
  )
}

function Section({
  num,
  title,
  sub,
  open,
  onOpenChange,
  children,
}: {
  num: string
  title: React.ReactNode
  sub?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="wl-section">
      <CollapsibleTrigger className="wl-section-head" data-open={open}>
        <span className="num">{num}</span>
        <span className="title">{title}</span>
        {sub && <span className="sub">{sub}</span>}
        <ChevronDown className="chevron" size={14} aria-hidden />
      </CollapsibleTrigger>
      <CollapsibleContent className="wl-section-body">{children}</CollapsibleContent>
    </Collapsible>
  )
}

function Detail({
  root,
  activeDeriv,
  setActiveDeriv,
}: {
  root: RootRecord
  activeDeriv: number
  setActiveDeriv: (n: number) => void
}) {
  const t = useTranslations('wordLab')
  const detail = useRootDetail(root.letters)
  const derivs = detail.derivs
  const meaning = detail.meaning
  const deriv = derivs[activeDeriv] ?? derivs[0]
  const isLoadingDetail = detail.status === 'loading' || detail.status === 'idle'

  const [activeSurface, setActiveSurface] = useState<string | null>(null)
  // Reset filter when the root changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSurface(null)
  }, [root.letters])

  const prefs = useQuranPreferences()
  const sections = prefs.wordLabSections
  const setSection = (k: keyof typeof sections, v: boolean) =>
    prefs.setPreferences({ ...prefs, wordLabSections: { ...sections, [k]: v } })

  const onChipClick = (i: number) => {
    setActiveDeriv(i)
    const surface = derivs[i]?.ar ?? null
    // Toggle: if already filtering by this surface, clear; else set.
    setActiveSurface((prev) => (prev === surface ? null : surface))
  }

  const formMeanings = useMemo(
    () => parseFormMeanings(meaning),
    [meaning],
  )
  const lookupFormMeaning = (ar: string): string | null => {
    if (formMeanings.byForm.size === 0) {
      // No per-form structure — every form shares the root meaning.
      return formMeanings.fallback
    }
    return formMeanings.byForm.get(stripDiacritics(ar)) ?? null
  }

  return (
    <article className="wl-detail">
      <header className="wl-detail-head">
        <div className="top">
          <span className="kicker">{t('detailKickerRoot')}</span>
          <span className="tr">{root.tr}</span>
          <span className="count">
            <strong>{root.count.toLocaleString()}</strong> {t('detailOccurrencesSuffix')}
          </span>
        </div>
        <div className="letters" dir="rtl" lang="ar">
          {root.letters}
        </div>
        {meaning && <RootMeaning meaning={meaning} />}
      </header>

      <Section
        num="01"
        title={t('sectionDerivedForms')}
        sub={derivs.length}
        open={sections.derivs}
        onOpenChange={(v) => setSection('derivs', v)}
      >
        {isLoadingDetail ? (
          <div className="wl-loading">{t('loadingDerivs')}</div>
        ) : (
          <div className="wl-derivs">
            {derivs.map((d, i) => {
              const formEn = lookupFormMeaning(d.ar)
              const formWord = meaningToEnglishWord(formEn)
              return (
                <button
                  key={d.ar}
                  onClick={() => onChipClick(i)}
                  className={`wl-deriv ${activeDeriv === i ? 'on' : ''} ${activeSurface === d.ar ? 'filtering' : ''}`}
                  title={activeSurface === d.ar ? t('filterClickAgain') : t('filterClick')}
                >
                  <div className="ar" dir="rtl" lang="ar">
                    {d.ar}
                  </div>
                  <div className="tr">{d.tr ?? arabicToLatin(stripDiacritics(d.ar))}</div>
                  {formWord && <div className="en">{formWord}</div>}
                  <div className="meta">
                    <span className="pos">—</span>
                    <span>{d.count}×</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Section>

      <OccurrencesSection
        rootLetters={root.letters}
        rootCount={root.count}
        activeSurface={activeSurface}
        onClearFilter={() => setActiveSurface(null)}
        open={sections.occurrences}
        onOpenChange={(v) => setSection('occurrences', v)}
        showTranslit={prefs.transliteration}
        showTranslation={prefs.text}
      />

      {SHOW_MORPHOLOGY_SECTION && deriv && (
        <Section
          num="03"
          title={t.rich('sectionMorphologyOf', {
            lemma: deriv.ar,
            arab: (chunks) => <span className="wl-arab">{chunks}</span>,
          })}
          open={sections.morphology}
          onOpenChange={(v) => setSection('morphology', v)}
        >
          <div className="wl-morph-grid">
            <Cell k={t('morphLemma')} v={deriv.ar} ar />
            <Cell k={t('morphTranslit')} v={deriv.tr ?? arabicToLatin(stripDiacritics(deriv.ar))} />
            <Cell k={t('morphGloss')} v={lookupFormMeaning(deriv.ar) ?? '—'} />
            <Cell k={t('morphPos')} v="—" />
            <Cell k={t('morphRoot')} v={root.letters} ar />
            <Cell k={t('morphCount')} v={`${deriv.count}×`} />
          </div>
        </Section>
      )}
    </article>
  )
}

function OccurrencesSection({
  rootLetters,
  rootCount,
  activeSurface,
  onClearFilter,
  open,
  onOpenChange,
  showTranslit,
  showTranslation,
}: {
  rootLetters: string
  rootCount: number
  activeSurface: string | null
  onClearFilter: () => void
  open: boolean
  onOpenChange: (v: boolean) => void
  showTranslit: boolean
  showTranslation: boolean
}) {
  const t = useTranslations('wordLab')
  const { items, total, hasMore, loadMore, status } = useRootOccurrences(
    rootLetters,
    activeSurface,
  )
  const isLoading = status === 'loading' || status === 'idle'
  const sub = activeSurface
    ? t('occurrencesFiltered', {
        total: total.toLocaleString(),
        surface: activeSurface,
      })
    : t('occurrencesCount', {
        shown: items.length.toLocaleString(),
        total: (total || rootCount).toLocaleString(),
      })

  return (
    <Section
      num="02"
      title={
        activeSurface ? (
          <>
            {t.rich('sectionOccurrencesOf', {
              surface: activeSurface,
              arab: (chunks) => <span className="wl-arab">{chunks}</span>,
            })}{' '}
            <button
              type="button"
              className="wl-clear-filter"
              onClick={(e) => {
                e.preventDefault()
                onClearFilter()
              }}
            >
              {t('clear')}
            </button>
          </>
        ) : (
          t('sectionOccurrences')
        )
      }
      sub={sub}
      open={open}
      onOpenChange={onOpenChange}
    >
      {isLoading && items.length === 0 ? (
        <div className="wl-loading">{t('loadingOccurrences')}</div>
      ) : items.length === 0 ? (
        <div className="wl-empty">{t('noOccurrences')}</div>
      ) : (
        <VirtualizedOccurrences
          items={items}
          total={total}
          hasMore={hasMore}
          loadMore={loadMore}
          showTranslit={showTranslit}
          showTranslation={showTranslation}
        />
      )}
    </Section>
  )
}

function VirtualizedOccurrences({
  items,
  total,
  hasMore,
  loadMore,
  showTranslit,
  showTranslation,
}: {
  items: Occurrence[]
  total: number
  hasMore: boolean
  loadMore: () => void
  showTranslit: boolean
  showTranslation: boolean
}) {
  const t = useTranslations('wordLab')
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [loadingAll, setLoadingAll] = useState(false)

  // TanStack Virtual returns non-memoizable functions; that's expected here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => 200,
    overscan: 6,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Auto-load when scrolling near the end of the loaded slice.
  useEffect(() => {
    if (!hasMore) return
    if (virtualItems.length === 0) return
    const lastIdx = virtualItems[virtualItems.length - 1].index
    if (lastIdx >= items.length - 5) loadMore()
  }, [virtualItems, hasMore, items.length, loadMore])

  // "End ↓" loop: keep calling loadMore until everything's loaded, then scroll
  // to the bottom and reset.
  useEffect(() => {
    if (!loadingAll) return
    if (hasMore) {
      loadMore()
      return
    }
    // Done loading — scroll to the absolute end and clear the flag.
    const el = scrollerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    setLoadingAll(false)
  }, [loadingAll, hasMore, items.length, loadMore])

  // Range readout: derive the visible window from the virtualizer's items.
  // first/last are 1-indexed and clamped to non-empty.
  const first = virtualItems.length > 0 ? virtualItems[0].index + 1 : 0
  const last = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index + 1 : 0

  const onJumpTop = () => {
    scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const onJumpEnd = () => {
    if (hasMore) {
      setLoadingAll(true)
    } else {
      const el = scrollerRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <div className="wl-occ-wrap">
      <div ref={scrollerRef} className="wl-occ-scroll">
        <div
          className="wl-occ-virt"
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualItems.map((vi) => {
            const o = items[vi.index]
            return (
              <div
                key={vi.key}
                data-index={vi.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <OccurrenceCard
                  occ={o}
                  showTranslit={showTranslit}
                  showTranslation={showTranslation}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="wl-occ-footer">
        <span className="range">
          {loadingAll
            ? t('rangeLoading', {
                shown: items.length.toLocaleString(),
                total: total.toLocaleString(),
              })
            : t('rangeShowing', {
                first: first.toLocaleString(),
                last: last.toLocaleString(),
                total: total.toLocaleString(),
              })}
        </span>
        <div className="actions">
          <button
            type="button"
            onClick={onJumpTop}
            disabled={loadingAll}
            className="wl-occ-jump"
            aria-label={t('ariaJumpTop')}
          >
            <ArrowUp className="size-3" />
            <span>{t('jumpTop')}</span>
          </button>
          <button
            type="button"
            onClick={onJumpEnd}
            disabled={loadingAll}
            className="wl-occ-jump"
            aria-label={t('ariaJumpEnd')}
          >
            <span>{t('jumpEnd')}</span>
            <ArrowDown className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function OccurrenceCard({
  occ,
  showTranslit,
  showTranslation,
}: {
  occ: Occurrence
  showTranslit: boolean
  showTranslation: boolean
}) {
  const [chapterStr, verseStr] = occ.ref.split(':')
  const chapter = Number(chapterStr)
  const verse = Number(verseStr)
  // Occurrence.wi is 1-based per the openapi spec — pass it through unchanged.
  const canPlay =
    occ.wi !== null &&
    Number.isFinite(chapter) &&
    Number.isFinite(verse) &&
    occ.wi > 0
  return (
    <Link href={`/quran/${occ.ref}`} className="wl-occ">
      <div className="lead">
        <span className="ref">{occ.ref}</span>
        {canPlay && (
          <PlayWordButton
            chapter={chapter}
            verse={verse}
            word={occ.wi as number}
            size="sm"
            className="wl-occ-play"
          />
        )}
      </div>
      <div className="body">
        <div className="ar" dir="rtl" lang="ar">
          {highlight(occ.ar, occ.hi, occ.wi)}
        </div>
        {showTranslit && occ.tl && <div className="tl">{occ.tl}</div>}
        {showTranslation && occ.en && <div className="en">{occ.en}</div>}
      </div>
      <span className="arrow">↗</span>
    </Link>
  )
}

function RootMeaning({ meaning }: { meaning: string }) {
  const t = useTranslations('wordLab')
  const [showAll, setShowAll] = useState(false)
  // Senses are separated by `;` in the corpus. Some entries also use `/` and `=`
  // to cluster meanings per surface form (e.g. `مَن = ... / مِن = ...`).
  // We don't try to parse those — when expanded, render the whole string.
  const senses = useMemo(
    () =>
      meaning
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean),
    [meaning],
  )
  const preview = senses.slice(0, 3).join('; ')
  const hasMore = senses.length > 3 || meaning.includes('/') || meaning.includes('=')

  return (
    <div className="wl-meaning">
      <div className="text">{showAll ? meaning : preview}</div>
      {hasMore && (
        <button
          type="button"
          className="wl-meaning-toggle"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? t('showLess') : t('showAll')}
        </button>
      )}
    </div>
  )
}

function Cell({ k, v, ar }: { k: string; v: string; ar?: boolean }) {
  return (
    <div className="wl-morph-cell">
      <div className="k">{k}</div>
      <div className="v" {...(ar ? { dir: 'rtl', lang: 'ar' } : {})}>
        {v}
      </div>
    </div>
  )
}
