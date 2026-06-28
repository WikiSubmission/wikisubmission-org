import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* Lead */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Verse <QuranRef reference="3:18" /> states the First Pillar of Islam
          (Submission):
        </p>
      </section>

      {/* 3:18 quote card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;God bears witness that there is no other god besides Him,
          and so do the angels and those who possess knowledge.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:18" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This most crucial pillar has been distorted. Millions of Muslims
          have adopted Satan&rsquo;s polytheistic version, and insist upon
          mentioning the name of Muhammad besides the name of God. However,
          the Quran&rsquo;s great criterion in <QuranRef reference="39:45" />{' '}
          stamps such Muslims as disbelievers:
        </p>
      </section>

      {/* 39:45 quote card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;When God ALONE is mentioned, the hearts of those who do
          disbelieve in the Hereafter shrink with aversion, but when others
          are mentioned with Him, they become satisfied.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="39:45" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          I have conducted extensive research into this criterion, and I have
          reached a startling conclusion: the idol worshipers who do not uphold
          the First Pillar of Islam as dictated in <QuranRef reference="3:18" />{' '}
          are forbidden by God from uttering the correct <em>Shahadah</em>.
          They simply cannot say: &ldquo;<em>Ash-hadu Allaa Elaaha Ellaa Allah</em>&rdquo;{' '}
          by itself, without mentioning the name of Muhammad. Try it with any
          idol worshiper who claims to be a Muslim. Challenge them to say:
          &ldquo;<em>Ash-hadu Allaa Elaaha Ellaa Allah</em>.&rdquo; They can
          never say it. Since this is the religion of Abraham (
          <QuranRef reference="2:130" />, <QuranRef reference="2:135" />;{' '}
          <QuranRef reference="3:95" />; <QuranRef reference="4:125" />;{' '}
          <QuranRef reference="6:161" />; <QuranRef reference="12:37" />-
          <QuranRef reference="12:38" />; <QuranRef reference="16:123" />;{' '}
          <QuranRef reference="22:78" />;{' '}
          <Link href="/quran/appendix/9" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 9
          </Link>
          ), the ONLY creed must be &ldquo;<em>LAA ELAAHA ELLAA ALLAH</em> (there
          is no god except the One God)&rdquo;. Muhammad did not exist on earth
          before Abraham.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Gross Blasphemy
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          There is no greater blasphemy than distorting the Quran to idolize
          the prophet Muhammad against his will. Verse 19 of Sura
          &ldquo;Muhammad&rdquo; (<QuranRef reference="47:19" />) states:
          &ldquo;You shall know that there is no god except the one God.&rdquo;
          Shown below is a photocopy of the regular logo of a Muslim
          publication <em>THE REVIEW OF RELIGIONS</em> (The London Mosque, 16
          Gressenhall Road, London SW18 5QL, England). Using the
          Quran&rsquo;s calligraphic style, the publishers of{' '}
          <em>THE REVIEW OF RELIGIONS</em> added the phrase &ldquo;
          <em>Muhammad Rasool Allah</em>&rdquo; in such a way that gives a
          false impression that such is the Quranic statement of{' '}
          <QuranRef reference="47:19" />. What a blasphemy!
        </p>
      </section>

      {/* Blasphemy example */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-center"
      >
        <p className="text-base leading-relaxed text-foreground/90">
          You shall know that there is no god besides the One God, Allah.
          Muhammad is a messenger of God.
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          [ The blasphemy ]
        </p>
        <p className="text-xs italic text-muted-foreground">
          Typical Example of the Distorted Islam
        </p>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="Ia54Hfyclv8" title="Appendix 13 — The First Pillar of Islam" />
      </section>
    </>
  )
}
