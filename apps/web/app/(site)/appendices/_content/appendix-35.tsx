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
          &ldquo;O you who believe, intoxicants, and gambling, and the altars of idols, and the
          games of chance are abominations of the devil; you shall avoid them, that you may
          succeed.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="5:90" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          There is no compromise whatsoever regarding illicit drugs and alcoholic beverages;
          they are called &ldquo;abominations and the work of Satan&rdquo; (
          <QuranRef reference="5:90" />). In <QuranRef reference="2:219" /> and{' '}
          <QuranRef reference="5:90" />, we see that &ldquo;intoxicants, gambling, the
          idols&apos; altars, and games of chance&rdquo; are strictly prohibited.
        </p>
        <p>
          The word used for intoxicants is &ldquo;Khamr&rdquo; from the root word
          &ldquo;Khamara&rdquo; which means &ldquo;to cover.&rdquo; Thus, anything that covers
          or hinders the mind is prohibited. This includes anything that alters the mind, such
          as marijuana, heroin, cocaine, alcohol, hashish, and anything else that affects the
          mind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="UNYn4b_65_Q" title="Appendix 35 — Drugs & Alcohol" />
      </section>
    </>
  )
}
