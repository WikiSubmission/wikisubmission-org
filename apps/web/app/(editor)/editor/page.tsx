import type { ComponentType } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  BookMarked,
  Newspaper,
  Users,
  Feather,
  ListOrdered,
  UserCircle,
} from 'lucide-react'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  canReadContentModule,
  canWriteContentModule,
  hasEditorWorkspaceAccess,
} from '@/lib/editorial-access'

export const dynamic = 'force-dynamic'

// Display label, a plain-language line about what lives in each module, and a
// glyph that reads at a glance in the tile grid. The keys mirror the backend
// module enum; the wording is aimed at the people who write the site, not at
// the permission model behind it.
const MODULE_INFO: Record<
  string,
  { label: string; blurb: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }
> = {
  quran: {
    label: 'Quran',
    blurb:
      'Translations, chapter titles, verse text and word-by-word meanings.',
    icon: BookOpen,
  },
  article: {
    label: 'Articles',
    blurb: 'Write, translate and publish articles for the site.',
    icon: Newspaper,
  },
  bible: {
    label: 'Bible',
    blurb: 'Books, chapters and verse translations.',
    icon: BookMarked,
  },
  community: {
    label: 'Communities',
    blurb: 'The local groups and online communities listed on the site.',
    icon: Users,
  },
  author: {
    label: 'Authors',
    blurb: 'Bylines and profiles for the people who write here.',
    icon: Feather,
  },
  appendix: {
    label: 'Appendices',
    blurb: 'The appendices that accompany a Quran translation.',
    icon: ListOrdered,
  },
}

const MODULE_ORDER = [
  'quran',
  'article',
  'bible',
  'community',
  'author',
  'appendix',
]

export default async function EditorLandingPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor')
  const editorial = await getEditorialSession(session.accessToken)
  // Mirrors the layout gate: a games-only editor holds a snapshot but has no
  // workspace here, so they would see an empty grid.
  if (!editorial || !hasEditorWorkspaceAccess(editorial)) redirect('/')

  // canReadContentModule, not canReadModule: it is the one that knows Authors
  // is admin-only and Categories ride on Articles, so a legacy grant does not
  // put a card here that the module's own page would redirect away from.
  const accessible = MODULE_ORDER.filter((key) =>
    canReadContentModule(editorial, key)
  )

  // First name where we have one, so the page opens like a greeting rather
  // than a control panel. Falls back to a plain title for accounts with no
  // name on file.
  const firstName = (session.user?.name ?? '').trim().split(/\s+/)[0]

  return (
    <section className="ed-page-wide editor-home">
      <header className="editor-home-intro">
        <div className="editor-home-title">
          <div className="editor-home-kicker">
            <span>WikiSubmission</span>
            <span className="editor-home-rule" aria-hidden="true" />
            <span>Editorial desk</span>
          </div>

          <h1>
            {firstName ? (
              <>
                {firstName}&apos;s <em>desk</em>
              </>
            ) : (
              <>
                The editorial <em>desk</em>
              </>
            )}
          </h1>

          <p>
            A working index for the parts of WikiSubmission you can read and
            shape. Drafts stay private until they are published.
          </p>
        </div>

        <aside className="editor-home-note" aria-label="Workspace notes">
          <div className="editor-home-note-label">Workspace</div>
          <div className="editor-home-note-value">
            {accessible.length.toString().padStart(2, '0')} sections
          </div>
          <div className="editor-home-note-meta">
            {editorial.is_admin ? 'Administrator access' : 'Editorial access'}
          </div>
        </aside>
      </header>

      {accessible.length === 0 ? (
        <section className="editor-empty">
          <div className="editor-empty-index">00</div>
          <div>
            <h2>No sections assigned</h2>
            <p>
              Ask an administrator which parts of the site you should be
              working on. Your profile remains available below.
            </p>
          </div>
        </section>
      ) : (
        <section className="module-index" aria-labelledby="module-index-title">
          <div className="module-index-head">
            <div>
              <span className="module-index-kicker">Sections</span>
              <h2 id="module-index-title">Content index</h2>
            </div>
            <span className="module-index-count">
              {accessible.length.toString().padStart(2, '0')} available
            </span>
          </div>

          <div className="module-list">
            {accessible.map((key, index) => {
              const info = MODULE_INFO[key] ?? {
                label: key,
                blurb: '',
                icon: BookOpen,
              }
              const canWrite = canWriteContentModule(editorial, key)
              const Icon = info.icon

              return (
                <Link
                  key={key}
                  href={`/editor/${key}`}
                  className="module-row"
                >
                  <span className="module-row-number">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>

                  <span className="module-row-mark" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>

                  <span className="module-row-main">
                    <span className="module-row-title">{info.label}</span>
                    <span className="module-row-desc">{info.blurb}</span>
                  </span>

                  <span className="module-row-access">
                    <span className={canWrite ? 'write' : 'read'}>
                      {canWrite ? 'Edit' : 'Read'}
                    </span>
                  </span>

                  <span className="module-row-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <Link href="/editor/profile" className="profile-row">
        <span className="profile-row-mark" aria-hidden="true">
          <UserCircle size={17} strokeWidth={1.5} />
        </span>
        <span className="profile-row-main">
          <span className="profile-row-title">Your profile</span>
          <span className="profile-row-desc">
            The byline readers see on the articles you write.
          </span>
        </span>
        <span className="profile-row-arrow" aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
