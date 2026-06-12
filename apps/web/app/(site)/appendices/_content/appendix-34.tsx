import { QuranRef } from '@/components/quran-ref'
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
          &ldquo;Successful indeed are the believers… who maintain their chastity. Except with
          their spouses… they are not to be blamed.&rdquo;
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          <QuranRef reference="23:1-6" />
        </p>
      </div>

      <div data-card className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-foreground/90">
        <p>
          Sons and daughters of the true believers must be taught that their happiness throughout
          their lives depends on following God&apos;s law and preserving their chastity. This
          means that they must keep themselves for their spouses only, and never allow anyone
          else to touch them in a sexual manner (
          <QuranRef reference="23:5-6" />, <QuranRef reference="24:30" />,{' '}
          <QuranRef reference="33:35" />, <QuranRef reference="70:29-30" />).
        </p>
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Today&apos;s society is replete with powerful temptations. In America&apos;s society
          of the eighties, even parents started talking about boyfriends for their daughters and
          girlfriends for their sons. When they reach their teens, many parents even supply
          birth control means to their children. An alarming percentage of teenagers are
          sexually active, even though they are not physiologically mature, and without any
          moral limitations.
        </p>
        <p>
          Among the results of this moral breakdown: unwanted and unsupported children,
          delinquent and irresponsible fathers, criminals who have no regard for people&apos;s
          lives or properties, millions of social misfits, incurable genital herpes, incurable
          genital warts, devastating syphilis and gonorrhea, dysplasia, the killer AIDS, and
          new diseases never known before.
        </p>
        <p>
          What most people do not know is that this moral breakdown costs them dearly
          throughout their lives. For the only law that rules the world is God&apos;s law, and
          these flagrant violations cost them a lot of misery and problems (
          <QuranRef reference="20:124" />).
        </p>
        <p>
          The true believers who care about their children will advise them and remind them
          repeatedly and persistently (<QuranRef reference="20:132" />) to keep their chastity.
          This means staying virgin until their wedding night, then staying loyal to one&apos;s
          spouse — never committing adultery — for their own happiness. God&apos;s advice to
          keep our chastity, before and after marriage, is for our own good. God is the one who
          controls our health, wealth, and happiness or misery (
          <QuranRef reference="53:43" />, <QuranRef reference="53:48" />).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="M84OWAjOYdQ" title="Appendix 34 — Virginity" />
      </section>
    </>
  )
}
