import { QuranRef } from '@/components/quran-ref'
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
          &ldquo;Say, &lsquo;All intercession belongs to God.&rsquo;&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="39:44" />
        </p>
      </div>

      {/* Introduction */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          To believe that anyone, other than God, can intercede on our behalf to have
          our sins forgiven or our wishes fulfilled, is to set up partners with God.
          This is idolatry. The Quran proclaims that &ldquo;All intercession belongs to
          God&rdquo; (<QuranRef reference="39:44" />), and that there will be &ldquo;no
          intercession on the Day of Judgment&rdquo; (<QuranRef reference="2:254" />).
        </p>
        <p>
          The myth of intercession is one of Satan&apos;s most effective tricks to dupe
          millions of people into idol worship. Millions of Christians believe that Jesus
          will intercede for them at God, and millions of Muslims believe that Muhammad
          will intercede on their behalf. Consequently, these people idolize Jesus and
          Muhammad.
        </p>
      </section>

      {/* The Illogical Concept */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Illogical Concept
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The concept of intercession is utterly illogical. Those who believe in
          Muhammad&apos;s intercession, for example, claim that he will ask God to
          forgive them and admit them into Paradise. They imagine Muhammad on the Day of
          Judgment choosing the candidates for his intercession. If you ask those who
          believe in intercession: &ldquo;How will Muhammad recognize those who deserve
          his intercession?&rdquo; they tell you, &ldquo;God will tell him!&rdquo;
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <p className="font-semibold text-foreground">The Logical Absurdity</p>
          <p className="text-foreground/80">
            According to this concept, a person will go to Muhammad and request his
            intercession. Muhammad will then ask God whether this person deserves his
            intercession or not. God will inform Muhammad that the person deserves to go
            to Paradise. Muhammad will then turn around and tell God that the person
            deserves to go to Paradise! The blasphemy is obvious; those who believe in
            intercession make God a secretary of their idol Muhammad. God be glorified.
          </p>
        </div>
      </section>

      {/* What the Quran Actually Says */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          What the Quran Actually Says
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Since the Quran is the most accurate book, it acknowledges that everyone in
          Paradise will intercede on behalf of his or her loved ones: &ldquo;Please God,
          admit my mother into Paradise.&rdquo; This intercession will work if the
          person&apos;s mother deserves to go to Paradise (<QuranRef reference="2:255" />,{' '}
          <QuranRef reference="20:109" />, <QuranRef reference="21:28" />). Thus,
          intercession, though it will take place in this manner, is utterly useless.
        </p>
        <p>
          We learn from the Quran that Abraham, God&apos;s beloved servant, could not
          intercede on behalf of his father (<QuranRef reference="9:114" />). Noah could
          not intercede on behalf of his son (<QuranRef reference="11:46" />). Muhammad
          could not intercede on behalf of his uncle (<QuranRef reference="111:1-3" />)
          or relatives (<QuranRef reference="9:80" />). What makes anyone think that a
          prophet or a saint will intercede on behalf of a perfect stranger?! See{' '}
          <QuranRef reference="2:48" />, <QuranRef reference="2:123" />,{' '}
          <QuranRef reference="6:51" />, <QuranRef reference="6:70" />,{' '}
          <QuranRef reference="6:94" />, <QuranRef reference="7:53" />,{' '}
          <QuranRef reference="10:3" />, <QuranRef reference="19:87" />,{' '}
          <QuranRef reference="26:100" />, <QuranRef reference="30:13" />,{' '}
          <QuranRef reference="32:4" />, <QuranRef reference="36:23" />,{' '}
          <QuranRef reference="39:44" />, <QuranRef reference="40:18" />,{' '}
          <QuranRef reference="43:86" />, <QuranRef reference="53:26" /> &amp;{' '}
          <QuranRef reference="74:48" />. Muhammad&apos;s intercession is in{' '}
          <QuranRef reference="25:30" />.
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="rsZV4eImXzI" title="Appendix 8 — The Myth of Intercession" />
      </section>
    </>
  )
}
