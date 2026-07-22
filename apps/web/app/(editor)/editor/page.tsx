import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

// Display labels + a one-line purpose for each backend module key. Quran leads
// because it is the first module being brought onto the new editor.
const MODULE_INFO: Record<string, { label: string; blurb: string }> = {
  quran: { label: 'Quran', blurb: 'Versions, chapters, verse text and references.' },
  article: { label: 'Articles', blurb: 'Multilingual articles, drafts and publishing.' },
  bible: { label: 'Bible', blurb: 'Books, chapters and verse translations.' },
  community: { label: 'Communities', blurb: 'Online and physical community listings.' },
  author: { label: 'Authors', blurb: 'Author profiles and article relationships.' },
  category: { label: 'Categories', blurb: 'Article categories.' },
  appendix: { label: 'Appendices', blurb: 'Quran-scoped appendices.' },
}

const MODULE_ORDER = ['quran', 'article', 'bible', 'community', 'author', 'category', 'appendix']

export default async function EditorLandingPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/editor')
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) redirect('/')

  const accessible = MODULE_ORDER.filter(
    (key) => editorial.is_admin || editorial.modules[key] !== undefined,
  )

  return (
    <section className="w-full max-w-5xl px-9 py-8">
      <header className="mb-7">
        <p className="font-[family-name:var(--font-glacial)] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Editorial
        </p>
        <h1 className="mt-1.5 mb-2.5 font-[family-name:var(--font-cormorant)] text-[38px] leading-[1.05] text-foreground">
          Workspace
        </h1>
        <p className="max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
          Choose a module to begin. You see only what you have been granted; the
          backend re-checks access on every change.
        </p>
      </header>

      {accessible.length === 0 ? (
        <p className="max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
          No modules have been assigned to your account yet.
        </p>
      ) : (
        <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5 p-0">
          {accessible.map((key) => {
            const info = MODULE_INFO[key] ?? { label: key, blurb: '' }
            const canWrite = editorial.is_admin || editorial.modules[key] === true
            return (
              <li key={key}>
                <Link href={`/editor/${key}`} className="group block h-full">
                  <Card className="h-full gap-3 py-5 transition-colors group-hover:border-primary/40">
                    <CardContent className="flex h-full flex-col gap-2 px-5">
                      <CardTitle className="font-[family-name:var(--font-cormorant)] text-[22px] font-normal">
                        {info.label}
                      </CardTitle>
                      <CardDescription className="flex-1 text-[13px] leading-normal">
                        {info.blurb}
                      </CardDescription>
                      <Badge
                        variant={canWrite ? 'default' : 'secondary'}
                        className="mt-2 font-[family-name:var(--font-glacial)] text-[10px] uppercase tracking-[0.1em]"
                      >
                        {canWrite ? 'Read & write' : 'Read only'}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
