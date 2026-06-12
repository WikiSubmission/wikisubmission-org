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
          &ldquo;We made the Quran easy to learn. Does any of you wish to learn?&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="54:17" /> &middot; also <QuranRef reference="54:22" /> &middot;{' '}
          <QuranRef reference="54:32" /> &middot; <QuranRef reference="54:40" />
        </p>
      </div>

      {/* Body */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Verse <QuranRef reference="11:1" /> informs us that the Quran&apos;s Miracle
          involves two simultaneous elements: [1] the superhuman mathematical design of
          its physical structure, and [2] the simultaneous composition of a literary work
          of extraordinary excellence.
        </p>
        <p>
          One may be able to meet the numerical distribution requirements of a simple
          mathematical pattern. However, this is invariably accomplished at the expense
          of the literary quality. The simultaneous control of the literary style and the
          intricate mathematical distribution of individual letters throughout the Quran
          is evident in the fact that the Quran is made easy to memorize, understand, and
          enjoy. Unlike a human-made book, the Quran is enjoyable to read over and over,
          infinitely.
        </p>
        <p>
          The title of this Appendix is repeated in Sura 54, verses 17, 22, 32, and 40.
          As it turns out, the Quran&apos;s Arabic text is composed in such a way as to
          remind the reader or the memorizer of the next correct expression, or the next
          verse. God created us and He knows the most efficient way for fixing literary
          materials into our memory. Memorization of the Quran has played a vital role
          in preserving the original text generation after generation at a time when
          written books were a rarity.
        </p>
        <p>
          Without even realizing it, the person who memorizes the Quran is divinely
          helped by an intricate literary system as he utters the sounds of the Quranic
          words. Almost every verse in the Quran contains what may be called
          &ldquo;Memory Bells.&rdquo; Their function is to remind the reader of what
          comes next. This system is so vast that only two illustrative examples are
          given here.
        </p>
      </section>

      {/* Memory Bells */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Memory Bells
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      {/* Example 1 */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold text-foreground">
          Example 1 — Sura 2, Verses 127–129
        </p>
        <p className="text-foreground/80">
          In Sura 2, verses 127, 128, and 129, each verse ends with a different pair of
          God&apos;s names: <em>Al-Samee&apos; Al-&apos;Aleem</em> (The Hearer, the
          Omniscient), <em>Al-Tawwaab Al-Raheem</em> (The Redeemer, Most Merciful), and{' '}
          <em>Al-&apos;Azeez Al-Hakeem</em> (The Almighty, Most Wise), respectively. In
          an ordinary book, one would easily mis-match these six names.
        </p>
        <p className="text-foreground/80">
          Not so in the Quran. Each pair is preceded in the same verse by a
          &ldquo;Memory Bell&rdquo; that reminds us of the correct pair. Verse 127
          describes Abraham and Ismail raising the foundations of the Ka&apos;abah. The
          prominent sounds in &ldquo;Ismail&rdquo; — S, M, and &apos;Ayn — echo the
          names &ldquo;Al-Samee&apos; Al-&apos;Aleem&rdquo; at the verse&apos;s end.
          Notably, the word &ldquo;Ismail&rdquo; is conspicuously delayed in the
          sentence: &ldquo;When Abraham raised the foundations of the Ka&apos;abah,
          together with Ismail...&rdquo; — rather than the expected &ldquo;Abraham and
          Ismail&rdquo; — bringing those sounds closer to the divine names.
        </p>
        <p className="text-foreground/80">
          Verse 128 has the prominent word <em>Tubb</em> just before the names
          &ldquo;Al-Tawwaab Al-Raheem,&rdquo; serving as its memory bell. The names at
          the end of <QuranRef reference="2:129" /> are <em>Azeez, Hakeem</em> — with
          prominent sounds Z and K — and their memory bell is the word{' '}
          <em>Yuzakkeehim</em> appearing just before them.
        </p>
      </div>

      {/* Example 2 */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold text-foreground">
          Example 2 — Sura 3, Verses 176–178
        </p>
        <p className="text-foreground/80">
          In <QuranRef reference="3:176" />, <QuranRef reference="3:177" />, and{' '}
          <QuranRef reference="3:178" />, the retribution for disbelievers is described
          as <em>&apos;Azeem</em> (Terrible), <em>Aleem</em> (Painful), and{' '}
          <em>Muheen</em> (Humiliating), respectively. In any human-made book, a
          memorizer could easily mix up these three descriptions. But each adjective is
          preceded by a powerful memory bell.
        </p>
        <p className="text-foreground/80">
          The word <em>&apos;Azeem</em> of verse 176 is preceded by the word{' '}
          <em>Huzzun</em>, characterized by a stressed letter &ldquo;Z.&rdquo; The word{' '}
          <em>Aleem</em> of verse 177 is preceded by the sound of the word{' '}
          <em>Iman</em> serving as the memory bell, and the word <em>Muheen</em> of
          verse 178 is preceded by an abundance of &ldquo;M&rdquo; and &ldquo;H&rdquo;
          sounds throughout that verse.
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Other examples of memory bells include the ending of{' '}
          <QuranRef reference="3:173" /> and the beginning of{' '}
          <QuranRef reference="3:174" />, the ending of <QuranRef reference="4:52" />{' '}
          and the beginning of <QuranRef reference="4:53" />, the ending of{' '}
          <QuranRef reference="4:61" /> and the beginning of{' '}
          <QuranRef reference="4:62" />, the ending of <QuranRef reference="18:53" />{' '}
          and the beginning of <QuranRef reference="18:54" />, and many more throughout
          the Quran.
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="PwY2nPtuNVE" title="Appendix 3 — We Made the Quran Easy" />
      </section>
    </>
  )
}
