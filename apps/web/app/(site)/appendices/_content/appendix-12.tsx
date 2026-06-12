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
          &ldquo;The messenger&apos;s sole duty is to deliver the message.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="5:99" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Prophet&apos;s sole mission was to deliver the Quran — the
          whole Quran, and nothing but the Quran (
          <QuranRef reference="3:20" />; <QuranRef reference="5:48" />–
          <QuranRef reference="5:50" />; <QuranRef reference="5:92" />;{' '}
          <QuranRef reference="5:99" />; <QuranRef reference="6:19" />;{' '}
          <QuranRef reference="13:40" />; <QuranRef reference="16:35" />;{' '}
          <QuranRef reference="16:82" />; <QuranRef reference="24:54" />;{' '}
          <QuranRef reference="29:18" />; <QuranRef reference="42:48" />;{' '}
          <QuranRef reference="64:12" />).
        </p>
        <p>
          Delivering the Quran was such an important and all-consuming duty
          that the Prophet had no time for other activities. Furthermore, he
          was strongly forbidden from offering any religious teachings beyond
          the Quran (<QuranRef reference="69:38" />–<QuranRef reference="69:47" />
          ) or from explaining it (<QuranRef reference="75:15" />–
          <QuranRef reference="75:19" />). God alone is the teacher of the
          Quran (<QuranRef reference="55:1" />–<QuranRef reference="55:2" />
          ).
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Quran: The Best Hadith
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Quran itself is described as the best Hadith (
          <QuranRef reference="39:23" />, <QuranRef reference="45:6" />
          ). Any religious source outside of it was neither sanctioned nor
          delivered by the Prophet.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4" data-parallax>
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          Hadith &amp; Sunna: A Later Fabrication
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Hadith and Sunna attributions did not surface until the second
          century after the Prophet&apos;s death. The Quran predicted this
          fabrication (<QuranRef reference="6:112" />–
          <QuranRef reference="6:115" />) and warns that attraction to these
          sources indicates false belief (<QuranRef reference="6:113" />).
        </p>
        <p>
          Two Hadith quotes themselves confirm that the Prophet instructed
          his followers to write down only the Quran, and to avoid recording
          his other statements during his lifetime.
        </p>
      </section>

      {/* Highlighted card */}
      <div
        data-card
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm"
      >
        <p className="font-semibold uppercase tracking-widest text-primary text-xs">
          Key Verses
        </p>
        <ul className="space-y-2 text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              <QuranRef reference="69:38" />–<QuranRef reference="69:47" />{' '}
              — The Prophet was forbidden from teaching beyond the Quran.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              <QuranRef reference="75:15" />–<QuranRef reference="75:19" />{' '}
              — God Himself explains the Quran; the Prophet was not to do so.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              <QuranRef reference="55:1" />–<QuranRef reference="55:2" /> —
              The Most Gracious; He taught the Quran.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">·</span>
            <span>
              <QuranRef reference="39:23" />, <QuranRef reference="45:6" />{' '}
              — The Quran is the best Hadith; what other Hadith after God and
              His revelations do they uphold?
            </span>
          </li>
        </ul>
      </div>

      {/* YouTube */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="vyhPUP1Letc" title="Appendix 12 — Role of the Prophet Muhammad" />
      </section>
    </>
  )
}
