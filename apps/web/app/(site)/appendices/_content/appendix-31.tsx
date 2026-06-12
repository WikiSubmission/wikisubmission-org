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
          &ldquo;From water we initiated all living things.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="21:30" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We learn from the Quran that evolution is a divinely designed fact.
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Life began in water</p>
          <p className="text-foreground/80">
            &ldquo;From water we initiated all living things.&rdquo; (
            <QuranRef reference="21:30" />, <QuranRef reference="24:45" />)
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Humans are not descendants of monkeys</p>
          <p className="text-foreground/80">
            &ldquo;He started the creation of man from mud.&rdquo; (<QuranRef reference="32:7" />)
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Man created from &ldquo;aged&rdquo; mud</p>
          <p className="text-foreground/80">
            &ldquo;I am creating the human being from &lsquo;aged&rsquo; clay.&rdquo; (
            <QuranRef reference="15:28" />)
          </p>
        </div>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Evolution is possible only within a given species. For example, the navel orange
          evolved from seeded oranges, not from apples. The laws of probability preclude the
          possibility of haphazard evolution between species. A fish cannot evolve into a bird;
          a monkey can never evolve into a human.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Probability Laws Preclude Darwin&apos;s Evolution
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In this computer age, we have mathematical laws that tell us whether a certain event
          is probable or not. If we throw five numbered cubes up in the air and let them fall
          into a guided straight line, the probability laws tell us the number of possible
          combinations: 1×2×3×4×5&nbsp;=&nbsp;120 combinations. Thus, the probability of
          obtaining any combination is 1 in 120, or 0.0086.
        </p>
        <p>
          This probability diminishes fast when we increase the number of cubes. At six cubes,
          there are 720 combinations and the probability diminishes to 0.0014. Mathematicians
          have agreed that the probability diminishes to &ldquo;Zero&rdquo; when we increase
          the number of cubes to 84. The probability becomes 209×10⁻⁵⁰.
        </p>
        <p>
          Darwin&apos;s famous statement that &ldquo;life began as a &lsquo;simple&rsquo;
          cell&rdquo; is laughable. We know now that the cell is an extremely complex unit,
          with billions of nucleotides in the gene material inside the nucleus, and millions of
          biochemical reactions. The probability laws tell us that the probability of the
          haphazard creation of the exacting sequences of nucleotides into DNA is Zero, many
          times over. We are not talking about 84 nucleotides; we are talking about billions of
          nucleotides that must be arranged in a specific sequence.
        </p>
        <p>
          Some evolutionists have stated that the human gene and the monkey&apos;s gene are 90%
          similar. However, even if the similarity was 99%, we are still talking about
          300,000,000 nucleotides that must be haphazardly re-arranged to change a monkey into
          a human. The human gene contains 30,000,000,000 nucleotides; 1% of that is
          300,000,000. The probability laws preclude this as an utter impossibility.
        </p>
      </section>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm italic text-foreground/80">
        <p>
          &ldquo;The probability of life originating from accident is comparable to the
          probability of the Unabridged Dictionary resulting from an explosion in a printing
          factory.&rdquo;
        </p>
        <p className="mt-2 text-xs text-muted-foreground not-italic">— Professor Edwin Conklin</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="3HN_sTndr04" title="Appendix 31 — Evolution: Divinely Controlled" />
      </section>
    </>
  )
}
