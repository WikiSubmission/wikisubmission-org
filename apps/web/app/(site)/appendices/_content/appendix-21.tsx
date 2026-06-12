import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* ── Opening card ─────────────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;When we said to the angels, &apos;Fall prostrate before Adam,&apos;
          they fell prostrate, except Satan, who was a jinn.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="18:50" />
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In God&apos;s kingdom, certain creatures are necessarily given the powers
          needed to perform their duties. Satan believed that his God-given powers
          qualified him to function as an independent god. As evidenced by the
          prevalence of misery, disease, accidents, and war in his dominion, we now
          know that Satan is incompetent.
        </p>
        <p>
          The Quran clearly states that Satan was an angel, by virtue of the immense
          powers and rank bestowed upon him. This is why he is addressed as an angel
          (
          <QuranRef reference="2:34" />, <QuranRef reference="7:11" />,{' '}
          <QuranRef reference="15:29" />, <QuranRef reference="17:61" />,{' '}
          <QuranRef reference="18:50" />, <QuranRef reference="20:116" />,{' '}
          <QuranRef reference="38:71" />) prior to his fall.
        </p>
      </section>

      {/* ── Satan: A Fallen Angel ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Fallen Angel
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          By definition, a jinn is a fallen angel (
          <QuranRef reference="18:50" />). Satan&apos;s rebellion teaches us that
          the angels were created with minds of their own, and absolute freedom of
          choice (<QuranRef reference="2:34" />). Satan&apos;s fall from grace was
          the direct result of his refusal to submit to God&apos;s command — a
          manifestation of the same ego and arrogance that afflicts those who reject
          God&apos;s message today.
        </p>

        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
        >
          <p className="font-semibold text-foreground">Key Quranic facts about Satan:</p>
          <ul className="space-y-2">
            {[
              <>
                Satan was among the angels commanded to prostrate before Adam (
                <QuranRef reference="2:34" />)
              </>,
              <>
                He was given high rank and immense powers among God&apos;s creatures
                (implied in <QuranRef reference="38:71" />-76)
              </>,
              <>
                His fall made him a &ldquo;jinn&rdquo; — the Quran&apos;s term for
                a fallen angel (<QuranRef reference="18:50" />)
              </>,
              <>
                His rebellion demonstrates that freedom of choice exists even for
                angels (<QuranRef reference="2:34" />)
              </>,
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 size-5 flex items-center justify-center rounded bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/80 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="NdMD2geQbdc" title="Appendix 21 — Satan: Fallen Angel" />
      </section>
    </>
  )
}
