// Word Lab — concordance + root search.
// Search Arabic roots by typing Arabic letters OR by typing the Latin
// transliteration (e.g. "ktb" → ك ت ب).  Click a root to see its derivatives,
// occurrence count, and every verse it appears in with the relevant word
// highlighted.  Click a derived word to see its morphology.
const { useState: useStateW, useMemo: useMemoW, useEffect: useEffectW, useRef: useRefW } = React;

// ---------- Latin → Arabic letter map (Buckwalter-ish, simplified) ----------
// Two-letter digraphs first.
const TR_DIGRAPHS = [
  ['kh', 'خ'], ['gh', 'غ'], ['sh', 'ش'], ['th', 'ث'],
  ['dh', 'ذ'], ['ts', 'ث'], ['ph', 'ف'],
];
const TR_SINGLE = {
  a: 'ا', b: 'ب', t: 'ت', j: 'ج', H: 'ح', h: 'ه', d: 'د',
  r: 'ر', z: 'ز', s: 'س', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ',
  c: 'ع', G: 'غ', f: 'ف', q: 'ق', k: 'ك', l: 'ل',
  m: 'م', n: 'ن', w: 'و', y: 'ي', "'": 'ء', '`': 'ع',
};
function toArabicLetters(input) {
  if (!input) return '';
  // detect: if input already contains arabic chars, pass through (strip diacritics).
  const arabicOnly = /[\u0600-\u06FF]/.test(input);
  if (arabicOnly) {
    return input.replace(/[\u064B-\u0652\u0670]/g, '').trim();
  }
  let out = '';
  let s = input.toLowerCase().replace(/[^a-z'`]/gi, '');
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    const dig = TR_DIGRAPHS.find(([k]) => k === two);
    if (dig) { out += dig[1]; i += 2; continue; }
    const ch = s[i];
    if (TR_SINGLE[ch]) out += TR_SINGLE[ch];
    else if (TR_SINGLE[ch.toLowerCase()]) out += TR_SINGLE[ch.toLowerCase()];
    i += 1;
  }
  return out;
}

// ---------- Root corpus (sample) ----------
// Real data would come from a corpus; this is a representative slice for the lab.
const ROOTS = [
  { letters: 'ك ت ب', tr: 'k-t-b', sense: 'to write, prescribe', count: 319,
    derivs: [
      { ar: 'كِتَاب',   tr: 'kitāb',     en: 'book, scripture', count: 230, pos: 'N' },
      { ar: 'كَتَبَ',  tr: 'kataba',    en: 'he wrote',         count: 56,  pos: 'V' },
      { ar: 'مَكْتُوب', tr: 'maktūb',    en: 'written, decreed', count: 22,  pos: 'PASS' },
      { ar: 'كَاتِب',  tr: 'kātib',     en: 'a scribe',         count: 11,  pos: 'N' },
    ],
    occ: [
      { ref: '2:2',   ar: 'ذَٰلِكَ ٱلْكِتَابُ لَا رَيْبَ فِيهِ', en: 'This scripture is infallible.', hi: 'ٱلْكِتَابُ' },
      { ref: '2:282', ar: 'وَلْيَكْتُب بَّيْنَكُمْ كَاتِبٌ بِٱلْعَدْلِ', en: 'A scribe shall write the deal between you, equitably.', hi: 'كَاتِبٌ' },
      { ref: '17:14', ar: 'ٱقْرَأْ كِتَابَكَ كَفَىٰ بِنَفْسِكَ ٱلْيَوْمَ عَلَيْكَ حَسِيبًا', en: 'Read your own record. Today, you suffice as a reckoner against yourself.', hi: 'كِتَابَكَ' },
    ],
    morph: 'فَعَلَ · Form I — triliteral verb. Verbal noun كِتَاب becomes the standard term for written revelation.',
  },
  { letters: 'ر ح م', tr: 'r-H-m', sense: 'mercy, womb, compassion', count: 339,
    derivs: [
      { ar: 'رَحْمَٰن',  tr: 'raḥmān',  en: 'Most Gracious',   count: 57,  pos: 'N' },
      { ar: 'رَحِيم',    tr: 'raḥīm',   en: 'Most Merciful',   count: 95,  pos: 'N' },
      { ar: 'رَحْمَة',   tr: 'raḥmah',  en: 'mercy',           count: 114, pos: 'N' },
      { ar: 'يَرْحَم',   tr: 'yarḥam',  en: 'has mercy',       count: 19,  pos: 'V' },
    ],
    occ: [
      { ref: '1:1',  ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', en: 'In the name of God, Most Gracious, Most Merciful.', hi: 'ٱلرَّحْمَٰنِ' },
      { ref: '21:107', ar: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', en: 'We have not sent you except as mercy from us towards the whole world.', hi: 'رَحْمَةً' },
    ],
    morph: 'Triliteral. The same root carries "womb" (رَحِم) — mercy as the bond of origin.',
  },
  { letters: 'ع ل م', tr: 'c-l-m', sense: 'to know; world', count: 854,
    derivs: [
      { ar: 'عِلْم',     tr: 'ʿilm',    en: 'knowledge',     count: 105, pos: 'N' },
      { ar: 'عَالَم',    tr: 'ʿālam',   en: 'world',         count: 73,  pos: 'N' },
      { ar: 'عَلِيم',    tr: 'ʿalīm',   en: 'all-knowing',   count: 161, pos: 'ADJ' },
      { ar: 'يَعْلَم',   tr: 'yaʿlam',  en: 'knows',         count: 287, pos: 'V' },
      { ar: 'مُعَلِّم',  tr: 'muʿallim',en: 'teacher',       count: 4,   pos: 'N' },
    ],
    occ: [
      { ref: '2:32', ar: 'لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا', en: 'We have no knowledge, except that which You have taught us.', hi: 'عِلْمَ' },
      { ref: '96:5', ar: 'عَلَّمَ ٱلْإِنسَٰنَ مَا لَمْ يَعْلَمْ', en: 'He taught the human what he never knew.', hi: 'يَعْلَمْ' },
    ],
    morph: 'Polysemous. "World" (عَالَم) and "knowledge" (عِلْم) share the root — what is known is the world.',
  },
  { letters: 'ا ل ه', tr: '\'-l-h', sense: 'god, deity', count: 2851,
    derivs: [
      { ar: 'ٱللَّه',  tr: 'allāh',  en: 'God',           count: 2699, pos: 'N' },
      { ar: 'إِلَٰه',  tr: 'ilāh',   en: 'a god',         count: 96,   pos: 'N' },
      { ar: 'ءَالِهَة', tr: 'ālihah', en: 'gods, deities', count: 34,   pos: 'N' },
    ],
    occ: [
      { ref: '112:1', ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', en: 'Proclaim, "He is the One and only God."', hi: 'ٱللَّهُ' },
      { ref: '21:25', ar: 'لَا إِلَٰهَ إِلَّا أَنَا فَٱعْبُدُونِ', en: 'There is no god except Me; you shall worship Me alone.', hi: 'إِلَٰهَ' },
    ],
    morph: 'Definite article ٱل + ٰله contracts to ٱللَّه. The most frequent noun in the Quran.',
  },
  { letters: 'ق ر ا', tr: 'q-r-\'', sense: 'to read, recite; Quran', count: 88,
    derivs: [
      { ar: 'قُرْآن',    tr: 'qurʾān', en: 'Quran, recitation', count: 70, pos: 'N' },
      { ar: 'ٱقْرَأْ',   tr: 'iqraʾ',  en: 'read!',              count: 3,  pos: 'V' },
      { ar: 'قَرَأَ',    tr: 'qaraʾa', en: 'he recited',         count: 17, pos: 'V' },
    ],
    occ: [
      { ref: '96:1', ar: 'ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ', en: 'Read, in the name of your Lord, who created.', hi: 'ٱقْرَأْ' },
      { ref: '17:9', ar: 'إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ', en: 'This Quran guides to the best path.', hi: 'ٱلْقُرْءَانَ' },
    ],
    morph: 'Verbal noun on the pattern فُعْلَان. "That which is recited."',
  },
  { letters: 'ا م ن', tr: '\'-m-n', sense: 'to believe, trust, secure', count: 879,
    derivs: [
      { ar: 'إِيمَان',   tr: 'īmān',    en: 'faith',          count: 45,  pos: 'N' },
      { ar: 'مُؤْمِن',   tr: 'muʾmin',  en: 'believer',       count: 230, pos: 'N' },
      { ar: 'ءَامَن',    tr: 'āmana',   en: 'believed',       count: 537, pos: 'V' },
      { ar: 'أَمَانَة',  tr: 'amānah',  en: 'trust',          count: 6,   pos: 'N' },
      { ar: 'أَمْن',     tr: 'amn',     en: 'security',       count: 5,   pos: 'N' },
    ],
    occ: [
      { ref: '2:3', ar: 'ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ', en: 'who believe in the unseen.', hi: 'يُؤْمِنُونَ' },
    ],
    morph: 'Form IV ءَامَن = "made secure" → believed. Faith and safety from the same root.',
  },
  { letters: 'ن و ر', tr: 'n-w-r', sense: 'light', count: 49,
    derivs: [
      { ar: 'نُور',      tr: 'nūr',    en: 'light',     count: 43, pos: 'N' },
      { ar: 'مُنِير',    tr: 'munīr',  en: 'luminous',  count: 6,  pos: 'ADJ' },
    ],
    occ: [
      { ref: '24:35', ar: 'ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ', en: 'God is the light of the heavens and the earth.', hi: 'نُورُ' },
    ],
    morph: 'Hollow root (middle weak letter و).',
  },
  { letters: 'س ل م', tr: 's-l-m', sense: 'peace, submission', count: 140,
    derivs: [
      { ar: 'إِسْلَام',  tr: 'islām',   en: 'submission', count: 8,  pos: 'N' },
      { ar: 'سَلَام',    tr: 'salām',   en: 'peace',      count: 42, pos: 'N' },
      { ar: 'مُسْلِم',   tr: 'muslim',  en: 'submitter',  count: 42, pos: 'N' },
    ],
    occ: [
      { ref: '3:19', ar: 'إِنَّ ٱلدِّينَ عِندَ ٱللَّهِ ٱلْإِسْلَٰمُ', en: 'The only religion approved by God is Submission.', hi: 'ٱلْإِسْلَٰمُ' },
    ],
    morph: 'Form IV verbal noun. "He surrendered (entered peace)."',
  },
  { letters: 'ف ر ق', tr: 'f-r-q', sense: 'to separate, distinguish', count: 72,
    derivs: [
      { ar: 'فُرْقَان',  tr: 'furqān', en: 'criterion',     count: 7,  pos: 'N' },
      { ar: 'فَرَّق',    tr: 'farraqa', en: 'distinguished', count: 16, pos: 'V' },
      { ar: 'فِرْقَة',   tr: 'firqah',  en: 'a faction',     count: 5,  pos: 'N' },
    ],
    occ: [
      { ref: '25:1', ar: 'تَبَارَكَ ٱلَّذِى نَزَّلَ ٱلْفُرْقَانَ', en: 'Most blessed is the One who revealed the Statute Book.', hi: 'ٱلْفُرْقَانَ' },
    ],
    morph: 'فُعْلَان pattern — "the distinguisher."',
  },
  { letters: 'خ ل ق', tr: 'kh-l-q', sense: 'to create', count: 261,
    derivs: [
      { ar: 'خَلَق',     tr: 'khalaqa', en: 'he created', count: 124, pos: 'V' },
      { ar: 'خَلْق',     tr: 'khalq',   en: 'creation',   count: 52,  pos: 'N' },
      { ar: 'خَالِق',    tr: 'khāliq',  en: 'creator',    count: 8,   pos: 'N' },
      { ar: 'مَخْلُوق',  tr: 'makhlūq', en: 'created',    count: 1,   pos: 'PASS' },
    ],
    occ: [
      { ref: '96:1', ar: 'ٱلَّذِى خَلَقَ', en: 'who created', hi: 'خَلَقَ' },
      { ref: '25:2', ar: 'وَخَلَقَ كُلَّ شَىْءٍ فَقَدَّرَهُۥ تَقْدِيرًا', en: 'He created everything in exact measure.', hi: 'خَلَقَ' },
    ],
    morph: 'Active participle خَالِق, passive مَخْلُوق.',
  },
  { letters: 'ك و ن', tr: 'k-w-n', sense: 'to be, exist', count: 1390,
    derivs: [
      { ar: 'كَانَ',     tr: 'kāna',   en: 'was',          count: 980, pos: 'V' },
      { ar: 'يَكُون',    tr: 'yakūn',  en: 'will be',      count: 391, pos: 'V' },
      { ar: 'مَكَان',    tr: 'makān',  en: 'place',        count: 28,  pos: 'N' },
    ],
    occ: [
      { ref: '36:82', ar: 'إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ', en: 'When He decrees a matter, He simply says to it, "Be," and it is.', hi: 'كُن' },
    ],
    morph: 'Hollow verb. Imperative كُن — the creative command.',
  },
];

// abjadi (Arabic alphabet) order for grouping.
const ABJAD = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];

function WordsPage() {
  const [query, setQuery] = useStateW('');
  const [latinPreview, setLatinPreview] = useStateW('');
  const [sort, setSort] = useStateW('frequency'); // 'frequency' | 'abjadi' | 'reverse'
  const [activeRoot, setActiveRoot] = useStateW(ROOTS[0]);
  const [activeDeriv, setActiveDeriv] = useStateW(0);
  const inputRef = useRefW(null);

  // Convert query to Arabic preview when latin is typed.
  useEffectW(() => {
    if (!query) { setLatinPreview(''); return; }
    const arabicOnly = /[\u0600-\u06FF]/.test(query);
    if (arabicOnly) setLatinPreview('');
    else setLatinPreview(toArabicLetters(query));
  }, [query]);

  // Filter + sort.
  const visible = useMemoW(() => {
    let list = ROOTS.slice();
    const q = query.trim();
    if (q) {
      const arabicOnly = /[\u0600-\u06FF]/.test(q);
      const target = arabicOnly ? q.replace(/\s+/g, '') : toArabicLetters(q);
      if (target) {
        list = list.filter((r) => {
          const flat = r.letters.replace(/\s+/g, '');
          return flat.includes(target) || r.tr.replace(/-/g, '').toLowerCase().includes(q.replace(/\s+/g, '').toLowerCase()) || r.sense.toLowerCase().includes(q.toLowerCase());
        });
      } else {
        list = list.filter((r) => r.sense.toLowerCase().includes(q.toLowerCase()));
      }
    }
    if (sort === 'abjadi') {
      list.sort((a, b) => abjadiCompare(a.letters, b.letters));
    } else if (sort === 'reverse') {
      list.sort((a, b) => abjadiCompare(b.letters, a.letters));
    } else {
      list.sort((a, b) => b.count - a.count);
    }
    return list;
  }, [query, sort]);

  // Keep activeRoot in the visible list when filtering.
  useEffectW(() => {
    if (visible.length && !visible.find((r) => r.letters === activeRoot.letters)) {
      setActiveRoot(visible[0]);
      setActiveDeriv(0);
    }
  }, [visible]);

  // Group by first letter for abjadi view.
  const grouped = useMemoW(() => {
    if (sort !== 'abjadi' && sort !== 'reverse') return null;
    const out = {};
    visible.forEach((r) => {
      const first = r.letters[0];
      out[first] = out[first] || [];
      out[first].push(r);
    });
    return out;
  }, [visible, sort]);

  function highlight(ar, hi) {
    if (!hi) return ar;
    const idx = ar.indexOf(hi);
    if (idx < 0) return ar;
    return (
      <>
        {ar.slice(0, idx)}
        <mark className="words-hl">{hi}</mark>
        {ar.slice(idx + hi.length)}
      </>
    );
  }

  return (
    <PageShell active="words">
      <div className="page-hero">
        <h1 className="page-title">Word <em>lab</em>.</h1>
        <p className="page-lede">Every Arabic root in the Quran, every derived word, every occurrence — searchable by Arabic letters or by their Latin equivalents. Type <span className="qmono">ktb</span> and find <span className="qarab">ك ت ب</span>.</p>
      </div>

      <div className="page-body">
        {/* Search */}
        <section className="words-search">
          <div className="words-search-row">
            <div className="words-search-box">
              <span className="words-search-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a root — try ktb, rHm, slm, or paste Arabic"
                spellCheck={false}
                autoComplete="off"
              />
              {latinPreview && (
                <div className="words-search-preview">
                  <span className="wsp-label">→</span>
                  <span className="wsp-arab">{latinPreview.split('').join(' ')}</span>
                </div>
              )}
              <kbd>⌘K</kbd>
            </div>

            <div className="words-sort">
              <span className="words-sort-label">Sort</span>
              {[
                ['frequency', 'Frequency'],
                ['abjadi', 'Abjadi  ا → ي'],
                ['reverse', 'Reverse  ي → ا'],
              ].map(([k, l]) => (
                <button key={k} className={`words-sort-btn ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Transliteration cheat sheet */}
          <details className="words-cheat">
            <summary>Transliteration key</summary>
            <div className="words-cheat-grid">
              {[
                ['a','ا'],['b','ب'],['t','ت'],['th','ث'],['j','ج'],['H','ح'],['kh','خ'],
                ['d','د'],['dh','ذ'],['r','ر'],['z','ز'],['s','س'],['sh','ش'],['S','ص'],
                ['D','ض'],['T','ط'],['Z','ظ'],['c / `','ع'],['gh','غ'],['f','ف'],['q','ق'],
                ['k','ك'],['l','ل'],['m','م'],['n','ن'],['h','ه'],['w','و'],['y','ي'],["'",'ء'],
              ].map(([lat, ar]) => (
                <div key={lat} className="wcheat">
                  <span className="wcheat-lat">{lat}</span>
                  <span className="wcheat-ar">{ar}</span>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Two-column lab */}
        <div className="words-lab">
          {/* Index */}
          <aside className="words-index">
            <div className="words-index-head">
              <span>Roots</span>
              <span className="words-index-count">{visible.length}</span>
            </div>
            {grouped ? (
              ABJAD.filter((l) => grouped[l]).map((l) => (
                <div key={l} className="words-index-group">
                  <div className="words-index-group-head">
                    <span className="wig-letter">{l}</span>
                    <span className="wig-count">{grouped[l].length}</span>
                  </div>
                  {grouped[l].map((r) => (
                    <RootRow key={r.letters} root={r} active={activeRoot.letters === r.letters}
                      onClick={() => { setActiveRoot(r); setActiveDeriv(0); }} />
                  ))}
                </div>
              ))
            ) : (
              visible.map((r) => (
                <RootRow key={r.letters} root={r} active={activeRoot.letters === r.letters}
                  onClick={() => { setActiveRoot(r); setActiveDeriv(0); }} />
              ))
            )}
            {visible.length === 0 && (
              <div className="words-empty">No roots match. Try the transliteration key below the search.</div>
            )}
          </aside>

          {/* Detail panel */}
          <article className="words-detail">
            <header className="words-detail-head">
              <div className="wdh-top">
                <span className="wdh-kicker">Root</span>
                <span className="wdh-tr">{activeRoot.tr}</span>
                <span className="wdh-count"><strong>{activeRoot.count.toLocaleString()}</strong> occurrences</span>
              </div>
              <div className="wdh-letters" dir="rtl" lang="ar">{activeRoot.letters}</div>
              <div className="wdh-sense">{activeRoot.sense}</div>
              <div className="wdh-morph">{activeRoot.morph}</div>
            </header>

            {/* Derivative chips */}
            <section className="words-section">
              <div className="words-section-head">
                <span className="wsh-num">01</span>
                <span className="wsh-title">Derived forms</span>
                <span className="wsh-count">{activeRoot.derivs.length}</span>
              </div>
              <div className="words-derivs">
                {activeRoot.derivs.map((d, i) => (
                  <button key={i} onClick={() => setActiveDeriv(i)}
                    className={`words-deriv ${activeDeriv === i ? 'on' : ''}`}>
                    <div className="wd-ar" dir="rtl" lang="ar">{d.ar}</div>
                    <div className="wd-tr">{d.tr}</div>
                    <div className="wd-en">{d.en}</div>
                    <div className="wd-meta">
                      <span className="wd-pos">{d.pos}</span>
                      <span className="wd-count">{d.count}×</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Occurrences */}
            <section className="words-section">
              <div className="words-section-head">
                <span className="wsh-num">02</span>
                <span className="wsh-title">Occurrences</span>
                <span className="wsh-count">showing {activeRoot.occ.length} of {activeRoot.count.toLocaleString()}</span>
              </div>
              <div className="words-occ-list">
                {activeRoot.occ.map((o) => (
                  <a key={o.ref} href="quran.html" className="words-occ">
                    <span className="wo-ref">{o.ref}</span>
                    <div className="wo-body">
                      <div className="wo-ar" dir="rtl" lang="ar">{highlight(o.ar, o.hi)}</div>
                      <div className="wo-en">{o.en}</div>
                    </div>
                    <span className="wo-arrow">↗</span>
                  </a>
                ))}
              </div>
            </section>

            {/* Morphology of the active derivative */}
            <section className="words-section">
              <div className="words-section-head">
                <span className="wsh-num">03</span>
                <span className="wsh-title">Morphology of <span className="qarab">{activeRoot.derivs[activeDeriv]?.ar}</span></span>
              </div>
              <div className="words-morph-grid">
                <div className="wmg-cell"><div className="wmg-k">Lemma</div><div className="wmg-v" dir="rtl" lang="ar">{activeRoot.derivs[activeDeriv]?.ar}</div></div>
                <div className="wmg-cell"><div className="wmg-k">Translit.</div><div className="wmg-v">{activeRoot.derivs[activeDeriv]?.tr}</div></div>
                <div className="wmg-cell"><div className="wmg-k">Gloss</div><div className="wmg-v">{activeRoot.derivs[activeDeriv]?.en}</div></div>
                <div className="wmg-cell"><div className="wmg-k">POS</div><div className="wmg-v">{posLabel(activeRoot.derivs[activeDeriv]?.pos)}</div></div>
                <div className="wmg-cell"><div className="wmg-k">Root</div><div className="wmg-v" dir="rtl" lang="ar">{activeRoot.letters}</div></div>
                <div className="wmg-cell"><div className="wmg-k">Count</div><div className="wmg-v">{activeRoot.derivs[activeDeriv]?.count}×</div></div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </PageShell>
  );
}

function RootRow({ root, active, onClick }) {
  return (
    <button onClick={onClick} className={`words-row ${active ? 'on' : ''}`}>
      <span className="wr-ar" dir="rtl" lang="ar">{root.letters}</span>
      <span className="wr-mid">
        <span className="wr-tr">{root.tr}</span>
        <span className="wr-sense">{root.sense}</span>
      </span>
      <span className="wr-count">{root.count.toLocaleString()}</span>
    </button>
  );
}

function posLabel(p) {
  return ({ V: 'Verb', N: 'Noun', ADJ: 'Adjective', PASS: 'Passive part.', PRO: 'Pronoun', NEG: 'Negation', P: 'Particle', REL: 'Relative' }[p]) || p;
}

// abjadi-order comparison: compare letter-by-letter using Arabic alphabet index.
function abjadiCompare(a, b) {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  for (let i = 0; i < Math.min(al.length, bl.length); i++) {
    const ai = ABJAD.indexOf(al[i]);
    const bi = ABJAD.indexOf(bl[i]);
    if (ai !== bi) return ai - bi;
  }
  return al.length - bl.length;
}

Object.assign(window, { WordsPage });
