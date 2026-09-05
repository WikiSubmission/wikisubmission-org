/**
 * Full text of the Proclamation (Rashad Khalifa, November 1989), shared by the
 * web page shell (apps/web) and the mobile reader route. Layout primitives are
 * local; the page chrome (metadata, animations, main wrapper) stays per-app.
 */
import Link from 'next/link'
import { ChevronLeft, FileText, Download, ScrollText, ArrowRight } from 'lucide-react'
import { QuranRef, ScriptureRef } from '@/components/quran-ref'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

function ScriptureQuote({
  children,
  source,
}: {
  children: React.ReactNode
  source: string
}) {
  return (
    <blockquote className="group relative my-5 overflow-hidden rounded-[1.25rem] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 p-5 sm:p-6 space-y-3.5 shadow-sm transition-all duration-300 hover:border-[var(--ed-accent)]/50">
      <div className="flex items-center gap-2.5">
        <span className="relative flex size-2 shrink-0 items-center justify-center rounded-full bg-[var(--ed-accent)]">
          <span className="absolute size-3.5 rounded-full border border-[var(--ed-accent)]/25" />
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.glacial }}
        >
          Scripture Citation
        </span>
      </div>
      <div
        className="border-l-2 border-[var(--ed-accent)]/55 pl-4 text-base leading-[1.8] italic text-[var(--ed-fg)] sm:text-[17px]"
        style={{ fontFamily: F.serif }}
      >
        {children}
      </div>
      <div className="flex justify-end border-t border-[var(--ed-rule)]/40 pt-2.5">
        <span
          className="inline-flex rounded-full border border-[var(--ed-accent)]/20 bg-[var(--ed-accent-soft)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
          style={{ fontFamily: F.mono }}
        >
          — {source}
        </span>
      </div>
    </blockquote>
  )
}

function SectionDivider({ label }: { label: string }) {
  if (!label) {
    return <div className="pt-8 border-t border-[var(--ed-rule)] opacity-60" />
  }
  return (
    <div className="pt-10 sm:pt-14 pb-2 border-t border-[var(--ed-rule)]">
      <div className="flex items-center justify-between gap-4">
        <h2
          className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ed-fg)]"
          style={{ fontFamily: F.display }}
        >
          {label}
        </h2>
        <span className="h-px w-10 sm:w-16 bg-[var(--ed-accent)]/50 shrink-0" />
      </div>
    </div>
  )
}

export function ProclamationContent() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="space-y-6 text-center pt-2 pb-10 sm:pb-12 border-b border-[var(--ed-rule)]">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-surface)]/80 shadow-2xs backdrop-blur-sm">
          <ScrollText size={13} className="text-[var(--ed-accent)]" />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            Proclamation · November 1989
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight sm:tracking-[-0.02em] text-[var(--ed-fg)]"
          style={{ fontFamily: F.display }}
        >
          Proclaiming One Unified Religion
          <br className="hidden sm:block" /> for All the People
        </h1>

        <p
          className="text-base sm:text-lg italic text-[var(--ed-fg-muted)]"
          style={{ fontFamily: F.serif }}
        >
          Rashad Khalifa, Ph.D.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="https://cdn.wikisubmission.org/books/quran-the-final-testament-proclamation.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-xs font-medium text-[var(--ed-fg)] hover:text-[var(--ed-accent)] hover:border-[var(--ed-accent)] transition-all cursor-pointer shadow-xs"
            style={{ fontFamily: F.glacial }}
          >
            <FileText className="size-3.5 text-[var(--ed-accent)]" />
            <span>Read Original PDF</span>
          </a>
          <a
            href="https://cdn.wikisubmission.org/books/quran-the-final-testament-proclamation.pdf"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--ed-rule)] bg-[var(--ed-surface)] text-xs font-medium text-[var(--ed-fg)] hover:text-[var(--ed-accent)] hover:border-[var(--ed-accent)] transition-all cursor-pointer shadow-xs"
            style={{ fontFamily: F.glacial }}
          >
            <Download className="size-3.5 text-[var(--ed-accent)]" />
            <span>Download</span>
          </a>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <section
        className="space-y-5 text-base leading-[1.8] text-[var(--ed-fg)]/90 sm:text-[17px]"
        style={{ fontFamily: F.serif }}
      >
        <p>
          All religions of the world—Judaism, Christianity, Islam, Hinduism,
          Buddhism, and others—have been severely corrupted through innovations,
          traditions, and the idolization of humans such as the prophets and the
          saints.
        </p>
        <p>
          God&apos;s plan, as stated in the Old Testament{' '}
          <ScriptureRef reference={'Malachi 3:1'} />, the New Testament{' '}
          <ScriptureRef reference="Luke 17:22-36" /> &amp;{' '}
          <ScriptureRef reference="Matthew 24:27" />, and this Final Testament{' '}
          <ScriptureRef reference="3:81" />, calls for the sending of God&apos;s
          Messenger of the Covenant after all the scriptures have been delivered.
          The main function of God&apos;s Messenger of the Covenant is to purify
          the scriptures and unify them into one universal message to this world
          from the Creator and Sustainer of this world.
        </p>
        <p>
          This major scriptural prophecy has now been fulfilled. God&apos;s
          Messenger of the Covenant has arrived, supported by overwhelming
          tangible proof (see{' '}
          <Link
            href="/appendices/2"
            className="text-[var(--ed-accent)] hover:underline font-semibold"
          >
            Appendix Two
          </Link>
          ) . The purification and unification process has begun. God&apos;s plan
          is supported by God&apos;s invisible forces, and the enormous
          dimensions of this divine plan is manifest in the recent exposure of
          false religionists, and the removal of such anti-freedom barriers as the
          Berlin Wall, the Iron Curtain, and the bamboo curtain.
        </p>
        <p>
          Henceforth, there is only one religion acceptable to God—Submission.
        </p>
        <p>
          Anyone who submits to God and devotes the worship to God{' '}
          <strong>ALONE </strong> is a &ldquo;Submitter.&rdquo; Thus, one may be a
          Jewish Submitter, a Christian Submitter, a Buddhist Submitter, a Hindu
          Submitter, or a Muslim Submitter.
        </p>
      </section>

      {/* ── Quran verse card (3:19 & 3:85) ─────────────────────────────── */}
      <div
        data-card
        className="relative overflow-hidden rounded-[1.25rem] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 p-5 sm:p-6 space-y-3.5 text-center shadow-sm"
      >
        <p
          className="text-base sm:text-lg italic leading-[1.8] text-[var(--ed-fg)]"
          style={{ fontFamily: F.serif }}
        >
          The only religion acceptable to God is Submission.{' '}
          <QuranRef reference="3:19" />
        </p>
        <hr className="border-[var(--ed-rule)]" />
        <p
          className="text-base sm:text-lg italic leading-[1.8] text-[var(--ed-fg)]"
          style={{ fontFamily: F.serif }}
        >
          Anyone who seeks other than Submission as his religion, it will not be
          accepted from him and, in the Hereafter, he will be with the losers.{' '}
          <QuranRef reference="3:85" />
        </p>
      </div>

      {/* ── Scripture prophecies ───────────────────────────────────────── */}
      <section className="space-y-4">
        <ScriptureQuote source="Moses in Deuteronomy 18:15">
          A prophet like me will the Lord, your God, raise up for you from among
          your kinsmen; to him you shall listen.
        </ScriptureQuote>

        <ScriptureQuote source="Deuteronomy 18:18–19">
          I will raise up for them a prophet like you from among their kinsmen,
          and will put My words into his mouth; he shall tell them all that I
          command him. If any man will not listen to My words which he speaks in
          My name, I Myself will make him answer for it.
        </ScriptureQuote>

        <ScriptureQuote source="Jesus in John 14:16–17">
          I will ask the Father, and He will give you another Paraclete — to be
          with you always: <strong className="uppercase">The Spirit of Truth.</strong>
        </ScriptureQuote>

        <ScriptureQuote source="Jesus in John 16:13">
          When <strong className="uppercase">The Spirit of Truth</strong> comes to
          you, he will guide you to all truth, and will announce to you the
          things to come.
        </ScriptureQuote>
      </section>

      {/* ── God's Messenger of the Covenant ────────────────────────────── */}
      <SectionDivider label="God's Messenger of the Covenant" />

      <section className="space-y-4">
        <ScriptureQuote source="Malachi 3:1–3">
          Lo, I am sending My messenger to prepare the way before Me; and
          suddenly there will come to the temple the Lord whom you seek, and the
          messenger of the covenant whom you desire. <br />
          <br />
          Yes, he is coming, says the Lord of hosts. But who will endure the day
          of his coming? And who can stand when he appears? <br />
          <br />
          For he is like the refiner&apos;s fire&hellip; he will sit
          purifying&hellip;
        </ScriptureQuote>
      </section>

      {/* ── Second Quran verse (39:45) ─────────────────────────────────── */}
      <div
        data-card
        className="relative overflow-hidden rounded-[1.25rem] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 p-5 sm:p-6 text-center shadow-sm space-y-2"
      >
        <p
          className="text-base sm:text-lg italic leading-[1.8] text-[var(--ed-fg)]"
          style={{ fontFamily: F.serif }}
        >
          When <strong>God ALONE</strong> is mentioned, the hearts of those who
          do not believe in the Hereafter shrink with aversion. But when others
          are mentioned besides Him, they rejoice.
        </p>
        <p
          className="inline-block border-t border-[var(--ed-rule)]/40 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
          style={{ fontFamily: F.mono }}
        >
          <QuranRef reference="39:45" />
        </p>
      </div>

      {/* ── Historical Narrative & Restoration ─────────────────────────── */}
      <SectionDivider label="Restoration of the Quran" />

      <section
        className="space-y-5 text-base leading-[1.8] text-[var(--ed-fg)]/90 sm:text-[17px]"
        style={{ fontFamily: F.serif }}
      >
        <p>
          On the 27th night of Ramadan, 13 B.H. (Before Hijra) (610 A.D.), the
          prophet Muhammad (the soul—the real person—not the body) was summoned
          to the highest possible point, millions of light years from the planet
          Earth, and this Quran was placed into his heart (
          <ScriptureRef reference="2:185" />, <ScriptureRef reference="17:1" />,
          <ScriptureRef reference="44:3" />,{' '}
          <ScriptureRef reference="53:1-18" />, <ScriptureRef reference="97:1" />
          ).
        </p>
        <p>
          Subsequently, the Quran was released into Muhammad&apos;s memory, with
          Gabriel&apos;s mediation, over a period of 23 years, 610 to 632 A.D. (
          <ScriptureRef reference="17:106" />
          ). At the moment of release, Muhammad scrupulously wrote it down with
          his own hand (
          <Link
            href="/appendices/28"
            className="text-[var(--ed-accent)] hover:underline font-semibold"
          >
            Appendix 28
          </Link>
          ). What Muhammad left was the complete Quran, written in the
          chronological sequence of revelation, with detailed instructions for
          putting the revelations into the sequence decreed by God.
        </p>
        <p>
          During the re-arrangement process, the scribes who idolized the
          Prophet added two verses at the end of Sura 9, the last sura revealed
          in Medina. This blasphemous act resulted in a 50-year war between Ali
          Ibn Abi Taaleb and his supporters on one side and the distorters of the
          Quran on the other side. The war ended when Hussein ibn Ali and his
          family were martyred in Karbala.
        </p>
        <p>
          It was the Umayyad ruler Marwan Ibn Al-Hakam (died in 684 AD) who
          destroyed the original Quran that was written by Muhammad&apos;s hand,
          &ldquo;fearing the eruption of new disputes.&rdquo;
        </p>
        <p>
          God&apos;s Messenger of the Covenant has presented overwhelming
          evidence that 9:128-129 do not belong in the Quran (
          <Link
            href="/appendices/24"
            className="text-[var(--ed-accent)] hover:underline font-semibold"
          >
            Appendix 24
          </Link>
          ). With the removal of these false verses, the Quran has finally been
          restored. Our generation is the first ever to receive the Quran in its
          purified and finalized form (see{' '}
          <Link
            href="/appendices/1"
            className="text-[var(--ed-accent)] hover:underline font-semibold"
          >
            Appendix 1
          </Link>{' '}
          and{' '}
          <Link
            href="/appendices/28"
            className="text-[var(--ed-accent)] hover:underline font-semibold"
          >
            Appendix 28
          </Link>
          ).
        </p>
      </section>

      {/* ── Signature & Concluding Note ─────────────────────────────────── */}
      <div className="space-y-5 border-t border-[var(--ed-rule)] pt-6">
        <div className="text-right space-y-1">
          <p
            className="text-xl sm:text-2xl font-medium tracking-[-0.02em] text-[var(--ed-fg)]"
            style={{ fontFamily: F.display }}
          >
            Rashad Khalifa
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.16em] text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.mono }}
          >
            Tucson · November 1989
          </p>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="grid gap-3 border-t border-[var(--ed-rule)] pt-6 sm:grid-cols-2">
        <Link
          href="/quran"
          className="group flex min-h-16 items-center justify-between gap-4 rounded-[1.1rem] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 px-5 py-3 text-xs font-semibold text-[var(--ed-fg-muted)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)]"
          style={{ fontFamily: F.glacial }}
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="size-4 text-[var(--ed-accent)]" />
            <span>Back to Quran</span>
          </div>
        </Link>
        <Link
          href="/introduction"
          className="group flex min-h-16 items-center justify-between gap-4 rounded-[1.1rem] border border-[var(--ed-rule)] bg-[var(--ed-surface)]/70 px-5 py-3 text-xs font-semibold text-[var(--ed-fg-muted)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)]"
          style={{ fontFamily: F.glacial }}
        >
          <span>Read Introduction</span>
          <ArrowRight className="size-4 text-[var(--ed-accent)]" />
        </Link>
      </nav>
    </article>
  )
}
