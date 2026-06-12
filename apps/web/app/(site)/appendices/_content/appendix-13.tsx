import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
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
          &ldquo;God bears witness that there is no other god besides Him,
          and so do the angels and those who possess knowledge.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="3:18" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The First Pillar of Islam — &ldquo;Laa Elaaha Ellaa Allah&rdquo;
          (There is no god except God) — is the very foundation of
          Submission. This declaration is established in{' '}
          <QuranRef reference="3:18" /> and confirmed throughout the Quran
          as the religion of Abraham (
          <QuranRef reference="2:130" />, <QuranRef reference="2:135" />;{' '}
          <QuranRef reference="3:95" />; <QuranRef reference="4:125" />;{' '}
          <QuranRef reference="6:161" />; <QuranRef reference="12:37" />–
          <QuranRef reference="12:38" />; <QuranRef reference="16:123" />;{' '}
          <QuranRef reference="22:78" />; see also{' '}
          <Link href="/quran/appendix/9" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Appendix 9
          </Link>
          ).
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Corrupted Pillar
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          This pillar has been corrupted. Many have adopted the practice of
          mentioning Muhammad alongside God — a form of idolatry that the
          Quran explicitly condemns. The test is described in{' '}
          <QuranRef reference="39:45" />:
        </p>
      </section>

      {/* Quote card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
      >
        <p className="text-base leading-relaxed italic text-foreground/90">
          &ldquo;When God ALONE is mentioned, the hearts of those who do not
          believe in the Hereafter shrink with aversion. But when others are
          mentioned alongside Him, they rejoice.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="39:45" />
        </p>
      </div>

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
          Distorting the Quran to elevate the Prophet Muhammad is a
          blasphemy the Quran condemns. Verse{' '}
          <QuranRef reference="47:19" /> states:{' '}
          <em>
            &ldquo;You shall know that there is no god except the one
            God.&rdquo;
          </em>
        </p>
        <p>
          As an example, certain publications have added &ldquo;Muhammad
          Rasool Allah&rdquo; in Quranic calligraphic style directly
          alongside <QuranRef reference="47:19" />, falsely implying it is
          part of the divine text. Such additions create a gross and
          misleading impression that stands in direct contradiction to the
          verse itself.
        </p>
      </section>

      {/* Key verses card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold uppercase tracking-widest text-primary text-xs">
          The Correct Shahada
        </p>
        <p className="text-foreground/80 leading-relaxed">
          The Shahada recognized in the Quran contains only one statement:
          &ldquo;There is no god except God.&rdquo; Adding the name of any
          prophet or human to this declaration violates the very monotheism
          it is meant to affirm (see <QuranRef reference="3:18" />,{' '}
          <QuranRef reference="47:19" />).
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
