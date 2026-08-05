import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In God&rsquo;s kingdom, certain creatures are necessarily given the powers
          needed to perform their duties. Satan believed that his God-given powers
          qualified him to function as an independent god. As evidenced by the
          prevalence of misery, disease, accidents, and war in his dominion, we now
          know that Satan is incompetent.
        </p>
        <p>
          The Quran clearly states that Satan was an angel, by virtue of the immense
          powers and rank bestowed upon him. This is why he is addressed as an angel
          (<QuranRef reference="2:34" />, <QuranRef reference="7:11" />,{' '}
          <QuranRef reference="15:29" />, <QuranRef reference="17:61" />,{' '}
          <QuranRef reference="18:50" />, <QuranRef reference="20:116" />,{' '}
          <QuranRef reference="38:71" />) prior to his fall. By definition, a jinn is
          a fallen angel (<QuranRef reference="18:50" />). Satan&rsquo;s rebellion
          teaches us that the angels were created with minds of their own, and
          absolute freedom of choice (<QuranRef reference="2:34" />).
        </p>
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
