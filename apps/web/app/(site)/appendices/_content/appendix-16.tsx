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
          &ldquo;I do not find in what was revealed to me anything prohibited
          for any eater unless it is (1) carrion, (2) running blood, (3) the
          meat of pigs.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="6:145" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          God disapproves of prohibitions not explicitly stated in the Quran
          (
          <QuranRef reference="16:112" />–<QuranRef reference="16:116" />).
          Adding food prohibitions beyond those listed in the Quran
          constitutes idolatry, as such additions effectively represent
          obedience to &ldquo;other gods besides God&rdquo; (
          <QuranRef reference="6:142" />–<QuranRef reference="6:152" />).
        </p>
        <p>
          The Quran is precise in its dietary rules. When God prohibits
          &ldquo;the meat of pigs,&rdquo; He means the meat specifically —
          not the fat. This distinction has practical relevance: lard used
          as an ingredient in baked goods, for example, would not fall under
          this prohibition under a strict Quranic reading (
          <QuranRef reference="6:145" />–<QuranRef reference="6:146" />).
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Four Prohibited Meats
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran specifies four prohibited meats in four separate
          locations (<QuranRef reference="2:173" />;{' '}
          <QuranRef reference="5:3" />; <QuranRef reference="6:142" />–
          <QuranRef reference="6:145" />; <QuranRef reference="16:112" />
          ), confirming their universality:
        </p>
      </section>

      {/* Prohibited meats list */}
      <div data-card className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Prohibited Meats (<QuranRef reference="2:173" />, <QuranRef reference="5:3" />, <QuranRef reference="6:145" />, <QuranRef reference="16:115" />)
          </p>
        </div>
        <ul className="divide-y divide-border/20 text-sm">
          {[
            {
              n: 1,
              title: 'Carrion',
              desc: 'Animals that die of themselves (not slaughtered).',
            },
            {
              n: 2,
              title: 'Running blood',
              desc: 'Blood that flows — as opposed to blood remaining in tissue after proper slaughter.',
            },
            {
              n: 3,
              title: 'Pig meat',
              desc: 'The meat (flesh) of swine, explicitly described as unclean.',
            },
            {
              n: 4,
              title: 'Meat dedicated to other than God',
              desc: 'Animals slaughtered while invoking the name of any deity other than God.',
            },
          ].map(({ n, title, desc }) => (
            <li key={n} className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {n}
              </span>
              <span className="text-foreground/80 text-sm leading-relaxed">
                <strong>{title}: </strong>{desc}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Duress exception */}
      <div
        data-card
        className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-2 text-sm"
      >
        <p className="font-semibold uppercase tracking-widest text-muted-foreground text-xs">
          Exception Under Duress
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Forced consumption of any prohibited item — without malicious
          intent or deliberate transgression — receives divine forgiveness.
          God is Forgiver, Most Merciful (
          <QuranRef reference="2:173" />, <QuranRef reference="6:145" />).
        </p>
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
