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
          &ldquo;The sole duty of the messenger is to deliver the message.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="5:99" />
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The Prophet&apos;s sole mission was to deliver Quran, the whole Quran, and
          nothing but Quran (<QuranRef reference="3:20" />;{' '}
          <QuranRef reference="5:48-50" />, <QuranRef reference="5:92" />,{' '}
          <QuranRef reference="5:99" />; <QuranRef reference="6:19" />;{' '}
          <QuranRef reference="13:40" />; <QuranRef reference="16:35" />,{' '}
          <QuranRef reference="16:82" />; <QuranRef reference="24:54" />;{' '}
          <QuranRef reference="29:18" />; <QuranRef reference="42:48" />;{' '}
          <QuranRef reference="64:12" />).
        </p>
        <p>
          Delivering the Quran was such a momentous and noble mission that the Prophet
          did not have any time to do anything else. Moreover, the Prophet was enjoined
          in the strongest words from issuing any religious teachings besides the Quran (
          <QuranRef reference="69:38-47" />). He was even enjoined from explaining the
          Quran (<QuranRef reference="75:15-19" />) — God is the only teacher of the Quran
          (<QuranRef reference="55:1-2" />) and the Quran is the best Hadith (
          <QuranRef reference="39:23" /> &amp; <QuranRef reference="45:6" />).
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
          These Quranic facts are manifested in the historical reality that the words and
          actions (Hadith &amp; Sunna) attributed to the Prophet did not appear until the
          second century after his death. The Quran has prophesied the fabrication of
          Hadith and Sunna by the Prophet&apos;s enemies (<QuranRef reference="6:112-115" />).
          The Quran teaches us that it was God&apos;s will to permit the invention of Hadith
          and Sunna to serve as criteria for exposing those who believe only with their
          lips, not in their hearts. Those who are attracted to Hadith and Sunna are proven
          to be false believers (<QuranRef reference="6:113" />). Ironically, the books of
          Hadith report the Prophet&apos;s orders to write down nothing from him except the
          Quran! Shown below are two such Hadiths taken from the Hadithists&apos; most
          reliable sources, Sahih Muslim and Is-haah Ahmad Ibn Hanbal:
        </p>
        <blockquote className="border-l-2 border-primary/40 pl-4 italic text-foreground/80 space-y-1">
          <p>
            The Prophet said, &ldquo;Do not write down anything from me except the
            Quran.&rdquo;
          </p>
          <p className="text-xs not-italic text-muted-foreground">
            [Ahmed, Vol. 1, Page 171, and Sahih Muslim]
          </p>
        </blockquote>
        <blockquote className="border-l-2 border-primary/40 pl-4 italic text-foreground/80 space-y-1">
          <p>
            This Hadith states that the Prophet maintained his anti-Hadith stand until
            death.
          </p>
          <p className="text-xs not-italic text-muted-foreground">
            [Ahmed, Vol. 1, Page 192]
          </p>
        </blockquote>
      </section>

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
