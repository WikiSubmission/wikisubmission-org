import { QuranRef } from '@/components/quran-ref'
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
          &ldquo;I am God. There is no other god besides Me.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="20:14" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          In English-speaking regions where trinitarian theology dominates,
          God&apos;s use of the plural tense in the Quran intrigues some
          readers. However, the Quran&apos;s core message emphasizes
          monotheism uncompromisingly across numerous verses (
          <QuranRef reference="2:133" />, <QuranRef reference="2:163" />;{' '}
          <QuranRef reference="4:171" />; <QuranRef reference="5:73" />;{' '}
          <QuranRef reference="6:19" />; <QuranRef reference="9:31" />;{' '}
          <QuranRef reference="12:39" />; <QuranRef reference="13:16" />;{' '}
          <QuranRef reference="14:48" />, <QuranRef reference="14:52" />;{' '}
          <QuranRef reference="16:22" />, <QuranRef reference="16:51" />;{' '}
          <QuranRef reference="18:110" />; <QuranRef reference="21:108" />;{' '}
          <QuranRef reference="22:34" />; <QuranRef reference="37:4" />;{' '}
          <QuranRef reference="38:65" />; <QuranRef reference="39:4" />;{' '}
          <QuranRef reference="40:16" />; <QuranRef reference="41:6" />;{' '}
          <QuranRef reference="112:1" />).
        </p>
        <p>
          The first-person plural form employed by God consistently represents
          participation by other entities, particularly the angels. The
          Quran&apos;s revelation exemplifies this: &ldquo;We revealed this
          scripture, and we will preserve it&rdquo; (<QuranRef reference="15:9" />
          ), reflecting Gabriel&apos;s and Muhammad&apos;s involvement in
          delivering the sacred text.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Adam vs. Jesus
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Another illustration involves the breathing of life into Adam and
          Jesus. Adam&apos;s creation occurred in heaven with direct divine
          action, employing singular language:{' '}
          <em>
            &ldquo;I blew into Adam from My spirit&rdquo;
          </em>{' '}
          (<QuranRef reference="15:29" />, <QuranRef reference="38:72" />).
          Jesus&apos;s creation, occurring on earth through Gabriel&apos;s
          mediation, uses plural forms (
          <QuranRef reference="21:91" />, <QuranRef reference="66:12" />).
        </p>
        <p>
          When God addressed Moses directly without angelic intermediation,
          singular language appears:{' '}
          <em>
            &ldquo;I am God. There is no other god besides Me&rdquo;
          </em>{' '}
          (<QuranRef reference="20:12" />–<QuranRef reference="20:14" />).
        </p>
        <p>
          Worship-related references consistently employ the singular tense (
          <QuranRef reference="51:56" />), underscoring that God alone is to
          be worshipped.
        </p>
      </section>

      {/* Summary card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold uppercase tracking-widest text-primary text-xs">
          Summary
        </p>
        <ul className="space-y-2 text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              God&apos;s use of &ldquo;We&rdquo; reflects participation of
              angels and messengers — not a plurality of gods.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              Direct, unmediated divine communication always uses the
              singular first person.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              The Quran&apos;s overarching message of pure monotheism is
              never in doubt — see <QuranRef reference="112:1" />.
            </span>
          </li>
        </ul>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="ONjW_ayZ1Fo" title="Appendix 10 — God's Usage of the Plural Tense" />
      </section>
    </>
  )
}
