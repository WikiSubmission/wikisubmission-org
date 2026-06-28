import { QuranRef } from '@/components/quran-ref'
import { YouTubeEmbed } from '@/components/youtube-embed'

/* ──────────────────────────────────────────────────────────────────────────
 * Appendix 3 — We Made the Quran Easy [54:17]
 * (from: Quran The Final Testament, by Rashad Khalifa, PhD.)
 *
 * Body text is a faithful reproduction of the source published at
 * masjidtucson.org/quran/appendices/appendix3.html
 * ────────────────────────────────────────────────────────────────────────── */

export function AppendixContent() {
  return (
    <>
      {/* Opening verse card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;We made the Quran easy to learn. Does anyone wish to
          learn?&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="54:17" /> &middot; also{' '}
          <QuranRef reference="54:22" /> &middot; <QuranRef reference="54:32" />{' '}
          &middot; <QuranRef reference="54:40" />
        </p>
      </div>

      {/* Body */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Verse <QuranRef reference="11:1" /> informs us that the Quran&rsquo;s
          Miracle involves [1] the superhuman mathematical design of its
          physical structure and [2] the simultaneous composition of a literary
          work of extraordinary excellence.
        </p>
        <p>
          One may be able to meet the numerical distribution requirements of a
          simple mathematical pattern. However, this is invariably accomplished
          at the expense of the literary quality. The simultaneous control of
          the literary style and the intricate mathematical distribution of
          individual letters throughout the Quran (Appendix 1) is evident in the
          fact that the Quran is made easy to memorize, understand, and enjoy.
          Unlike a human-made book, the Quran is enjoyable to read over and
          over, infinitely.
        </p>
        <p>
          The title of this Appendix is repeated in Sura 54, verses 17, 22, 32,
          and 40. As it turns out, the Quran&rsquo;s Arabic text is composed in
          such a way as to remind the reader or the memorizer of the next
          correct expression, or the next verse. God created us and He knows the
          most efficient way for fixing literary materials into our memory.
          Memorization of the Quran has played a vital role in preserving the
          original text generation after generation at a time when written books
          were a rarity.
        </p>
        <p>
          Without even realizing it, the person who memorizes the Quran is
          divinely helped by an intricate literary system as he utters the
          sounds of the Quranic words. Almost every verse in the Quran contains
          what I call &ldquo;Memory Bells.&rdquo; Their function is to remind
          the reader of what comes next. This system is so vast, I will give
          only two illustrative examples:
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
        <p className="font-semibold text-foreground">Example 1</p>
        <p className="text-foreground/80">
          In Sura 2, Verses 127, 128, and 129 end with two different names of
          God each. These pairs of names are &ldquo;Al-Samee&lsquo;
          Al-&lsquo;Aleem (The Hearer, the Omniscient),&rdquo; &ldquo;Al-Tawwaab
          Al-Raheem (The Redeemer, Most Merciful)&rdquo;, and
          &ldquo;Al-&lsquo;Azeez Al-Hakeem (The Almighty, Most Wise),&rdquo;
          respectively. If this were a regular book, one would easily mis-match
          these six names. Not so in the Quran. Each one of these pairs is
          preceded in the same verse by a &ldquo;Memory Bell&rdquo; that reminds
          us of the correct pair of names. Thus, Verse 127 talks about Abraham
          and Ismail raising the foundations of the Ka&lsquo;abah. The verse
          ends with the names &ldquo;Al-Samee&lsquo; Al-&lsquo;Aleem.&rdquo; The
          prominent sounds here are the &ldquo;S,&rdquo; &ldquo;M,&rdquo; and
          &ldquo; &lsquo;Ayn.&rdquo; These three letters are prominent in the
          word &ldquo;Ismail.&rdquo; We find that this word is conspicuously
          delayed in the sentence, while improving its literary quality. Thus,
          we find that the verse goes like this: &ldquo;When Abraham raised the
          foundations of the Ka&lsquo;abah, together with Ismail ...&rdquo;
          Normally, a human writer would say, &ldquo;When Abraham and Ismail
          raised the foundations of the Ka&lsquo;abah....&rdquo; But delaying
          the sounds in &ldquo;Ismail&rdquo; brings them closer to the end of
          the verse, and thus reminds us that the correct names of God in this
          verse are &ldquo;Al-Samee&lsquo; Al-&lsquo;Aleem.&rdquo;
        </p>
        <p className="text-foreground/80">
          Verse 128 has the prominent word &ldquo;Tubb&rdquo; just before the
          names &ldquo;Al-Tawwaab Al-Raheem.&rdquo; The word &ldquo;Tubb&rdquo;
          thus serves as the memory bell. The names of God at the end of{' '}
          <QuranRef reference="2:129" /> are &ldquo;Azeez, Hakeem.&rdquo; The
          prominent sounds here are &ldquo;Z&rdquo; and &ldquo;K.&rdquo;
          Obviously, the memory bell in this verse is the word
          &ldquo;Yuzakkeehim.&rdquo;
        </p>
      </div>

      {/* Example 2 */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold text-foreground">Example 2</p>
        <p className="text-foreground/80">
          Another good example is found in <QuranRef reference="3:176" />,{' '}
          <QuranRef reference="3:177" />, &amp; <QuranRef reference="3:178" />,
          where the retribution for disbelievers is described as &ldquo;
          &lsquo;Azeem (Terrible),&rdquo; &ldquo;Aleem (Painful),&rdquo; and
          &ldquo;Muheen (Humiliating),&rdquo; respectively. In a human-made
          book, the memorizer could easily mix up these three descriptions. But
          we find that each of these adjectives is preceded by powerful memory
          bells that prevent such a mix-up. The word &ldquo; &lsquo;Azeem&rdquo;
          of Verse 176 is preceded by the word &ldquo;Huzzun,&rdquo; which is
          characterized by a stressed letter &ldquo;Z.&rdquo; This serves to
          remind us of the particular adjective at the end of this verse. The
          word &ldquo;Aleem&rdquo; of Verse 177 is preceded by the sound of the
          word &ldquo;Iman&rdquo; to serve as a memory bell, and the word
          &ldquo;Muheen&rdquo; of 3:178 is preceded by an abundance of
          &ldquo;M&rdquo; and &ldquo;H&rdquo; throughout this verse.
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Other examples of memory bells include the ending of{' '}
          <QuranRef reference="3:173" /> and the beginning of{' '}
          <QuranRef reference="3:174" />, the ending of{' '}
          <QuranRef reference="4:52" /> and the beginning of{' '}
          <QuranRef reference="4:53" />, the ending of{' '}
          <QuranRef reference="4:61" /> and the beginning of{' '}
          <QuranRef reference="4:62" />, the ending of{' '}
          <QuranRef reference="18:53" /> and the beginning of{' '}
          <QuranRef reference="18:54" />, and many more.
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed
          videoId="PwY2nPtuNVE"
          title="Appendix 3 — We Made the Quran Easy"
        />
      </section>

      {/* Source attribution */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          United Submitters International / International Community of
          Submitters / Masjid Tucson
        </p>
      </div>
    </>
  )
}
