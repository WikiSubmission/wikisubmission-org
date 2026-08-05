import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* Opening card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;Say, &lsquo;I do not find in what was revealed to me anything
          prohibited for any eater unless it is (1) carrion, (2) running blood,
          (3) the meat of pigs, for it is unclean, and (4) meat blasphemously
          dedicated to other than God.&rsquo; If one is forced to eat these
          without being malicious or deliberate, then your Lord is Forgiver,
          Most Merciful.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="6:145" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran teaches that God is extremely displeased with those who
          prohibit anything that was not specifically prohibited in the Quran
          (<QuranRef reference="16:112" />–<QuranRef reference="16:116" />). The
          upholding of any prohibitions not specifically mentioned in the Quran
          is tantamount to idolatry (<QuranRef reference="6:142" />–
          <QuranRef reference="6:152" />). Such prohibitions represent some other
          god(s) besides God. If you worship God ALONE, you will uphold His
          teachings ALONE and honor the commandments and prohibitions instituted
          only by Him.
        </p>
        <p>
          The absolute specificity of dietary prohibitions in the Quran is best
          illustrated in <QuranRef reference="6:145" />–
          <QuranRef reference="6:146" />. We learn from these two verses that
          when God prohibits &ldquo;meat,&rdquo; He prohibits &ldquo;meat&rdquo;
          and nothing else, and when He prohibits &ldquo;fat,&rdquo; that is what
          He specifically prohibits. These two verses inform us that &ldquo;the
          meat&rdquo; of pigs is prohibited, not &ldquo;the fat.&rdquo; Obviously,
          God knew that in many countries, lard would be used in baked goods and
          other food products, and that such usage does not render the foods
          Haraam (prohibited). The Quran specifically prohibits four meats (
          <QuranRef reference="2:173" />, <QuranRef reference="5:3" />,{' '}
          <QuranRef reference="6:142" />–<QuranRef reference="6:145" />, and{' '}
          <QuranRef reference="16:112" />):
        </p>
      </section>

      {/* Prohibited meats list */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The Four Prohibited Meats (<QuranRef reference="6:145" />)
          </p>
        </div>
        <ul className="divide-y divide-border/20 text-sm">
          {[
            { n: 1, text: 'carrion' },
            { n: 2, text: 'running blood' },
            { n: 3, text: 'the meat of pigs, for it is unclean' },
            { n: 4, text: 'meat blasphemously dedicated to other than God' },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {n}
              </span>
              <span className="text-foreground/80 text-sm leading-relaxed">
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="o7GJwyv_ZRM" title="Appendix 16 — Dietary Prohibitions" />
      </section>
    </>
  )
}
