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
          &ldquo;Had we revealed this to a non-Arab, and he read it to them in Arabic,
          they still would not have believed.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="26:198-199" />
        </p>
      </div>

      {/* Body */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We learn from <QuranRef reference="41:44" /> that the sincere believers have
          access to the Quran, regardless of their mother tongue. The disbelievers, on
          the other hand, are not permitted access to the Quran, even if they are
          professors of the Arabic language (
          <QuranRef reference="17:45" />, <QuranRef reference="18:57" />,{' '}
          <QuranRef reference="41:44" />, <QuranRef reference="56:79" />).
        </p>
        <p>
          Arabic is the most efficient language in the world, especially when it comes
          to the precise statement of laws. Since the Quran is a Statute Book, it was
          crucial that such laws be clearly stated. God chose Arabic for His Final
          Testament because it is the most suitable language for that purpose.
        </p>
      </section>

      {/* Efficiency of Arabic */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Efficiency of Arabic
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Arabic is unique in its efficiency and precision. For example, the word
          &ldquo;they&rdquo; in English does not tell you if &ldquo;they&rdquo; are
          males or females. Arabic has four distinct forms:
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <p className="font-semibold text-foreground">Pronouns for &ldquo;They&rdquo; in Arabic</p>
          <ul className="space-y-2 text-foreground/80">
            <li><span className="font-mono font-semibold">HUM</span> — they (males)</li>
            <li><span className="font-mono font-semibold">HUNNA</span> — they (females)</li>
            <li><span className="font-mono font-semibold">HUMAA</span> — they (two males)</li>
            <li><span className="font-mono font-semibold">HAATAAN</span> — they (two females)</li>
          </ul>
          <p className="text-foreground/60 text-xs">This feature does not exist in any other language in the world.</p>
        </div>

        <p>
          This precision was extremely helpful in stating laws such as in{' '}
          <QuranRef reference="2:228" />, which enjoins the divorcee to give up her own
          wishes to divorce her husband if she discovers she is pregnant and the husband
          wishes to reconcile — the welfare of the child takes priority. The efficiency
          of the Arabic language made it possible to state this law clearly in very few
          words, specifying exactly whose wishes are to be superseded. Any other language
          would have made this almost impossible to convey with such brevity.
        </p>
        <p>
          Another example is the word <em>Qaalataa</em> of <QuranRef reference="28:23" />,
          which translates into four English words: &ldquo;the two women said.&rdquo;
          Such is the efficiency of Arabic.
        </p>
      </section>

      {/* Gender and God */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Gender and the Reference to God
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Another reason for choosing Arabic is that &ldquo;He&rdquo; and
          &ldquo;She&rdquo; in Arabic do not necessarily imply natural gender. Thus,
          when God is referred to as &ldquo;He,&rdquo; this does not imply gender at
          all. God be glorified; He is neither male nor female. The usage of
          &ldquo;He&rdquo; to refer to God in English, for example, has contributed to
          a false image of God — compounded further by distorted expressions such as
          &ldquo;Father&rdquo; when referring to God. Such a reference to God is never
          found in the Quran.
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="BkZJa7j0z2M" title="Appendix 4 — Why Was the Quran Revealed in Arabic?" />
      </section>
    </>
  )
}
