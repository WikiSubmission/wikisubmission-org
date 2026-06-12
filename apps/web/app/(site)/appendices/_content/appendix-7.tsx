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
          We are in this world because we committed a horrendous crime, and this life
          is our chance to redeem ourselves, denounce our crime, and rejoin God&apos;s
          kingdom.
        </p>
      </div>

      {/* The Beginning */}
      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          It all began a few billion years ago when &ldquo;a feud arose in the Heavenly
          Society&rdquo; (<QuranRef reference="38:69" />). One of the high-ranking
          creatures, Satan, entertained supercilious thoughts that his God-given powers
          qualified him to be a god besides God. He thus challenged God&apos;s absolute
          authority. Not only was Satan&apos;s idea blasphemous — it was wrong. Only God,
          and no one else, possesses the qualifications and ability to be a god.
        </p>
        <p>
          Consequent to Satan&apos;s blasphemy, a division occurred in the Heavenly
          Society, and all constituents of God&apos;s kingdom became classified into
          four categories:
        </p>

        <ol className="space-y-3 list-none">
          {[
            {
              label: 'Angels',
              desc: 'Creatures who upheld God\'s absolute authority.',
            },
            {
              label: 'Animals',
              desc: 'Rebels (animals, trees, stars, etc.) who took advantage of God\'s offer to repent and re-enter His kingdom.',
            },
            {
              label: 'Jinns',
              desc: 'Creatures who agreed with Satan that he is capable of being a "god."',
            },
            {
              label: 'Humans',
              desc: 'Creatures who did not make up their minds; they failed to make a firm stand with God\'s absolute authority.',
            },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">
                <strong>{item.label}:</strong> {item.desc}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* The Most Merciful */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Most Merciful
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          The angels expected God to banish the creatures who did not uphold His absolute
          authority (<QuranRef reference="2:30" />). But God is Most Merciful; He decided
          to give us a chance to denounce our mistake, and informed the angels that He
          knew what they did not know (<QuranRef reference="2:30" />). God knew that some
          creatures deserved a chance to be redeemed.
        </p>
        <p>
          If you claim the ability to fly a plane, the best way to test your claim is to
          give you a plane and ask you to fly it. This is precisely what God decided to
          do in response to Satan&apos;s claim. God created seven vast universes, then
          informed the angels that He was appointing Satan as a god on the tiny mote
          called &ldquo;Earth&rdquo; (<QuranRef reference="2:30" />). The Quranic
          accounts related to appointing Satan as a temporary &ldquo;god&rdquo; (
          <QuranRef reference="36:60" />) confirm the previous scripture.
        </p>

        {/* Scripture quotes */}
        <div
          data-card
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm"
        >
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-xs uppercase tracking-widest">Isaiah 14:13–15</p>
            <p className="italic text-foreground/80 leading-relaxed">
              &ldquo;You, Lucifer, said in your heart: &lsquo;I will scale the heavens.
              Above the stars of God. I will set up my throne. I will take my seat on
              the Mount of Congregation, in the recesses of the North. I will ascend
              above the tops of the clouds; I will be like the Most High!&rsquo;&rdquo;
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-xs uppercase tracking-widest">Matthew 4:8–10 &amp; Luke 4:5–8</p>
            <p className="italic text-foreground/80 leading-relaxed">
              &ldquo;The devil then took Jesus up a very high mountain and displayed
              before him all the kingdoms of the world in their magnificence, promising:
              &lsquo;All these will I bestow on you if you prostrate yourself in homage
              before me.&rsquo; At this, Jesus said to him, &lsquo;Away with you,
              Satan! Scripture has it: You shall worship the Lord your God; Him ALONE
              shall you adore.&rsquo;&rdquo;
            </p>
          </div>
        </div>

        <p>
          God&apos;s plan called for creating death (<QuranRef reference="67:1-2" />),
          then bringing the humans and jinns into this world. Thus, they start over
          without any biases, and exercise full freedom to uphold God&apos;s absolute
          authority or Satan&apos;s polytheistic theory. To make this crucial decision,
          every human being receives a message from God advocating His absolute
          authority, as well as a message from Satan pushing his polytheistic principles.
        </p>
        <p>
          To give us a head start, the Most Merciful gathered all human beings before
          Him, prior to sending us to this world, and we bore witness that He alone is
          our Lord and Master (<QuranRef reference="7:172" />). Thus, upholding
          God&apos;s absolute authority is a natural instinct integral to every human
          being.
        </p>
        <p>
          After putting the rebels to death, the souls of humans and jinns were placed in
          a special depository. God then created the appropriate bodies to house those
          souls during the test period. The first jinn body was made from fire, and Satan
          was assigned to that body (<QuranRef reference="15:27" />). The first human
          body was created from earthly material, clay (<QuranRef reference="15:26" />),
          and God assigned the first human soul to that body. The angels were appointed
          to serve the humans on earth — guard them, drive the wind and rain for them,
          distribute provisions, etc. This fact is stated in the Quran allegorically:
          &ldquo;Your Lord said to the angels, &lsquo;Fall prostrate before Adam.&rsquo;&rdquo;
          Satan of course refused to have anything to do with serving the human race (
          <QuranRef reference="2:34" />, <QuranRef reference="7:11" />,{' '}
          <QuranRef reference="17:61" />, <QuranRef reference="18:50" />,{' '}
          <QuranRef reference="20:116" />).
        </p>
        <p>
          While Adam&apos;s body remained on earth, the real person — the soul — was
          admitted into Heaven in the outermost universe. God gave Adam certain
          commandments, represented by the forbidden tree, and Satan was appointed as
          Adam&apos;s companion to deliver his satanic message. The rest is history.
        </p>
        <p>
          Every time a human being is born, a human soul is assigned to the new baby
          from the depository of souls. God assigns the souls in accordance with His
          knowledge (<QuranRef reference="28:68" />). Every soul deserves to be assigned
          to a certain body and to live under certain circumstances. God alone knows
          which souls are good and which are evil. Our children are assigned to our homes
          in accordance with God&apos;s plan.
        </p>
        <p>
          An independent jinn soul is also assigned to each new human being to represent
          Satan&apos;s point of view. Jinns are descendants of Satan (
          <QuranRef reference="7:27" />, <QuranRef reference="18:50" />). The assigned
          jinn remains with the human being from birth to death, and serves as the main
          witness on the Day of Judgment (<QuranRef reference="50:23" />). A continuous
          debate takes place in our heads between the human soul and the jinn soul until
          both are convinced of one point of view.
        </p>
      </section>

      {/* The Original Sin */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-border/50" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          The Original Sin
        </h2>
        <hr className="flex-1 border-border/50" />
      </div>

      <section className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          Contrary to common belief, the &ldquo;Original Sin&rdquo; was not Adam&apos;s
          violation of God&apos;s law when he ate from the forbidden tree. The original
          sin was our failure to uphold God&apos;s absolute authority during the Great
          Feud. If the human person convinces his or her jinn companion to denounce that
          original sin and uphold God&apos;s absolute authority, both creatures are
          redeemed to God&apos;s eternal kingdom on the Day of Judgment. But if the jinn
          companion convinces the human being to uphold Satan&apos;s idolatrous views,
          then both creatures are exiled forever from God&apos;s kingdom.
        </p>
        <p>
          To promote his point of view, Satan and his representatives advocate the
          idolization of such powerless creatures as Muhammad, Jesus, Mary, and the
          saints. Since we are here due to our polytheistic tendencies, most of us are
          easy prey for Satan.
        </p>
        <p>
          Satan&apos;s incompetence as a &ldquo;god&rdquo; has already been proven by
          the prevalence of chaos, disease, accidents, misery, and war throughout his
          dominion (<QuranRef reference="36:66" />). On the other hand, the human beings
          who denounce Satan, uphold God&apos;s absolute authority, and refrain from
          idolizing powerless and dead creatures like Jesus and Muhammad, are restored to
          God&apos;s protection — they enjoy a perfect life here in this world and
          forever.
        </p>
        <p>
          Because our life in this world is a series of tests designed to expose our
          polytheistic ideas, idol worship is the only unforgivable offense (
          <QuranRef reference="4:48" />, <QuranRef reference="4:116" />). The world is
          divinely designed to manifest our decision to uphold either God&apos;s absolute
          authority or Satan&apos;s idolatrous views (<QuranRef reference="67:1-2" />).
          The day and the night change constantly to test our willingness to uphold
          God&apos;s laws by observing the Dawn Prayer and fasting during the hottest
          and longest days. Only those who are totally certain about God&apos;s absolute authority are
          redeemed (<QuranRef reference="26:89" />).
        </p>
      </section>

      {/* Video */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Video
        </h2>
        <YouTubeEmbed videoId="LKrk3v00r80" title="Appendix 7 — Why Were We Created?" />
      </section>
    </>
  )
}
