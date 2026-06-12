import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
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
          &ldquo;Read. In the name of your Lord, who created. He created man from an embryo.
          Read, and your Lord, Most Exalted. Teacher by means of the pen.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="96:1-4" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The first revelation was &ldquo;Read,&rdquo; and included the statement &ldquo;God
          teaches by means of the pen&rdquo; (<QuranRef reference="96:1-4" />), and the second
          revelation was &ldquo;The Pen&rdquo; (<QuranRef reference="68:1" />). The only
          function of the pen is to write.
        </p>
        <p>
          Ignorant Muslim scholars of the first two centuries after the Quran could not
          understand the Quran&apos;s challenge to produce anything like it. They had no idea
          about the Quran&apos;s mathematical composition, and they knew that many literary
          giants could have composed works comparable to the Quran in literary excellence. The
          ignorant scholars then decided to proclaim Muhammad an illiterate man, figuring this
          would make the Quran&apos;s extraordinary literary excellence truly miraculous.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Word &ldquo;Ummy&rdquo;
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The word they relied on to bestow illiteracy upon the Prophet was
          &ldquo;UMMY.&rdquo; Unfortunately for those &ldquo;scholars,&rdquo; this word
          clearly means &ldquo;Gentile,&rdquo; or one who does not follow any scripture (Torah,
          Injeel, or Quran) — see <QuranRef reference="2:78" />,{' '}
          <QuranRef reference="3:20" />, <QuranRef reference="3:75" />,{' '}
          <QuranRef reference="62:2" />. It does NOT mean &ldquo;illiterate.&rdquo;
        </p>
        <p>
          The Prophet was a successful merchant. The &ldquo;Muslim scholars&rdquo; who
          fabricated the illiteracy lie forgot that there were no numbers during the
          Prophet&apos;s time — the letters of the alphabet were used as numbers. As a merchant
          dealing with numbers every day, the Prophet had to know the alphabet, from one to
          one-thousand.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Quran&apos;s Own Testimony
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran tells us that Muhammad wrote down the Quran. His contemporaries are quoted
          as saying: &ldquo;These are tales from the past that he wrote down. They are being
          dictated to him day and night&rdquo; (<QuranRef reference="25:5" />). You cannot
          &ldquo;dictate&rdquo; to an illiterate person. The Prophet&apos;s enemies who accuse
          him of illiteracy abuse <QuranRef reference="29:48" />, which relates specifically to
          previous scriptures.
        </p>
        <p>
          On the 27th night of Ramadan 13 B.H. (Before Hijerah), Muhammad — the soul, the real
          person, not the body — was summoned to the highest universe and the Quran was given to
          him (<QuranRef reference="2:97" />, <QuranRef reference="17:1" />,{' '}
          <QuranRef reference="44:3" />, <QuranRef reference="53:1-18" />,{' '}
          <QuranRef reference="97:1-5" />). Subsequently, the angel Gabriel helped Muhammad
          release a few verses at a time, from the soul to Muhammad&apos;s memory. The Prophet
          wrote down and memorized the verses just released into his mind.
        </p>
        <p>
          When the Prophet died, he left the complete Quran written down with his own hand in
          the chronological order of revelation, along with specific instructions as to where to
          place every verse. The divine instructions were designed to put the Quran together
          into the final format intended for God&apos;s Final Testament to the world (
          <QuranRef reference="75:17" />). The early Muslims put the Quran together during the
          time of Khalifa Rashed &lsquo;Uthmaan. Read{' '}
          <Link href="/appendices/24">Appendix 24</Link> for the details.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed
          videoId="XkG1mHWW-QE"
          title="Appendix 28 — Muhammad Wrote God&apos;s Revelations With His Own Hand"
        />
      </section>
    </>
  )
}
