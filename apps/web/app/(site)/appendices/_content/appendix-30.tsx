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
          &ldquo;If you fear lest you may not be perfectly equitable in treating more than one
          wife, then you shall be content with one.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="4:3" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Polygamy was a way of life until the Quran was revealed 1400 years ago. When the
          earth was young and under-populated, polygamy was one way of populating it and
          bringing in the human beings needed to carry out God&apos;s plan. By the time the
          Quran was revealed, the world had been sufficiently populated, and the Quran put down
          the first limitations against polygamy.
        </p>
        <p>
          Polygamy is permitted in the Quran, but under strictly observed circumstances. Any
          abuse of this divine permission incurs severe retribution. Thus, although polygamy is
          permitted by God, it behooves us to examine our circumstances carefully before saying
          that a particular polygamous relationship is permissible.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Prophet&apos;s Example
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Our perfect example here is the prophet Muhammad. He was married to one wife,
          Khadijah, until she died. He had all his children, except one, from Khadijah. Thus,
          she and her children enjoyed the Prophet&apos;s full attention for as long as she was
          married to him — twenty-five years. For all practical purposes, Muhammad had one wife
          from the age of 25 to 50.
        </p>
        <p>
          During the remaining 13 years of his life, he married the aged widows of his friends
          who left many children. The children needed a complete home with a fatherly figure,
          and the Prophet provided that. Providing a fatherly figure for orphans is the only
          specific circumstance in support of polygamy mentioned in the Quran (
          <QuranRef reference="4:3" />).
        </p>
        <p>
          Other than marrying widowed mothers of orphans, there were three political marriages
          in the Prophet&apos;s life. His close friends Abu Bakr and Omar insisted that he
          marry their daughters, Aisha and Hafsah, to establish traditional family ties among
          them. The third marriage was to Maria the Egyptian, given to him as a political
          gesture of friendship from the ruler of Egypt.
        </p>
        <p>
          This perfect example tells us that a man must give his full attention and loyalty in
          marriage to his wife and children in order to raise a happy and wholesome family.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Quranic Limitations
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran emphasizes the limitations against polygamy in very strong words:
        </p>
        <p>
          &ldquo;If you fear lest you may not be perfectly equitable in treating more than one
          wife, then you shall be content with one.&rdquo; (<QuranRef reference="4:3" />)
        </p>
        <p>
          &ldquo;You cannot be equitable in a polygamous relationship, no matter how hard you
          try.&rdquo; (<QuranRef reference="4:129" />)
        </p>
        <p>
          The Quranic limitations against polygamy point out the possibility of abusing
          God&apos;s law. Therefore, unless we are absolutely sure that God&apos;s law will not
          be abused, we had better resist our lust and stay away from polygamy. The
          children&apos;s psychological and social well-being, especially in countries where
          polygamy is prohibited, almost invariably dictate monogamy.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Basic Criteria
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <ol className="space-y-3 list-none">
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            1
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            It must alleviate pain and suffering and not cause any pain or suffering.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            2
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            If you have a young family, it is almost certain that polygamy is an abuse.
          </p>
        </li>
        <li className="flex items-baseline gap-3">
          <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
            3
          </span>
          <p className="text-base leading-relaxed text-foreground/90">
            Polygamy to substitute a younger wife is an abuse of God&apos;s law (
            <QuranRef reference="4:19" />).
          </p>
        </li>
      </ol>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="OTYzP1BgWow" title="Appendix 30 — Polygamy" />
      </section>
    </>
  )
}
