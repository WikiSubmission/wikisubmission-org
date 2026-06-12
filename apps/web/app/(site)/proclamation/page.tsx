import Link from 'next/link'
import { ChevronLeft, FileText, Download } from 'lucide-react'
import { QuranRef, ScriptureRef } from '@/components/quran-ref'
import { buildPageMetadata } from '@/constants/metadata'

export const metadata = buildPageMetadata({
  title: 'Proclamation | WikiSubmission',
  description:
    'Proclaiming One Unified Religion for All the People — Rashad Khalifa, November 1989',
  url: '/proclamation',
})

function ScriptureQuote({
  children,
  source,
}: {
  children: React.ReactNode
  source: string
}) {
  return (
    <blockquote className="border-l-4 border-primary/30 pl-5 py-1 space-y-1">
      <p className="italic text-foreground/90 leading-relaxed">{children}</p>
      <p className="text-xs text-muted-foreground text-right">{source}</p>
    </blockquote>
  )
}

export default function ProclamationPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <article className="max-w-2xl mx-auto space-y-10">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="space-y-4 text-center">
          {/* <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wider uppercase">
            Proclamation · Rashad Khalifa · November 1989
          </span> */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Proclaiming One Unified Religion
            <br className="hidden sm:block" /> for All the People
          </h1>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://cdn.wikisubmission.org/books/quran-the-final-testament-proclamation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText className="size-3.5" />
              Read
            </a>
            <span className="text-border/60 text-xs">·</span>
            <a
              href="https://cdn.wikisubmission.org/books/quran-the-final-testament-proclamation.pdf"
              download
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Download className="size-3.5" />
              Download
            </a>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <section className="space-y-5 text-base leading-relaxed text-foreground/90">
          <p>
            All religions of the world—Judaism, Christianity, Islam, Hinduism,
            Buddhism, and others—have been severely corrupted through
            innovations, traditions, and the idolization of humans such as the
            prophets and the saints.
          </p>
          <p>
            God&apos;s plan, as stated in the Old Testament
            <ScriptureRef reference={'Malachi 3:1'} />, the New Testament
            <ScriptureRef reference="Luke 17:22-36" /> &amp;{' '}
            <ScriptureRef reference="Matthew 24:27" />, and this Final Testament
            <ScriptureRef reference="3:81" />, calls for the sending of
            God&apos;s Messenger of the Covenant after all the scriptures have
            been delivered. The main function of God&apos;s Messenger of the
            Covenant is to purify the scriptures and unify them into one
            universal message to this world from the Creator and Sustainer of
            this world.
          </p>
          <p>
            This major scriptural prophecy has now been fulfilled. God&apos;s
            Messenger of the Covenant has arrived, supported by overwhelming
            tangible proof (see{' '}
            <Link
              href="/appendices/2"
              className="text-primary hover:underline text-sm"
            >
              Appendix Two
            </Link>
            ) . The purification and unification process has begun. God&apos;s
            plan is supported by God&apos;s invisible forces, and the enormous
            dimensions of this divine plan is manifest in the recent exposure of
            false religionists, and the removal of such anti-freedom barriers as
            the Berlin Wall, the Iron Curtain, and the bamboo curtain.
          </p>
          <p>
            Henceforth, there is only one religion acceptable to God—Submission.
          </p>
          <p>
            Anyone who submits to God and devotes the worship to God{' '}
            <strong>ALONE </strong> is a &ldquo;Submitter.&rdquo; Thus, one may
            be a Jewish Submitter, a Christian Submitter, a Buddhist Submitter,
            a Hindu Submitter, or a Muslim Submitter.
          </p>
        </section>

        {/* ── Quran verse card (the "one-cell table") ────────────────────── */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3 text-center">
          <p className="text-base leading-relaxed">
            The only religion acceptable to God is Submission.{' '}
            <QuranRef reference="3:19" />
          </p>
          <hr className="border-primary/10" />
          <p className="text-base leading-relaxed">
            Anyone who seeks other than Submission as his religion, it will not
            be accepted from him and, in the Hereafter, he will be with the
            losers. <QuranRef reference="3:85" />
          </p>
        </div>

        {/* ── Scripture prophecies ───────────────────────────────────────── */}
        <section className="space-y-6">
          <ScriptureQuote source="Moses in Deuteronomy 18:15">
            A prophet like me will the Lord, your God, raise up for you from
            among your kinsmen; to him you shall listen.
          </ScriptureQuote>

          <ScriptureQuote source="Deuteronomy 18:18–19">
            I will raise up for them a prophet like you from among their
            kinsmen, and will put My words into his mouth; he shall tell them
            all that I command him. If any man will not listen to My words which
            he speaks in My name, I Myself will make him answer for it.
          </ScriptureQuote>

          <ScriptureQuote source="Jesus in John 14:16–17">
            I will ask the Father, and He will give you another Paraclete — to
            be with you always:{' '}
            <strong className="uppercase">The Spirit of Truth.</strong>
          </ScriptureQuote>

          <ScriptureQuote source="Jesus in John 16:13">
            When <strong className="uppercase">The Spirit of Truth</strong>{' '}
            comes to you, he will guide you to all truth, and will announce to
            you the things to come.
          </ScriptureQuote>
        </section>

        {/* ── God's Messenger of the Covenant ────────────────────────────── */}
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-border/50" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
            God&apos;s Messenger of the Covenant
          </h2>
          <hr className="flex-1 border-border/50" />
        </div>

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

        {/* ── Second Quran verse ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-base leading-relaxed">
            When <strong>God ALONE</strong> is mentioned, the hearts of those
            who do not believe in the Hereafter shrink with aversion. But when
            others are mentioned besides Him, they rejoice.{' '}
            <QuranRef reference="39:45" />
          </p>
        </div>

        {/* ── Historical narrative ────────────────────────────────────────── */}
        <hr className="border-border/40" />

        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            On the 27th night of Ramadan, 13 B.H. (Before Hijra) (610 A.D.), the
            prophet Muhammad (the soul—the real person—not the body) was
            summoned to the highest possible point, millions of light years from
            the planet Earth, and this Quran was placed into his heart (
            <ScriptureRef reference="2:185" />,{' '}
            <ScriptureRef reference="17:1" />,<ScriptureRef reference="44:3" />,{' '}
            <ScriptureRef reference="53:1-18" />,{' '}
            <ScriptureRef reference="97:1" />
            ).
          </p>
          <p>
            Subsequently, the Quran was released into Muhammad&apos;s memory,
            with Gabriel&apos;s mediation, over a period of 23 years, 610 to 632
            A.D. (<ScriptureRef reference="17:106" />
            ). At the moment of release, Muhammad scrupulously wrote it down
            with his own hand (
            <Link
              href="/appendices/28"
              className="text-primary hover:underline text-sm"
            >
              Appendix 28
            </Link>
            ). What Muhammad left was the complete Quran, written in the
            chronological sequence of revelation, with detailed instructions for
            putting the revelations into the sequence decreed by God.
          </p>
          <p>
            During the re-arrangement process, the scribes who idolized the
            Prophet added two verses at the end of Sura 9, the last sura
            revealed in Medina. This blasphemous act resulted in a 50-year war
            between Ali Ibn Abi Taaleb and his supporters on one side and the
            distorters of the Quran on the other side. The war ended when
            Hussein ibn Ali and his family were martyred in Karbala.
          </p>
          <p>
            It was the Umayyad ruler Marwan Ibn Al-Hakam (died in 684 AD) who
            destroyed the original Quran that was written by Muhammad&apos;s
            hand, &ldquo;fearing the eruption of new disputes.&rdquo;
          </p>
          <p>
            God&apos;s Messenger of the Covenant has presented overwhelming
            evidence that 9:128-129 do not belong in the Quran (
            <Link
              href="/appendices/24"
              className="text-primary hover:underline text-sm"
            >
              Appendix 24
            </Link>
            ). With the removal of these false verses, the Quran has finally
            been restored. Our generation is the first ever to receive the Quran
            in its purified and finalized form (see{' '}
            <Link
              href="/appendices/1"
              className="text-primary hover:underline text-sm"
            >
              Appendices 1
            </Link>{' '}
            and{' '}
            <Link
              href="/appendices/28"
              className="text-primary hover:underline text-sm"
            >
              28
            </Link>
            ).
          </p>
        </section>

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border/40">
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to Quran
          </Link>
        </div>
      </article>
    </main>
  )
}
