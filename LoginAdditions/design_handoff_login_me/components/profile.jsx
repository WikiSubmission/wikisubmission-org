// profile.jsx — /me page, desktop + mobile, heavy + new (empty state)

function ProfileHeader({ user, mobile }) {
  if (mobile) {
    return (
      <div className="profile-mast-mobile">
        <div className="profile-mast-eyebrow">
          <span className="dot" /> Vol. {user.joined} · Reader
        </div>
        <h1>{user.name.split(' ')[0]} <em>{user.name.split(' ').slice(1).join(' ')}</em></h1>
        <div className="profile-mast-meta" style={{ marginTop: 8 }}>
          <span>{user.email}</span>
          <span className="sep">·</span>
          <a href="#">Edit profile</a>
        </div>
      </div>
    );
  }
  return (
    <div className="profile-mast">
      <div>
        <div className="profile-mast-eyebrow"><span className="dot" /> Vol. {user.joined} · Reader’s Edition</div>
        <h1>{user.name.split(' ')[0]} <em>{user.name.split(' ').slice(1).join(' ')}</em></h1>
        <div className="profile-mast-meta">
          <span>{user.email}</span>
          <span className="sep">·</span>
          <span>@{user.handle}</span>
          <span className="sep">·</span>
          <a href="#">Edit profile</a>
          <span className="sep">·</span>
          <a href="#">Settings</a>
        </div>
      </div>
      <div className="profile-mast-side">
        <div className="profile-mast-vol">— Member since April —</div>
        <div className="profile-mast-vol" style={{ fontStyle: 'normal', fontFamily: 'var(--font-glacial)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ed-fg-muted)' }}>
          Last read · 2 hours ago
        </div>
      </div>
    </div>
  );
}

function StatsRow({ stats, mobile }) {
  const items = [
    { eyebrow: 'Quran streak', num: stats.streakQuran, unit: 'days', sub: 'Unbroken since Feb 22.' },
    { eyebrow: 'Longest streak', num: stats.streakLongest, unit: 'days', sub: 'Through Ramadan, 2026.' },
    { eyebrow: 'Notes',     num: stats.notes, sub: 'Across both scriptures.' },
    { eyebrow: 'Bookmarks', num: stats.bookmarks, sub: 'In 8 categories.' },
  ];
  return (
    <div className={mobile ? 'stats-mobile' : 'stats'}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="stat-eyebrow">{it.eyebrow}</div>
          <div className="stat-num">
            {it.num}{it.unit && <span className="unit">{it.unit}</span>}
          </div>
          {!mobile && <div className="stat-sub">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function CoverToCover({ c2c, mobile }) {
  const card = (s, k) => (
    <div className="c2c-card" key={k}>
      <div className="c2c-head">
        <div className="c2c-title">{s.label}</div>
        <div className="c2c-mono">{k} · {s.percent}%</div>
      </div>
      <div className="c2c-progress">
        <div className="c2c-progress-bar thick"><span style={{ width: `${s.percent}%` }} /></div>
        <div className="c2c-progress-meta">
          <span>{k === 'Quran' ? `Currently at ${s.chapter}:${s.verse}` : `Currently at ${s.chapter}:${s.verse}`}</span>
          <span>{k === 'Quran' ? `${s.chapter} of ${s.totalChapters}` : '40 of 66 books'}</span>
        </div>
      </div>
      <blockquote className="c2c-pull">
        “{s.verseQuote}”
        <cite>{k === 'Quran' ? `${s.chapter}:${s.verse}` : `${s.chapter}:${s.verse}`}</cite>
      </blockquote>
      <div className="c2c-foot">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IFlame size={12} /> 47-day streak
        </span>
        <a href="#" className="c2c-continue">Continue reading</a>
      </div>
    </div>
  );
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-roman">§ I</span>
        <h2 className="section-title">Cover <em>to</em> cover</h2>
        <span className="section-spacer" />
        <span className="section-eyebrow">two scriptures</span>
      </div>
      <div className={'c2c-grid ' + (mobile ? 'c2c-grid-mobile' : '')}>
        {card(c2c.quran, 'Quran')}
        {card(c2c.bible, 'Bible')}
      </div>
    </section>
  );
}

function CategoriesSection({ categories, mobile }) {
  const list = mobile ? categories.slice(0, 6) : categories;
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-roman">§ II</span>
        <h2 className="section-title">Bookmarks · <em>by category</em></h2>
        <span className="section-spacer" />
        <button className="section-action"><IPlus size={12} /> New category</button>
      </div>
      <div className={'cat-grid ' + (mobile ? 'cat-grid-mobile' : '')}>
        {list.map(cat => (
          <a className="cat-row" key={cat.id} href="#">
            <span className="cat-mark" style={{ background: cat.color }} />
            <div>
              <div className="cat-name">
                {cat.name}
                <span className="num">{String(cat.count).padStart(3, '0')}</span>
              </div>
              <div className="cat-preview">{cat.preview}</div>
            </div>
            <span className="cat-action">Open →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function NotesSection({ notes, mobile }) {
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-roman">§ III</span>
        <h2 className="section-title">Notes <em>&amp; marginalia</em></h2>
        <span className="section-spacer" />
        <a className="section-action-link" href="#">Open all {SAMPLE.stats.notes} →</a>
      </div>
      <p style={{
        fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
        fontSize: 17, color: 'var(--ed-fg-muted)', maxWidth: '52ch',
        margin: '-12px 0 20px',
      }}>
        Marginalia you’ve written on verses across both scriptures. Markdown, tags, and cross-references all stay searchable.
      </p>
      <div className={'notes-preview ' + (mobile ? 'mobile' : '')}>
        {notes.slice(0, mobile ? 2 : 4).map((n, i) => (
          <a className="note-card" href="#" key={i}>
            <div className="note-card-head">
              {n.key}
              <span className="date">{n.date}</span>
            </div>
            <p className="note-card-quote">
              {n.key === '36:5' && '“This revelation is from the Almighty, Most Merciful.”'}
              {n.key === '36:6' && '“To warn people whose ancestors were never warned…”'}
              {n.key === '2:62'  && '“Surely, those who believe… shall receive their recompense from their Lord.”'}
              {n.key === '74:30' && '“Over it is nineteen.”'}
            </p>
            <p className="note-card-body">{n.body}</p>
            <div className="note-card-foot">
              <span className="tag-chip is-on">{n.tag}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function CollectionsSection({ collections }) {
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-roman">§ IV</span>
        <h2 className="section-title">Collections</h2>
        <span className="section-spacer" />
        <a className="section-action-link" href="#">View all {collections.length} →</a>
      </div>
      <p style={{
        fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
        fontSize: 17, color: 'var(--ed-fg-muted)', maxWidth: '52ch',
        margin: '-12px 0 20px',
      }}>
        Curated series of verses you can share with anyone via a link. Make them public to invite others, or keep them private.
      </p>
      <div className="coll-list">
        {collections.map((c, i) => (
          <a className="coll-row" key={i} href="#">
            <span className="coll-num">§ {c.num}</span>
            <div>
              <h3 className="coll-title">{c.name}</h3>
              {c.desc && <p className="coll-desc">{c.desc}</p>}
            </div>
            <span className="coll-meta">{c.count} verses</span>
            {c.isPublic
              ? <span className="coll-public">Public</span>
              : <span className="coll-public" style={{ color: 'var(--ed-fg-muted)', borderColor: 'var(--ed-rule)' }}>Private</span>}
          </a>
        ))}
      </div>
    </section>
  );
}

function SignOut() {
  return (
    <div className="signout">
      <button>Sign out of WikiSubmission</button>
      <span className="signout-meta">Signed in via Magic link</span>
    </div>
  );
}

// -------- Empty state for a brand-new user --------
function NewUserHello({ mobile }) {
  return (
    <div className="empty" style={{ padding: mobile ? '32px 18px' : '64px 32px' }}>
      <div className="empty-glyph">§</div>
      <div style={{ fontFamily: 'var(--font-glacial)', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ed-accent)' }}>
        Welcome
      </div>
      <p className="empty-title">Your reading begins here.</p>
      <p className="empty-verse">
        “Read what you can of the Quran. He knew that some of you would be ill, others traveling in the land seeking God’s bounty…”
      </p>
      <span className="empty-cite">73:20</span>
      <a className="empty-cta" href="#">Open chapter one →</a>
    </div>
  );
}

function NewUserStarter({ mobile }) {
  return (
    <div className="page-mobile" style={mobile ? {} : { maxWidth: 720, margin: '0 auto', padding: '56px 40px 96px' }}>
      <ProfileHeader user={SAMPLE.user} mobile={mobile} />

      {/* zero stats — show as eyebrow row */}
      <div className={mobile ? 'stats-mobile' : 'stats'}>
        {['Quran streak', 'Longest streak', 'Notes', 'Bookmarks'].map((eb, i) => (
          <div key={i}>
            <div className="stat-eyebrow">{eb}</div>
            <div className="stat-num" style={{ color: 'var(--ed-fg-muted)' }}>0</div>
            {!mobile && <div className="stat-sub">— begin to fill these in.</div>}
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-roman">§ I</span>
          <h2 className="section-title">Begin <em>to read</em></h2>
        </div>
        <NewUserHello mobile={mobile} />
      </div>

      <section className="section compact-gap">
        <div className="section-head">
          <span className="section-roman">§ II</span>
          <h2 className="section-title">Three <em>first steps</em></h2>
        </div>
        <div style={{
          display: 'grid', gap: 1,
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
          background: 'var(--ed-rule)',
          border: '1px solid var(--ed-rule)',
        }}>
          {[
            { num: 'I', title: 'Open a chapter', body: 'Use the search bar or pick from the table of contents. Reading 5 verses today starts your streak.' },
            { num: 'II', title: 'Bookmark a verse', body: 'Tap the bookmark icon. Categories like “Patience” or “Monotheism” are yours to invent.' },
            { num: 'III', title: 'Write a note', body: 'In the margin of any verse. Markdown, tags, and references to other verses all work.' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--ed-bg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="coll-num">§ {s.num}</span>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: '-0.015em' }}>{s.title}</h3>
              <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: 14, color: 'var(--ed-fg-muted)', lineHeight: 1.55, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SignOut />
    </div>
  );
}

function HeavyUser({ mobile, density = 'comfy' }) {
  const cls = mobile ? 'page-mobile' : 'page';
  const dCls = density === 'compact' ? ' compact' : (density === 'spacious' ? ' spacious' : '');
  return (
    <div className={cls + dCls}>
      <ProfileHeader user={SAMPLE.user} mobile={mobile} />
      <StatsRow stats={SAMPLE.stats} mobile={mobile} />
      <CoverToCover c2c={SAMPLE.c2c} mobile={mobile} />
      <CategoriesSection categories={SAMPLE.categories} mobile={mobile} />
      <NotesSection notes={SAMPLE.notes} mobile={mobile} />
      <CollectionsSection collections={SAMPLE.collections} />
      <SignOut />
    </div>
  );
}

function MePage({ state = 'heavy', mobile = false, density = 'comfy' }) {
  if (state === 'new') {
    return <NewUserStarter mobile={mobile} />;
  }
  return <HeavyUser mobile={mobile} density={density} />;
}

Object.assign(window, { MePage, HeavyUser, NewUserStarter });
