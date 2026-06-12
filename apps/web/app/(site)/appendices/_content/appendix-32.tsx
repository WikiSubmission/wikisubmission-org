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
          &ldquo;When he reaches his maturity and reaches the age of forty, he says,
          &lsquo;My Lord, direct me to appreciate the blessings You have bestowed upon me and
          upon my parents, and to do the righteous works that please You.&rsquo;&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="46:15" />
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          What is the age of responsibility? If a child dies at the age of 12, without even
          hearing about God, does this child go to Heaven or Hell? What if the child is 15
          years old, or 21, or 25? At what age will the human being be held responsible for his
          or her beliefs? This question has puzzled researchers of all religions for a long
          time.
        </p>
        <p>
          The Quran sets the age of responsibility at 40; anyone who dies before this age goes
          to Heaven (<QuranRef reference="46:15" />). If the person believed in God and
          benefitted from belief by nourishing and developing the soul (see{' '}
          <Link href="/appendices/15">Appendix 15</Link>), he or she goes to the High Heaven.
          Otherwise, the person goes to the Lower Heaven.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          God&apos;s Mercy
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Your first reaction to this piece of information might be objection: &ldquo;What if
          the person was really bad, evil, and an atheist — will he go to Heaven if he died
          before the age of 40?&rdquo; This is because we are mean, while God is the Most
          Merciful. Our tendency is to &ldquo;put them all in Hell.&rdquo;
        </p>
        <p>
          People who object strongly to this Divine mercy cannot come up with a cut-off age of
          responsibility. They ask: &ldquo;What if the person was really wicked?&rdquo; The
          answer is: Does God know that this person was wicked? Yes. Does God know that this
          person does not deserve to go to Heaven? Yes. Therefore, this person will not die
          before the age of 40. As simple as that. God is the only one who terminates our lives
          on this earth. He knows exactly who deserves to go to Heaven and who deserves to go
          to Hell.
        </p>
      </section>

      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          A Confirming Sign
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Early in 1989 a man named Theodore Robert Bundy was executed for killing a number of
          women. The whole nation agreed that he was one of the most vicious criminals in
          history. Many journalists and politicians lamented that justice took eleven years to
          execute Ted Bundy — that he should have been executed within a maximum of six years
          after his conviction. According to the Quran, this would have been the greatest favor
          anyone could have done to Bundy. He was 42 years old when executed. Had he been
          executed five years earlier, at the age of 37, he would have gone straight to Heaven,
          and he did not deserve that.
        </p>
        <p>
          As it turns out, Bundy was one of the signs God has given us to confirm that anyone
          who dies before 40 goes to Heaven. Bundy&apos;s name, Theodore Robert Bundy, consists
          of 19 letters, and he confessed to killing 19 women just one day before his
          execution.
        </p>
        <p>
          Delivering this important piece of information is one of the responsibilities given
          as God&apos;s Messenger of the Covenant. It is not a personal opinion.
        </p>
        <p>
          It is noteworthy that both Martin Luther King and Malcolm X were assassinated just a
          couple of months before their 40th birthdays.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="J53TKCcic8I" title="Appendix 32 — The Crucial Age of 40" />
      </section>
    </>
  )
}
