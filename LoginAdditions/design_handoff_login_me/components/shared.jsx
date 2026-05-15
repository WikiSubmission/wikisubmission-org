// shared.jsx — sample data, browser/iOS frames, mini reader card, etc.

const SAMPLE = {
  user: {
    name: 'Agent Forty-Seven',
    handle: 'agent-47',
    email: 'a47@wikisubmission.org',
    initial: 'A',
    joined: 'IV · MMXXVI',
  },
  stats: {
    streakQuran: 47,
    streakLongest: 112,
    notes: 38,
    bookmarks: 214,
  },
  c2c: {
    quran: { chapter: 36, verse: 18, percent: 31, totalChapters: 114, label: 'Yā Sīn', verseQuote: 'They said, "Your omen depends on what you have chosen to do; you are a transgressing people."' },
    bible: { chapter: 'Isaiah 40', verse: 31, percent: 52, label: 'Isaiah', verseQuote: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
  },
  categories: [
    { id: 'monotheism', name: 'Monotheism', color: '#6B3410', count: 42, preview: 'Your god is one god; there is no god except He, the Most Gracious, Most Merciful. (2:163)' },
    { id: 'patience',   name: 'Patience & sabr', color: '#9F6B2C', count: 31, preview: 'Surely with hardship comes ease. (94:6)' },
    { id: 'family',     name: 'Family & lineage', color: '#5A4A2A', count: 18, preview: 'And we made him in his old age, a prophet — Isaac. (37:112)' },
    { id: 'eschatology',name: 'Eschatology', color: '#8C2C2C', count: 24, preview: 'When the sun is rolled up. (81:1)' },
    { id: 'science',    name: 'Mathematical signs', color: '#2C5A4A', count: 12, preview: 'Over it is nineteen. (74:30)' },
    { id: 'salat',      name: 'Salat & worship', color: '#3A4F8C', count: 27, preview: 'Recite what is revealed to you of the scripture, and observe the contact prayer. (29:45)' },
    { id: 'study',      name: 'For tomorrow', color: '#6B6B68', count: 6, preview: 'Verses to come back to.' },
    { id: 'inheritance',name: 'Inheritance law', color: '#3D6B3A', count: 14, preview: 'God decrees a will for the benefit of your children… (4:11)' },
  ],
  collections: [
    { num: 'I',   name: 'Verses for grief', desc: 'Eight passages collected after my mother passed.', count: 8, isPublic: true },
    { num: 'II',  name: 'Mathematical miracle (19) — first reading', desc: 'A linear path through Code 19, for friends new to Submission.', count: 24, isPublic: true },
    { num: 'III', name: 'For Friday gatherings', desc: '', count: 12, isPublic: false },
    { num: 'IV',  name: 'Counter-arguments to idol worship', desc: 'Notes from study circle, Q1.', count: 19, isPublic: false },
  ],
  verses: [
    { key: '36:1', body: 'Y. S.', arabic: 'يس', isBookmarked: false },
    { key: '36:2', body: 'And the Quran that is full of wisdom.', arabic: '', isBookmarked: false },
    { key: '36:3', body: 'Most assuredly, you (Rashad) are one of the messengers.', isBookmarked: false },
    { key: '36:4', body: 'On a straight path.', isBookmarked: false },
    { key: '36:5', body: 'This revelation is from the Almighty, Most Merciful.', isBookmarked: true, color: '#6B3410', hasNote: true },
    { key: '36:6', body: 'To warn people whose ancestors were never warned, and therefore, they are unaware.', isBookmarked: false, hasNote: true },
    { key: '36:7', body: 'It has been predetermined that most of them do not believe.', isBookmarked: true, color: '#3A4F8C' },
    { key: '36:8', body: 'For we place around their necks shackles, up to their chins. Consequently, they become locked in their disbelief.', isBookmarked: false },
    { key: '36:9', body: 'And we place a barrier in front of them, and a barrier behind them, and thus, we veil them; they cannot see.', isBookmarked: false },
  ],
  notes: [
    { key: '36:5', tag: 'tafsir', body: 'Cf. 36:69-70 — the rejection of poetry framing reasserts the Quran as a “reminder.” Worth pulling 39:18 and 39:55 alongside on a re-read.', date: '2 days ago' },
    { key: '36:6', tag: 'study', body: 'Compare with Deuteronomy 18:18 — “a Prophet from among their brethren.” The structural parallel (people unwarned → messenger raised) shows up in both.', date: '2 days ago' },
    { key: '2:62',  tag: 'tafsir', body: 'Defining verse on universal acceptance. Notable that Abraham (3:67) is described with exactly the same word — *muslim* — predating the Arabic preaching by two thousand years.', date: 'last week' },
    { key: '74:30', tag: 'study', body: '“Over it is nineteen.” The opening to Code 19. Pull Rashad’s 1974 paper and align verse counts in 9:128–129.', date: 'last week' },
  ],
};

// ---------- Browser frame (compact, used inside artboards) ----------
function MiniBrowser({ url = 'wikisubmission.org/me', children, mode = 'light', height }) {
  const isDark = mode === 'dark';
  const chromeBg = isDark ? '#1a1815' : '#e7e1d3';
  const chromeFg = isDark ? '#9A8C75' : '#6E6557';
  const chromeRule = isDark ? '#2A241E' : '#D9CFB9';
  return (
    <div style={{
      borderRadius: 4,
      border: `1px solid ${chromeRule}`,
      overflow: 'hidden',
      background: isDark ? '#14110E' : '#F6F2EA',
      display: 'flex', flexDirection: 'column',
      height: height || '100%',
    }}>
      <div style={{
        height: 32, background: chromeBg, borderBottom: `1px solid ${chromeRule}`,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
        flex: '0 0 32px',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#E0726E', '#E0B763', '#7CB36F'].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: c, opacity: 0.9 }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: 20, borderRadius: 2,
          background: isDark ? '#0F0D0B' : '#FBF8F1',
          border: `1px solid ${chromeRule}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5,
          color: chromeFg, letterSpacing: '0.04em',
        }}>{url}</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ---------- iPhone frame (compact) ----------
function MiniPhone({ children, mode = 'light' }) {
  const isDark = mode === 'dark';
  const bezel = isDark ? '#0a0908' : '#1a1714';
  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 36,
      background: bezel,
      padding: 8,
      boxShadow: `0 0 0 1px ${isDark ? '#2A241E' : '#3a302a'}, 0 0 0 4px ${isDark ? '#1a1815' : '#2a241f'}`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        background: 'var(--ed-bg)',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* status bar */}
        <div style={{
          flex: '0 0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px 6px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: 'var(--ed-fg)', position: 'relative',
        }}>
          <span style={{ fontWeight: 600 }}>9:41</span>
          {/* notch */}
          <span style={{
            position: 'absolute', left: '50%', top: 6,
            transform: 'translateX(-50%)',
            width: 92, height: 22, borderRadius: 14,
            background: bezel,
          }} />
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 16, height: 9, border: '1px solid currentColor', borderRadius: 2, position: 'relative' }}>
              <span style={{ position: 'absolute', inset: '1px 9px 1px 1px', background: 'currentColor' }} />
            </span>
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>{children}</div>
        {/* home indicator */}
        <div style={{
          flex: '0 0 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            width: 120, height: 4, borderRadius: 4,
            background: 'var(--ed-fg)',
          }} />
        </div>
      </div>
    </div>
  );
}

// ---------- Site nav (desktop reproduction of wikisubmission.org top bar) ----------
function SiteNav({ active = 'me', avatarInitial = 'A' }) {
  const items = ['Home', 'Quran', 'Bible', 'Words', 'Tools', 'Blog'];
  const map = { home: 'Home', quran: 'Quran', bible: 'Bible', words: 'Words', tools: 'Tools', blog: 'Blog' };
  const activeLabel = map[active];
  return (
    <nav className="site-nav">
      <div className="site-nav-mark">
        <img src="assets/logo-transparent.png" alt="" />
        <span>WikiSubmission</span>
      </div>
      <div className="site-nav-links">
        {items.map(i => <span key={i} className={i === activeLabel ? 'is-active' : ''}>{i}</span>)}
      </div>
      <div className="site-nav-right">
        <span style={{ color: 'var(--ed-fg-muted)' }}><ISearch size={14} /></span>
        <span className="site-nav-avatar">{avatarInitial}</span>
      </div>
    </nav>
  );
}

// ---------- Phone reader nav ----------
function PhoneNav({ title = 'Yā Sīn', sub = '36 · MAKKAN · 83 VERSES', back = true }) {
  return (
    <div style={{
      flex: '0 0 auto',
      padding: '12px 16px 14px',
      borderBottom: '1px solid var(--ed-rule)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--ed-bg)',
    }}>
      {back && <button style={{ background: 'transparent', border: 0, color: 'var(--ed-fg-muted)', padding: 2 }}><IChevL size={16} /></button>}
      <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-glacial)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ed-fg-muted)' }}>{sub}</span>
      </div>
      <button style={{ background: 'transparent', border: 0, color: 'var(--ed-fg-muted)' }}><ISearch size={16} /></button>
    </div>
  );
}

Object.assign(window, { SAMPLE, MiniBrowser, MiniPhone, SiteNav, PhoneNav });
