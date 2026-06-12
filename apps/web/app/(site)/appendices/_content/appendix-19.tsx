import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'

export function AppendixContent() {
  return (
    <>
      {/* ── Opening quotes card ──────────────────────────────────────────── */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4"
      >
        {[
          {
            text: 'Which Hadith, other than God and His revelations, do they uphold?',
            ref: '45:6',
          },
          {
            text: 'The Quran is not a fabricated Hadith; ...it details everything.',
            ref: '12:111',
          },
          {
            text: 'Some people uphold vain Hadith to divert others from the path of God.',
            ref: '31:6',
          },
          {
            text: "The only Sunna to follow shall be God's Sunna.",
            ref: '17:77',
          },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm leading-relaxed italic text-foreground/90">
              &ldquo;{item.text}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              <QuranRef reference={item.ref} />
            </p>
          </div>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran informs us that some enemies of the Prophet, described as
          &ldquo;human and jinn devils,&rdquo; will fabricate lies and attribute them
          to the Prophet (<QuranRef reference="6:112" />,{' '}
          <QuranRef reference="25:31" />). This is precisely what happened after the
          prophet Muhammad&apos;s death; <em>Hadith</em> (oral) and <em>Sunna</em>{' '}
          (actions) were invented and attributed to the Prophet.{' '}
          <em>Hadith</em> and <em>Sunna</em> are satanic innovations because they:
        </p>

        <ul className="space-y-2 list-none">
          {[
            <>
              Defy the divine assertions that the Quran is complete, perfect, fully
              detailed, and shall be the only source of religious guidance (
              <QuranRef reference="6:19" />, <QuranRef reference="6:38" />,{' '}
              <QuranRef reference="6:114" /> &amp; <QuranRef reference="45:6" />
              -7)
            </>,
            <>
              Blaspheme against the Prophet and depict him as a vicious tyrant who
              did not uphold the Quran
            </>,
            <>
              Create false doctrines based on superstition, ignorance, and
              indefensible nonsensical traditions
            </>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <p>
          The prophet Muhammad was enjoined, in very strong words, from issuing any
          religious teachings besides the Quran (
          <QuranRef reference="69:38" />-48).
        </p>
      </section>

      {/* ── Compromise ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Compromise Trap
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Some Muslims compromise: &ldquo;If a <em>Hadith</em> agrees with the
          Quran we will accept it, and if it contradicts the Quran, we will reject
          it!&rdquo; Such a premise proves that these people do not believe God&apos;s
          assertions that the Quran is &ldquo;complete, perfect and fully
          detailed.&rdquo; The moment they seek guidance from anything besides the
          Quran, no matter how &ldquo;right&rdquo; it seems, they fall into Satan&apos;s
          trap (see <QuranRef reference="63:1" />). For they have rejected God&apos;s
          word and set up another god besides God (
          <QuranRef reference="18:57" />). See{' '}
          <Link href="/appendices/33" className="text-primary underline underline-offset-2">
            Appendix 33
          </Link>
          .
        </p>
      </section>

      {/* ── Mathematical Proof ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Mathematical Proof
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran&apos;s mathematical miracle provides mathematical evidence that
          the Quran shall be our only source of religious teachings. Here are just
          two examples:
        </p>

        <div
          data-card
          className="rounded-xl border border-border/60 p-5 space-y-4 text-sm"
        >
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Example 1 &mdash; <QuranRef reference="6:38" />
            </p>
            <p className="text-foreground/80 leading-relaxed">
              &ldquo;We did not leave anything out of this book&rdquo; is found in
              Verse 38 (19×2) and consists of 19 Arabic letters.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Example 2 &mdash; <QuranRef reference="6:114" />
            </p>
            <p className="text-foreground/80 leading-relaxed">
              &ldquo;He sent down this book fully detailed&rdquo; is found in Verse
              114 (19×6) and consists of 19 Arabic letters.
            </p>
          </div>
        </div>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="2UxqrtHtYd0" title="Appendix 19 — Hadith & Sunna: Satanic Innovations" />
      </section>
    </>
  )
}
