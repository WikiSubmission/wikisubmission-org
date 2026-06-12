import { QuranRef } from '@/components/quran-ref'
import Link from 'next/link'
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
          &ldquo;We did not leave anything out of this book.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="6:38" />
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The words of the Quran speak in <QuranRef reference="19:64" />, saying,
          &ldquo;We come down in accordance with the commandments of your Lord. To
          Him belongs the past, present, and the future. Your Lord never forgets.&rdquo;
          God did not forget, for example, to tell us how to sleep (
          <QuranRef reference="18:109" />, <QuranRef reference="31:27" />). Yet, the
          fabricators of such false doctrine as Hadith &amp; Sunna have come up with
          religious teachings dictating on their followers how to sleep, and even how
          to cut your nails. The Sacred Mosque in Mecca and the illegal
          &ldquo;Sacred Mosque&rdquo; of Medina, hire some individuals to seek out
          the exhausted visitors and beat them with a stick if they fall asleep on
          the wrong side!
        </p>
        <p>
          The Quran proclaims that the Quran is complete, perfect, and fully detailed
          (<QuranRef reference="6:19" />, <QuranRef reference="6:38" />,{' '}
          <QuranRef reference="6:114" />, <QuranRef reference="6:115" />;{' '}
          <QuranRef reference="50:45" />), and that religious regulations not
          specifically instituted in the Quran constitute a religion other than Islam
          (<QuranRef reference="42:21" />, <QuranRef reference="17:46" />). The true
          believers uphold the Quran, the whole Quran, and nothing but the Quran.
        </p>
        <p>
          This principle is confirmed by the Quran&apos;s mathematical code. Verse 46
          of Sura 17 proclaims that we shall uphold the Quran ALONE. The word
          &ldquo;ALONE&rdquo; occurs in the Quran 6 times:{' '}
          <QuranRef reference="7:70" />, <QuranRef reference="17:46" />,{' '}
          <QuranRef reference="39:45" />, <QuranRef reference="40:12" />,{' '}
          <QuranRef reference="40:84" />, and <QuranRef reference="60:4" />. All
          these occurrences refer to God, except <QuranRef reference="17:46" />.
          When we add the numbers of suras and verses which refer to &ldquo;GOD
          ALONE,&rdquo; we get 361, 19x19. This proves that{' '}
          <QuranRef reference="17:46" /> refers to &ldquo;the Quran ALONE.&rdquo;
        </p>
      </section>

      {/* ── The Quran is Sufficient ───────────────────────────────────────── */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Quran is Sufficient
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="leading-relaxed text-foreground/90">
          God&apos;s mathematical confirmation that the Quran alone is our guide is
          woven into the very structure of the scripture. The Quran is described as
          complete (<QuranRef reference="6:115" />), perfect (
          <QuranRef reference="6:38" />), and as containing all we need for salvation.
          Following any source of religious teaching beyond the Quran — regardless of
          how &ldquo;authentic&rdquo; it appears — is a departure from God&apos;s
          covenant (<QuranRef reference="42:21" />).
        </p>
        <p className="leading-relaxed text-foreground/90">
          See also <Link href="/appendices/19" className="text-primary underline underline-offset-2">Appendix 19</Link> on
          Hadith &amp; Sunna as satanic innovations, and{' '}
          <Link href="/appendices/33" className="text-primary underline underline-offset-2">Appendix 33</Link> on
          &ldquo;Why the Quran Alone.&rdquo;
        </p>
      </div>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="kc6zPAeY83Q" title="Appendix 18 — Quran: All You Need For Salvation" />
      </section>
    </>
  )
}
