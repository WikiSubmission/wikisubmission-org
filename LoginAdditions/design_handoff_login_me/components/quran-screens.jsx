// quran-screens.jsx — bookmarks UI + notes UI in /quran reader context

function ReaderToolbar({ chapter = 'Yā Sīn · 36', mode = 'desktop' }) {
  return (
    <div className="reader-toolbar">
      <div className="crumb">
        <span>Quran</span><span style={{ color: 'var(--ed-rule)' }}>·</span>
        <b>{chapter}</b>
      </div>
      <span className="reader-toolbar-spacer" />
      <div className="reader-toolbar-icons">
        <button title="Search"><ISearch size={14} /></button>
        <button title="Listen"><IHeadphones size={14} /></button>
        <button title="Settings"><ISettings size={14} /></button>
      </div>
    </div>
  );
}

function VerseRow({ v, selected, multiSelect }) {
  return (
    <div className={'verse' + (v.isBookmarked ? ' is-bookmarked' : '') + (v.hasNote ? ' has-note' : '') + (selected ? ' is-selected' : '')}
         style={v.color ? { '--cat-color': v.color } : {}}>
      <div className="verse-num">
        {multiSelect && (
          <span style={{
            display: 'inline-flex', width: 14, height: 14,
            border: `1px solid ${selected ? 'var(--ed-accent)' : 'var(--ed-rule)'}`,
            background: selected ? 'var(--ed-accent)' : 'transparent',
            color: 'var(--ed-bg)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>{selected && <ICheck size={10} />}</span>
        )}
        <div>{v.key}</div>
      </div>
      <div className="verse-body">{v.body}</div>
      <div className="verse-actions">
        <button className={v.isBookmarked ? 'is-on' : ''}>
          {v.isBookmarked ? <IBookmarkFill size={13} /> : <IBookmark size={13} />}
        </button>
        <button className={v.hasNote ? 'is-on' : ''}><INote size={13} /></button>
        <button><ICopy size={13} /></button>
      </div>
    </div>
  );
}

function SuraMast() {
  return (
    <div className="sura-mast">
      <div className="roman">§ XXXVI</div>
      <h1>Yā Sīn</h1>
      <div className="arabic">يس</div>
      <div className="meta">
        <span>Sura 36</span>
        <span className="sep">·</span>
        <span>Makkan</span>
        <span className="sep">·</span>
        <span>83 verses</span>
      </div>
    </div>
  );
}

// -------- Variant A: bookmark category picker as side sheet --------
function QuranWithBookmarkSheet({ mode = 'desktop' }) {
  const verses = SAMPLE.verses;
  const cats = SAMPLE.categories.slice(0, 6);
  return (
    <div className="reader" style={{ position: 'relative' }}>
      <ReaderToolbar />
      <div className="reader-stage">
        <div className="frame-scroll">
          <div className="frame-scroll-inner">
            <div className="reader-page">
              <SuraMast />
              {verses.map((v, i) => (
                <VerseRow key={v.key} v={i === 4 ? { ...v, isBookmarked: false } : v} />
              ))}
            </div>
          </div>
        </div>

        <div className="sheet">
          <div className="sheet-head">
            <span className="sheet-eyebrow">Bookmark · 36:5</span>
            <h3 className="sheet-title">Add to a category</h3>
            <div className="sheet-sub">“This revelation is from the Almighty, Most Merciful.”</div>
          </div>
          <div className="sheet-list">
            {cats.map((c, i) => (
              <button key={c.id} className={'sheet-item' + (i === 0 ? ' is-on' : '')}>
                <span className="swatch" style={{ '--swatch': c.color, background: c.color }} />
                <div className="label">
                  {c.name}
                  <small>{c.count} verses</small>
                </div>
                <span className="check"><ICheck size={14} /></span>
              </button>
            ))}
          </div>
          <div className="sheet-foot">
            <span className="sheet-newcolor" />
            <input className="sheet-newinput" placeholder="New category…" />
            <button style={{
              background: 'transparent', border: 0, color: 'var(--ed-fg-muted)',
              fontFamily: 'var(--font-glacial)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- Variant B: multi-select bar --------
function QuranWithMultiSelect() {
  const verses = SAMPLE.verses;
  const selected = ['36:5', '36:6', '36:7'];
  return (
    <div className="reader" style={{ position: 'relative' }}>
      <ReaderToolbar />
      <div className="reader-stage">
        <div className="frame-scroll">
          <div className="frame-scroll-inner">
            <div className="reader-page">
              <SuraMast />
              {verses.map((v) => (
                <VerseRow key={v.key} v={v} selected={selected.includes(v.key)} multiSelect />
              ))}
            </div>
          </div>
        </div>

        <div className="multibar">
          <div className="mb-count">3 verses · 36:5–7</div>
          <button><IBookmark size={13} /> Bookmark</button>
          <button><INote size={13} /> Note</button>
          <button><ICopy size={13} /> Copy</button>
          <button><IShare size={13} /> Collection</button>
          <button title="Cancel"><IX size={13} /></button>
        </div>
      </div>
    </div>
  );
}

// -------- Variant C: notes dialog (centered modal editor) --------
function QuranWithNotesDialog() {
  const verses = SAMPLE.verses;
  return (
    <div className="reader" style={{ position: 'relative' }}>
      <ReaderToolbar />
      <div className="reader-stage">
        <div className="frame-scroll">
          <div className="frame-scroll-inner">
            <div className="reader-page">
              <SuraMast />
              {verses.map((v) => (
                <VerseRow key={v.key} v={v} selected={v.key === '36:5'} />
              ))}
            </div>
          </div>
        </div>

        <div className="note-scrim">
          <div className="note-dialog">
            <div className="note-dialog-head">
              <div>
                <div className="eyebrow">Note · 36:5 · edited 2h ago</div>
                <h3>A reminder, not a poem.</h3>
                <p className="quote">“This revelation is from the Almighty, Most Merciful.”</p>
              </div>
              <button className="note-dialog-close" title="Close (Esc)"><IClose size={14} /></button>
            </div>

            <div className="note-dialog-tools">
              <button title="Bold" style={{ fontWeight: 700 }}>B</button>
              <button title="Italic" style={{ fontStyle: 'italic' }}>I</button>
              <button title="Heading" style={{ fontSize: 12 }}>H</button>
              <span className="div" />
              <button title="List">•</button>
              <button title="Quote">”</button>
              <span className="div" />
              <button title="Verse reference"><span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11 }}>§:</span></button>
              <button title="Link"><span style={{ fontSize: 11 }}>⌒</span></button>
              <span style={{ flex: 1 }} />
              <button title="Expand to full editor"><IExternal size={12} /></button>
            </div>

            <div className="note-dialog-body">
              <p>
                The framing here — “you are <em>one of the messengers</em>” — reasserts the Quran as a <em>reminder</em>,
                not a poem. Cf. <span className="ref">36:69</span> and <span className="ref">36:70</span>: <em>“We did not teach him poetry; nor was it (the Quran) something he had invented.”</em>
              </p>
              <p>
                Worth pulling <span className="ref">39:18</span> alongside on a re-read: the people who hear words and follow the best of them. The thread runs through the late Makkan suras.
              </p>
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                borderLeft: '1px solid var(--ed-accent)', paddingLeft: 14,
                fontSize: 16, color: 'var(--ed-fg-muted)',
              }}>
                On a straight path. — 36:4
              </p>
            </div>

            <div className="note-dialog-foot">
              <div className="drawer-tags">
                <span className="tag-chip is-on">Tafsir</span>
                <span className="tag-chip is-on">Late Makkan</span>
                <span className="tag-chip">+ tag</span>
              </div>
              <button style={{
                background: 'transparent', border: 0, color: 'var(--ed-fg-muted)',
                fontFamily: 'var(--font-source-serif)', fontSize: 13,
                borderBottom: '1px solid var(--ed-rule)', padding: '2px 0',
              }}>Cancel</button>
              <button className="auth-primary" style={{ width: 'auto', padding: '7px 16px', fontSize: 13 }}>Save note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// keep old name as alias for any external refs
const QuranWithNotesDrawer = QuranWithNotesDialog;

// -------- Variant D: notes index page (full /me/notes redesign) --------
function NotesIndexPage() {
  const notes = SAMPLE.notes;
  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <div className="profile-mast" style={{ gridTemplateColumns: '1fr auto' }}>
        <div>
          <div className="profile-mast-eyebrow"><span className="dot" /> § II · Notes</div>
          <h1 style={{ fontSize: 48 }}>Marginalia <em>&amp; references</em></h1>
          <div className="profile-mast-meta">
            <span>{SAMPLE.stats.notes} notes</span>
            <span className="sep">·</span>
            <span>across both scriptures</span>
            <span className="sep">·</span>
            <a href="#">Export all</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            border: '1px solid var(--ed-rule)',
            background: 'var(--ed-bg-alt)',
            color: 'var(--ed-fg-muted)',
            fontFamily: 'var(--font-source-serif)', fontSize: 13,
            minWidth: 240,
          }}>
            <ISearch size={13} />
            <span style={{ flex: 1 }}>Search across all notes…</span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, padding: '1px 5px', border: '1px solid var(--ed-rule)' }}>⌘K</span>
          </div>
        </div>
      </div>

      {/* tag filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', margin: '24px 0' }}>
        <span style={{ fontFamily: 'var(--font-glacial)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ed-fg-muted)' }}>Filter</span>
        {['All', 'Tafsir', 'Study', 'Late Makkan', 'Cross-ref', 'Drafts'].map((t, i) => (
          <span key={t} className={'tag-chip ' + (i === 0 ? 'is-on' : '')}>{t}{i === 0 && ` · ${SAMPLE.stats.notes}`}</span>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--ed-fg-muted)' }}>Newest first ↓</span>
      </div>

      <div className="notes-index">
        {notes.map((n, i) => (
          <div key={i} className="notes-row">
            <div className="key">
              {n.key}
              <b>{n.date}</b>
            </div>
            <div className="body">
              <p className="quote">
                {n.key === '36:5' && '“This revelation is from the Almighty, Most Merciful.”'}
                {n.key === '36:6' && '“To warn people whose ancestors were never warned…”'}
                {n.key === '2:62' && '“Surely, those who believe… shall receive their recompense from their Lord.”'}
                {n.key === '74:30' && '“Over it is nineteen.”'}
              </p>
              <p>{n.body}</p>
              <div className="tags">
                <span className="tag-chip is-on">{n.tag}</span>
                {i % 2 === 0 && <span className="tag-chip">Cross-ref</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Variant E: bookmarks category detail page --------
function BookmarkCategoryPage() {
  const cat = SAMPLE.categories[0];
  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <a href="#" style={{
        fontFamily: 'var(--font-glacial)', fontSize: 10.5, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'var(--ed-fg-muted)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <IChevL size={11} /> Profile · Bookmarks
      </a>

      <div className="profile-mast" style={{ marginTop: 24, alignItems: 'baseline' }}>
        <div>
          <div className="profile-mast-eyebrow">
            <span className="dot" style={{ background: cat.color }} />
            Category · {cat.count} verses
          </div>
          <h1>{cat.name.split(' ')[0]} <em>{cat.name.split(' ').slice(1).join(' ')}</em></h1>
          <div className="profile-mast-meta">
            <span>Created Feb 14, 2026</span>
            <span className="sep">·</span>
            <a href="#">Rename</a>
            <span className="sep">·</span>
            <a href="#">Change colour</a>
            <span className="sep">·</span>
            <a href="#">Export</a>
          </div>
        </div>
        <div className="profile-mast-side">
          <div className="profile-mast-vol">— a personal folder —</div>
          <button className="section-action" style={{ marginTop: 4 }}><IShare size={12} /> Make a Collection from this</button>
        </div>
      </div>

      <div style={{
        marginTop: 32,
        borderTop: '1px solid var(--ed-rule)',
        borderBottom: '1px solid var(--ed-rule)',
      }}>
        {[
          { key: '2:163', body: 'Your god is one god; there is no god except He, the Most Gracious, Most Merciful.' },
          { key: '112:1', body: 'Say, "He is the One and only God."' },
          { key: '7:158', body: '...There is no god except He; He controls life and death...' },
          { key: '20:14', body: 'I am God; there is no other god beside Me. You shall worship Me alone, and observe the Contact Prayers (Salat) to commemorate Me.' },
          { key: '21:25', body: 'We did not send any messenger before you except with the inspiration: "There is no god except Me; you shall worship Me alone."' },
        ].map((v, i) => (
          <div key={v.key} style={{
            padding: '20px 0',
            borderBottom: i < 4 ? '1px solid var(--ed-rule)' : 0,
            display: 'grid',
            gridTemplateColumns: '64px 1fr auto',
            gap: 20,
            alignItems: 'baseline',
          }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--ed-accent)', letterSpacing: '0.04em' }}>{v.key}</span>
            <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: 17, lineHeight: 1.55, margin: 0 }}>{v.body}</p>
            <span style={{ fontFamily: 'var(--font-glacial)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ed-fg-muted)' }}>Open →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Variant F: phone reader with margin notes --------
function PhoneReaderWithNotes() {
  const verses = SAMPLE.verses.slice(0, 5);
  return (
    <div className="reader" style={{ position: 'relative' }}>
      <PhoneNav title="Yā Sīn" sub="36 · MAKKAN · 83 VERSES" />
      <div className="frame-scroll">
        <div className="frame-scroll-inner">
          <div style={{ padding: '20px 18px 32px' }}>
            <div className="sura-mast" style={{ paddingBottom: 18, marginBottom: 18 }}>
              <div className="roman">§ XXXVI</div>
              <h1 style={{ fontSize: 36, marginTop: 4 }}>Yā Sīn</h1>
              <div className="arabic" style={{ fontSize: 22 }}>يس</div>
            </div>
            {verses.map((v) => (
              <div key={v.key} className={'verse' + (v.isBookmarked ? ' is-bookmarked' : '') + (v.hasNote ? ' has-note' : '')}
                   style={{ ...(v.color ? { '--cat-color': v.color } : {}), gridTemplateColumns: '40px 1fr', padding: '14px 0' }}>
                <div className="verse-num">{v.key}</div>
                <div>
                  <div className="verse-body" style={{ fontSize: 16 }}>{v.body}</div>
                  {v.key === '36:5' && (
                    <div className="note-margin">
                      <div className="meta">
                        <span>Your note</span>
                        <span className="tag">Tafsir</span>
                      </div>
                      The framing here reasserts the Quran as a <em>reminder</em>, not a poem.
                      Cf. <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--ed-accent)', fontSize: 12 }}>36:69–70</span>.
                    </div>
                  )}
                  {v.key === '36:6' && (
                    <div className="note-margin">
                      <div className="meta"><span>Your note</span><span className="tag">Study</span></div>
                      Compare with <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--ed-accent)', fontSize: 12 }}>Deut. 18:18</span>.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 12,
        background: 'var(--ed-fg)', color: 'var(--ed-bg)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderRadius: 2,
        fontFamily: 'var(--font-glacial)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        {[
          { l: 'Bookmark', i: <IBookmark size={12} /> },
          { l: 'Note', i: <INote size={12} /> },
          { l: 'Listen', i: <IPlay size={12} /> },
          { l: 'More', i: <IMore size={12} /> },
        ].map((b) => (
          <button key={b.l} style={{
            background: 'transparent', border: 0, color: 'inherit',
            padding: '12px 6px',
            display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
          }}>
            {b.i}
            <span>{b.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------- Phone bookmark sheet (bottom sheet) --------
function PhoneBookmarkSheet() {
  const cats = SAMPLE.categories.slice(0, 5);
  return (
    <div className="reader" style={{ position: 'relative' }}>
      <PhoneNav title="Yā Sīn" sub="36 · MAKKAN · 83 VERSES" />
      <div className="frame-scroll">
        <div className="frame-scroll-inner">
          <div style={{ padding: '20px 18px 240px', filter: 'opacity(0.6)' }}>
            {SAMPLE.verses.slice(0, 4).map((v) => (
              <div key={v.key} className={'verse' + (v.isBookmarked ? ' is-bookmarked' : '')}
                   style={{ ...(v.color ? { '--cat-color': v.color } : {}), gridTemplateColumns: '40px 1fr', padding: '14px 0' }}>
                <div className="verse-num">{v.key}</div>
                <div className="verse-body" style={{ fontSize: 16 }}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--ed-surface)',
        borderTop: '1px solid var(--ed-rule)',
        borderTopLeftRadius: 12, borderTopRightRadius: 12,
        padding: '16px 18px 24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <span style={{ width: 44, height: 4, background: 'var(--ed-rule)', borderRadius: 4, alignSelf: 'center' }} />
        <div>
          <div className="sheet-eyebrow">Bookmark · 36:5</div>
          <h3 className="sheet-title" style={{ fontSize: 22 }}>Add to a category</h3>
        </div>
        <div className="sheet-list" style={{ borderTop: '1px solid var(--ed-rule)' }}>
          {cats.map((c, i) => (
            <button key={c.id} className={'sheet-item' + (i === 0 ? ' is-on' : '')}>
              <span className="swatch" style={{ background: c.color }} />
              <div className="label">
                {c.name}
                <small>{c.count} verses</small>
              </div>
              <span className="check"><ICheck size={14} /></span>
            </button>
          ))}
        </div>
        <button style={{
          textAlign: 'left', background: 'transparent', border: '1px dashed var(--ed-rule)',
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-source-serif)', fontSize: 14, color: 'var(--ed-fg-muted)',
        }}>
          <IPlus size={13} /> New category…
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  QuranWithBookmarkSheet, QuranWithMultiSelect, QuranWithNotesDrawer, QuranWithNotesDialog,
  NotesIndexPage, BookmarkCategoryPage, PhoneReaderWithNotes, PhoneBookmarkSheet,
});
