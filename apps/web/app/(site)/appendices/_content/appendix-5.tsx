import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* Opening verse card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;Whoever succeeds in barely missing Hell, and is admitted into Heaven,
          has attained a great triumph.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:185" />
        </p>
      </div>

      {/* Allegory */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The descriptions of Heaven and Hell throughout the Quran are allegorical. And
          the Quran tells us so whenever such descriptions occur as independent
          statements, not within a general subject. See <QuranRef reference="2:24-26" />,{' '}
          <QuranRef reference="13:35" />, and <QuranRef reference="47:15" />. The word{' '}
          <em>Mathal</em> (allegory) is used in these verses. Linguistically, the word
          &ldquo;Mathal&rdquo; in these verses can be removed and we still have perfect
          sentences — but it is there because the descriptions of Heaven and Hell are
          allegorical.
        </p>
        <p>
          What Heaven and Hell are really like is far beyond our comprehension, hence the
          need for allegory. How can one describe, for example, the taste of chocolate to
          a person who has never tasted chocolate? Allegory must be used. The person has
          to wait to actually taste chocolate to know what it is like. Whatever allegory
          we use can never approximate the real thing.
        </p>
      </section>

      {/* Heaven and Hell exist */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Heaven and Hell
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Heaven already exists, since Adam and Eve were placed in it during their days
          of innocence (<QuranRef reference="2:35" />). We learn from Sura 55 that there
          are two &ldquo;High Heavens&rdquo; — one for the humans and one for the jinns
          — and two &ldquo;Lower Heavens&rdquo; — one for the humans and one for the
          jinns (see <Link href="/appendices/11" className="text-primary underline underline-offset-2">Appendix 11</Link> for more details).
        </p>
        <p>
          Hell is not created yet. It will be created on the Day of Judgment (
          <QuranRef reference="69:17" /> &amp; <QuranRef reference="89:23" />). More
          details are given in{' '}
          <Link href="/appendices/11" className="text-primary underline underline-offset-2">
            Appendix 11
          </Link>
          .
        </p>
      </section>

      {/* High vs Lower Heaven */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The High Heaven vs. The Lower Heaven
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          There are profound allegorical differences between the High Heaven and the
          Lower Heaven described in Sura 55:
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm"
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-semibold text-primary w-32">Water</span>
              <span className="text-foreground/80">
                In the High Heaven, water flows freely (<QuranRef reference="55:50" />);
                in the Lower Heaven it needs to be pumped out (<QuranRef reference="55:66" />).
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-semibold text-primary w-32">Fruit</span>
              <span className="text-foreground/80">
                The High Heaven has all kinds of fruit (<QuranRef reference="55:52" />),
                while the Lower Heaven has a limited variety (<QuranRef reference="55:68" />).
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-semibold text-primary w-32">Spouses</span>
              <span className="text-foreground/80">
                Pure spouses readily join their spouses in the High Heaven (
                <QuranRef reference="55:56" />), while dwellers of the Lower Heaven must
                go fetch their spouses (<QuranRef reference="55:72" />).
              </span>
            </div>
          </div>
        </div>

        <p>
          Yet even the Lower Heaven is an incredibly fantastic prize for those fortunate
          enough to escape Hell (<QuranRef reference="3:185" />). People who depart this
          life before reaching their 40th birthday, and did not sufficiently develop
          their souls, will go to the Lower Heaven (<QuranRef reference="46:15" />,{' '}
          <Link href="/appendices/11" className="text-primary underline underline-offset-2">Appendix 11</Link>{' '}
          &amp;{' '}
          <Link href="/appendices/32" className="text-primary underline underline-offset-2">32</Link>).
          The High Heaven is reserved for those who believed, led a righteous life, and
          developed their souls sufficiently.
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="DCw1FX2sidE" title="Appendix 5 — Heaven and Hell" />
      </section>
    </>
  )
}
