'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ABJAD,
  abjadiCompare,
  toArabicLetters,
} from '@/lib/transliteration'
import {
  filterRoots,
  useRootsIndex,
  type Occurrence,
  type RootRecord,
} from '@/hooks/use-roots-index'
import './word-lab.css'

type SortMode = 'frequency' | 'abjadi' | 'reverse'

const CHEAT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['a', 'ا'], ['b', 'ب'], ['t', 'ت'], ['th', 'ث'], ['j', 'ج'], ['H', 'ح'], ['kh', 'خ'],
  ['d', 'د'], ['dh', 'ذ'], ['r', 'ر'], ['z', 'ز'], ['s', 'س'], ['sh', 'ش'], ['S', 'ص'],
  ['D', 'ض'], ['T', 'ط'], ['Z', 'ظ'], ['c / `', 'ع'], ['gh', 'غ'], ['f', 'ف'], ['q', 'ق'],
  ['k', 'ك'], ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['h', 'ه'], ['w', 'و'], ['y', 'ي'], ["'", 'ء'],
]

function highlight(ar: string, hi: string): React.ReactNode {
  if (!hi) return ar
  const idx = ar.indexOf(hi)
  if (idx < 0) return ar
  return (
    <>
      {ar.slice(0, idx)}
      <mark className="wl-hl">{hi}</mark>
      {ar.slice(idx + hi.length)}
    </>
  )
}

export function WordLab() {
  const { status, data, error } = useRootsIndex()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('frequency')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [activeDeriv, setActiveDeriv] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const arabicTarget = useMemo(() => toArabicLetters(query), [query])
  const showPreview = useMemo(
    () => query.length > 0 && !/[؀-ۿ]/.test(query) && arabicTarget.length > 0,
    [query, arabicTarget],
  )

  const visible = useMemo(() => {
    if (!data) return []
    const filtered = filterRoots(data, query, arabicTarget)
    const list = [...filtered]
    if (sort === 'abjadi') {
      list.sort((a, b) => abjadiCompare(a.letters, b.letters))
    } else if (sort === 'reverse') {
      list.sort((a, b) => abjadiCompare(b.letters, a.letters))
    } else {
      list.sort((a, b) => b.count - a.count)
    }
    return list
  }, [data, query, arabicTarget, sort])

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
      setActiveKey(activeRoot.letters)
      setActiveDeriv(0)
    }
  }, [activeRoot, activeKey])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="wl-page">
        <Hero />
        <div className="wl-loading">Building roots index from the corpus — this happens once.</div>
      </div>
    )
  }
  if (status === 'error' || !data) {
    return (
      <div className="wl-page">
        <Hero />
        <div className="wl-loading">{error ?? 'Failed to build roots index.'}</div>
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a root — try ktb, rHm, slm, or paste Arabic"
              spellCheck={false}
              autoComplete="off"
              aria-label="Search Quranic roots"
            />
            {showPreview && (
              <div className="wl-search-preview" aria-live="polite">
                <span className="wl-search-preview-label">→</span>
                <span className="wl-search-preview-arab">{Array.from(arabicTarget).join(' ')}</span>
              </div>
            )}
            <kbd>⌘K</kbd>
          </div>

          <div className="wl-sort" role="radiogroup" aria-label="Sort roots">
            <span className="wl-sort-label">Sort</span>
            {([
              ['frequency', 'Frequency'],
              ['abjadi', 'Abjadi  ا → ي'],
              ['reverse', 'Reverse  ي → ا'],
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

        <details className="wl-cheat">
          <summary>Transliteration key</summary>
          <div className="wl-cheat-grid">
            {CHEAT_PAIRS.map(([lat, ar]) => (
              <div key={lat} className="wl-cheat-cell">
                <span className="lat">{lat}</span>
                <span className="ar">{ar}</span>
              </div>
            ))}
          </div>
        </details>
      </section>

      <div className="wl-lab">
        <aside className="wl-index">
          <div className="wl-index-head">
            <span>Roots</span>
            <span className="wl-index-count">{visible.length}</span>
          </div>
          {grouped ? (
            ABJAD.filter((l) => grouped[l]?.length).map((letter) => (
              <div key={letter} className="wl-index-group">
                <div className="wl-index-group-head">
                  <span className="letter">{letter}</span>
                  <span className="count">{grouped[letter]!.length}</span>
                </div>
                {grouped[letter]!.map((r) => (
                  <RootRow
                    key={r.letters}
                    root={r}
                    active={activeRoot?.letters === r.letters}
                    onClick={() => {
                      setActiveKey(r.letters)
                      setActiveDeriv(0)
                    }}
                  />
                ))}
              </div>
            ))
          ) : (
            visible.map((r) => (
              <RootRow
                key={r.letters}
                root={r}
                active={activeRoot?.letters === r.letters}
                onClick={() => {
                  setActiveKey(r.letters)
                  setActiveDeriv(0)
                }}
              />
            ))
          )}
          {visible.length === 0 && (
            <div className="wl-empty">No roots match. Try the transliteration key below the search.</div>
          )}
        </aside>

        {activeRoot && <Detail root={activeRoot} activeDeriv={activeDeriv} setActiveDeriv={setActiveDeriv} />}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <header className="wl-hero">
      <h1 className="wl-title">
        Word <em>lab</em>.
      </h1>
      <p className="wl-lede">
        Every Arabic root in the Quran, every derived word, every occurrence — searchable by Arabic letters or by their
        Latin equivalents. Type <span className="wl-mono">ktb</span> and find <span className="wl-arab">ك ت ب</span>.
      </p>
    </header>
  )
}

function RootRow({
  root,
  active,
  onClick,
}: {
  root: RootRecord
  active: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className={`wl-row ${active ? 'on' : ''}`}>
      <span className="ar" dir="rtl" lang="ar">
        {root.letters}
      </span>
      <span className="mid">
        <span className="tr">{root.tr}</span>
        <span className="sense">{root.derivs[0]?.ar ?? ''}</span>
      </span>
      <span className="num">{root.count.toLocaleString()}</span>
    </button>
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
  const deriv = root.derivs[activeDeriv] ?? root.derivs[0]
  return (
    <article className="wl-detail">
      <header className="wl-detail-head">
        <div className="top">
          <span className="kicker">Root</span>
          <span className="tr">{root.tr}</span>
          <span className="count">
            <strong>{root.count.toLocaleString()}</strong> occurrences
          </span>
        </div>
        <div className="letters" dir="rtl" lang="ar">
          {root.letters}
        </div>
      </header>

      <section className="wl-section">
        <div className="wl-section-head">
          <span className="num">01</span>
          <span className="title">Derived forms</span>
          <span className="sub">{root.derivs.length}</span>
        </div>
        <div className="wl-derivs">
          {root.derivs.map((d, i) => (
            <button
              key={d.ar}
              onClick={() => setActiveDeriv(i)}
              className={`wl-deriv ${activeDeriv === i ? 'on' : ''}`}
            >
              <div className="ar" dir="rtl" lang="ar">
                {d.ar}
              </div>
              <div className="meta">
                <span>—</span>
                <span>{d.count}×</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="wl-section">
        <div className="wl-section-head">
          <span className="num">02</span>
          <span className="title">Occurrences</span>
          <span className="sub">
            showing {root.occ.length} of {root.count.toLocaleString()}
          </span>
        </div>
        <div className="wl-occ-list">
          {root.occ.map((o) => (
            <OccurrenceCard key={`${o.ref}-${o.hi}`} occ={o} />
          ))}
        </div>
      </section>

      {deriv && (
        <section className="wl-section">
          <div className="wl-section-head">
            <span className="num">03</span>
            <span className="title">
              Morphology of <span className="wl-arab">{deriv.ar}</span>
            </span>
          </div>
          <div className="wl-morph-grid">
            <Cell k="Lemma" v={deriv.ar} ar />
            <Cell k="Translit." v="—" />
            <Cell k="Gloss" v="—" />
            <Cell k="POS" v="—" />
            <Cell k="Root" v={root.letters} ar />
            <Cell k="Count" v={`${deriv.count}×`} />
          </div>
        </section>
      )}
    </article>
  )
}

function OccurrenceCard({ occ }: { occ: Occurrence }) {
  return (
    <Link href={`/quran/${occ.ref}`} className="wl-occ">
      <span className="ref">{occ.ref}</span>
      <div className="body">
        <div className="ar" dir="rtl" lang="ar">
          {highlight(occ.ar, occ.hi)}
        </div>
        {occ.en && <div className="en">{occ.en}</div>}
      </div>
      <span className="arrow">↗</span>
    </Link>
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
