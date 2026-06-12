import Link from 'next/link'
import { ChevronLeft, FileText, Download, ArrowUpRight } from 'lucide-react'
import { QuranRef } from '@/components/quran-ref'
import { ArticleAnimations } from '@/components/article-animations'
import { buildPageMetadata } from '@/constants/metadata'
import Image from 'next/image'

export const metadata = buildPageMetadata({
  title: 'Introduction | WikiSubmission',
  description:
    "An introduction to the Final Testament — God's final message to humanity, the purification and consolidation of all scriptures into one universal religion of Submission.",
  url: '/introduction',
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" data-parallax>
      <hr className="flex-1 border-border/50" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
        {label}
      </h2>
      <hr className="flex-1 border-border/50" />
    </div>
  )
}

/** Small animated Earth (oblate spheroid) rendered as an inline SVG.
 *  Land masses scroll horizontally to simulate rotation. */
function AnimatedEarth() {
  return (
    <svg
      width="36"
      height="30"
      viewBox="0 0 36 30"
      className="inline-block align-middle mx-1.5"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="earth-clip-intro">
          <ellipse cx="18" cy="15" rx="17" ry="14" />
        </clipPath>
      </defs>
      {/* Ocean */}
      <ellipse cx="18" cy="15" rx="17" ry="14" fill="#1565c0" />
      {/* Sliding continents (two copies for seamless loop) */}
      <g clipPath="url(#earth-clip-intro)">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0 0"
            to="-36 0"
            dur="10s"
            repeatCount="indefinite"
          />
          {/* Copy 1 */}
          <ellipse cx="12" cy="8" rx="8" ry="6" fill="#2e7d32" />
          <ellipse cx="27" cy="20" rx="7" ry="8" fill="#388e3c" />
          <ellipse cx="5" cy="22" rx="4" ry="5" fill="#2e7d32" />
          {/* Copy 2 — offset by full width (36px) for seamless repeat */}
          <ellipse cx="48" cy="8" rx="8" ry="6" fill="#2e7d32" />
          <ellipse cx="63" cy="20" rx="7" ry="8" fill="#388e3c" />
          <ellipse cx="41" cy="22" rx="4" ry="5" fill="#2e7d32" />
        </g>
      </g>
      {/* Atmospheric rim */}
      <ellipse
        cx="18"
        cy="15"
        rx="17"
        ry="14"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/** Timeline bar showing world population since Adam vs. from 1989 to 2280. */
function WorldPopulationBar() {
  return (
    <figure className="space-y-2 my-2">
      <div className="relative h-10 rounded-lg overflow-hidden flex border border-border/30">
        {/* Small dark section: population since Adam (~5%) */}
        <div className="bg-foreground shrink-0" style={{ width: '5%' }} />
        {/* Large lighter section: population from 1989 to 2280 */}
        <div className="flex-1 bg-foreground/10 flex justify-center flex-row items-center px-4">
          <span className="text-xs text-foreground/70 leading-tight">
            World population from now (1989) to the end of the world (2280).
          </span>
        </div>
      </div>
      <figcaption className="text-xs text-muted-foreground italic">
        The black section represents the world population since Adam
      </figcaption>
    </figure>
  )
}

/** Two stacked ratio bars showing:
 *  Top — angels (vast majority) vs. those who agreed with Satan (tiny right slice)
 *  Bottom — zoomed view of that slice: those who repented (vast majority) vs. those who didn't
 *  Dashed lines between the bars illustrate the zoom relationship. */
function AngelsRatioBars() {
  const smallPct = 8
  return (
    <figure className="my-2">
      {/* Top bar */}
      <div className="relative h-12 rounded-t-lg overflow-hidden flex border border-border/30">
        <div className="flex-1 bg-white/60 dark:bg-white/10 border-r flex-row justify-center border-border/30 flex items-center px-4">
          <span className="text-xs text-foreground/60 leading-tight">
            The white area represents the vast majority that did not agree with
            Satan.
          </span>
        </div>
        <div
          className="shrink-0 bg-foreground/30"
          style={{ width: `${smallPct}%` }}
        />
      </div>

      {/* Zoom connector — dashed lines from the small right section expanding to full bar width */}
      <div className="relative h-7 overflow-visible">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1={`${100 - smallPct}%`}
            y1="0%"
            x2="0%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.3"
          />
          <line
            x1="100%"
            y1="0%"
            x2="100%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Bottom bar — zoomed in view of the minority slice */}
      <div className="relative h-12 rounded-b-lg overflow-hidden flex border border-border/30">
        <div className="flex-1 bg-foreground/15 border-r flex-row justify-center border-border/30 flex items-center px-4">
          <span className="text-xs text-foreground/60 leading-tight">
            The grey area represents the vast majority that repented and
            submitted.
          </span>
        </div>
        <div
          className="shrink-0 bg-foreground/55"
          style={{ width: `${smallPct}%` }}
        />
      </div>
      <figcaption className="text-xs text-muted-foreground italic mt-2">
        The zoomed section shows those who agreed with Satan; within that group,
        most repented.
      </figcaption>
    </figure>
  )
}

export default function IntroductionPage() {
  return (
    <ArticleAnimations>
      <main className="min-h-screen py-16 px-4">
        <article className="max-w-2xl mx-auto space-y-10">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quran: The Final Testament
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Introduction
            </h1>
            <p className="text-sm italic text-muted-foreground">
              In the name of God, Most Gracious, Most Merciful
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://library.wikisubmission.org/file/quran-the-final-testament-introduction.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="size-3.5" />
                Read
              </a>
              <span className="text-border/60 text-xs">·</span>
              <a
                href="https://library.wikisubmission.org/file/quran-the-final-testament-introduction.pdf"
                download
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Download className="size-3.5" />
                Download
              </a>
            </div>
          </header>

          {/* ── Opening ────────────────────────────────────────────────────── */}
          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              This is God&apos;s final message to humanity. All of God&apos;s
              prophets have come to this world, and all the scriptures have been
              delivered. The time has come to purify and consolidate all the
              messages delivered by God&apos;s prophets into one message, and to
              proclaim that henceforth, there is only one religion acceptable to
              God, &ldquo;Submission&rdquo; (<QuranRef reference="3:19" />,{' '}
              <QuranRef reference="3:85" />
              ). &ldquo;Submission&rdquo; is the religion whereby we recognize
              God&apos;s absolute authority, and reach an unshakeable conviction
              that God ALONE possesses all power; no other entity possesses any
              power that is independent of Him. The natural result of such a
              realization is to devote our lives and our worship absolutely to
              God ALONE. This is the First Commandment in all the scriptures,
              including the Old Testament, the New Testament, and this Final
              Testament.
            </p>
            <ScriptureQuote source="Deuteronomy 6:4–5, Mark 12:29–30, Quran 3:18">
              Hear, O Israel! The Lord our God is One God!
              <br />
              Therefore you shall adore the Lord your God
              <br />
              with all your heart, with all your soul,
              <br />
              with all your mind, and with all your strength.
            </ScriptureQuote>

            <ScriptureQuote source="Gayatri Mantra, Yajur Veda">
              Let us meditate on God, His glorious attributes, who is the basis
              of everything in this universe as its Creator, who is fit to be
              worshiped as Omnipresent, Omnipotent, Omniscient and self existent
              conscious being, who removes all ignorance and impurities from the
              mind and purifies and sharpens our intellect.
            </ScriptureQuote>
            <p>
              While every religion has been corrupted by innovations,
              traditions, and false, idolatrous doctrines, there may be
              &ldquo;Submitters&rdquo; within every religion. There may be
              Submitters who are Christian, Jewish, Muslim, Hindu, Buddhist, or
              anything else. These Submitters, collectively, constitute the only
              religion acceptable to God. As emphasized by the theme on the
              front page of this book, all Submitters who are devoted to God
              ALONE, and do not set up any idols beside God, are redeemed into
              God&apos;s eternal kingdom (
              <QuranRef reference="2:62" />
              ). A criterion of the true submitters is that they will find
              nothing objectionable in the Quran.
            </p>
            <p>
              With the advent of this Testament, God&apos;s message to the world
              is now complete. We have now received the long awaited answers to
              our most urgent questions—who we are, the purpose of our lives,
              how we came into this world, where do we go from here, which
              religion is the right one, was it evolution or creation, etc.
            </p>
          </section>

          {/* ── Population / timing ────────────────────────────────────────── */}
          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              Some may wonder: &ldquo;Why did God wait all this time to perfect
              and consolidate His message? What about all the people since Adam
              who did not receive the complete scripture?&rdquo; Bearing in mind
              that the Quran answers this question in{' '}
              <QuranRef reference="20:52" />, it is a matter of simple
              statistics that the world&apos;s population from the beginning
              until now did not exceed 7,000,000,000. From now to the end of the
              world, 2280 A.D. (
              <Link
                href="/appendices/25"
                className="text-primary hover:underline text-sm"
              >
                Appendix 25
              </Link>
              ), it is estimated that the total world population will exceed
              75,000,000,000. Thus, the vast majority of people are destined to
              receive God&apos;s purified and consolidated message (see
              diagram).
            </p>
          </section>
          <WorldPopulationBar />

          <hr className="border-border/40" />

          {/* ── Before Genesis ─────────────────────────────────────────────── */}
          <SectionDivider label="Before Genesis" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              It all began billions of years ago when one of God&apos;s
              high-ranking creatures, Satan, developed a supercilious idea that
              he could run a dominion as an independent god besides God. This
              challenge to God&apos;s absolute authority was not only
              blasphemous, it was also erroneous. Satan was ignorant of the fact
              that God alone possesses the ability to be a god, and that there
              is much more to godhood than he realized. It was the ego—arrogance
              augmented by ignorance—that led Satan to believe that he could
              take care of a dominion, as a god, and run it without disease,
              misery, war, accidents, and chaos. The vast majority of God&apos;s
              creatures disagreed with Satan. Yet, the minute egotistic minority
              that agreed with him to various extents were in the billions.
              Thus, a profound dispute erupted within the Heavenly Community (
              <QuranRef reference="38:69" />
              ). The rebels&apos; unjustifiable challenge to God&apos;s absolute
              authority was met and resolved in the most efficient manner. After
              giving the rebels sufficient chances to denounce their crime and
              submit to Him, God decided to exile the hard core rebels on a
              space ship called Earth, and give them yet another chance to
              redeem themselves.
            </p>
            <p>
              If you claim that you can fly a plane, the best way to test your
              claim is to give you a plane and ask you to fly it. This is
              precisely what God decided to do in response to Satan&apos;s claim
              that he could be a god; God appointed him a temporary god on the
              tiny speck Earth (<QuranRef reference="2:30" />,{' '}
              <QuranRef reference="36:60" />
              ). As for those who agreed with Satan, they were given a chance to
              kill their egos and submit to God&apos;s absolute authority. While
              the vast majority of the guilty creatures took advantage of this
              opportunity, a minuscule minority consisting of about 150 billion
              creatures failed to take advantage of this offer (
              <QuranRef reference="33:72" />
              ).
            </p>
          </section>
          <AngelsRatioBars />
          {/* ── The Four Categories ────────────────────────────────────────── */}
          <SectionDivider label="" />

          <section className="space-y-8 text-base leading-relaxed text-foreground/90">
            <div className="space-y-3">
              <p>
                The dispute in the Heavenly Community led to the classification
                of God&apos;s creatures into different categories:
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">(1) The Angels</h3>
              <p>
                Creatures who never questioned God&apos;s absolute authority
                were classified as angels; they knew that God alone possesses
                the ability and qualifications to be a god. The vast majority of
                God&apos;s creatures—countless numbers—belong in this category.
                The number of the angels is so enormous, even the angels do not
                know how many of them there are; only God knows their number (
                <QuranRef reference="74:31" />
                ).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">(2) The Animals</h3>
              <p>
                Although the angels suggested that the rebels and their leader
                should be exiled from God&apos;s kingdom (
                <QuranRef reference="2:30" />
                ), the Most Merciful willed to give the rebels a chance to
                denounce their crime, repent, and submit to His absolute
                authority (
                <QuranRef reference="33:72" />
                ). As represented in the diagram above, the vast majority of the
                rebels took advantage of God&apos;s gracious offer to re-enter
                His kingdom. They agreed to kill their egos, come to this world
                to perform a submissive role, as an expiation for their
                blasphemy. In return for their submissive role in this world,
                these creatures are redeemed back to God&apos;s eternal kingdom
                (
                <QuranRef reference="6:38" />
                ). The horse, the dog, the tree, the sun, the moon, the stars,
                as well as deformed and retarded children are among the
                intelligent creatures who denounced their crime and repented:
              </p>
            </div>

            <div
              data-card
              className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm italic text-foreground/80 text-center"
            >
              <p>
                Do you not realize that to God prostrates everything in the
                heavens and the earth; the sun, the moon, the stars, the
                mountains, the trees, the animals, as well as many people? Many
                people, however, are destined for retribution.{' '}
                <QuranRef reference="22:18" />
              </p>
              <hr className="border-primary/10" />
              <p>
                The stars and the trees prostrate. <QuranRef reference="55:6" />
              </p>
            </div>

            <p>
              The horse has no ego. The horse&apos;s owner can be rich or poor,
              tall or short, fat or thin, young or old, and the horse will serve
              them all. The dog has no ego; it will wag its tail to its owner,
              no matter how rich or poor the owner might be. The sun rises and
              sets every day at precisely the times prescribed by God. The moon
              follows its synchronized orbit around the earth, without the
              slightest deviation. The human body—a temporary garment—belongs to
              the Earth; as such, it is a submitter. The heart, lungs, kidneys,
              and other organs perform their functions without our control.
            </p>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">(3) The Humans</h3>
              <p>
                The hard-core rebels—humans and jinns—refused to denounce their
                crime, and opted for witnessing a demonstration of Satan&apos;s
                claim. These egotistic creatures who failed to submit to
                God&apos;s absolute authority, even when offered a chance to do
                so, were divided in half. The half that were less convinced of
                Satan&apos;s point of view became classified as humans. Although
                they harbored doubts about Satan&apos;s claim, they failed to
                make a firm stand regarding God&apos;s absolute authority. It is
                the ego that prevented these creatures from appreciating
                God&apos;s omnipotence, it is the ego that prevented them from
                submitting when such an opportunity was offered to them (
                <QuranRef reference="33:72" />
                ), and it is the ego that stands between most of us and
                redemption to God&apos;s kingdom (
                <QuranRef reference="25:43" />
                ). This is why &ldquo;Kill your ego&rdquo; is one of the first
                commandments in the Quran (
                <QuranRef reference="2:54" />
                ).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">(4) The Jinns</h3>
              <p>
                The other half of the guilty creatures, those who leaned closer
                to Satan&apos;s point of view and exhibited the biggest egos,
                became classified as jinns. It was God&apos;s plan to assign one
                jinn to every human being from birth to death. The jinn
                companion represents Satan and constantly promotes his point of
                view (<QuranRef reference="50:23" />,{' '}
                <QuranRef reference="50:27" />
                ). Both the jinns and the humans are given a precious chance in
                this world to re-educate themselves, denounce their egoism, and
                redeem themselves by submitting to God&apos;s absolute
                authority. We learn from the Quran that the jinns are
                Satan&apos;s descendants (
                <QuranRef reference="7:27" />, <QuranRef reference="18:50" />
                ). When a jinn being is born and assigned to a human being, the
                jinn remains a constant companion of the human until the human
                dies. The jinn is then freed, and lives on for a few centuries.
                Both humans and jinns are required to worship God alone (
                <QuranRef reference="51:56" />
                ).
              </p>
            </div>
          </section>

          <SectionDivider label="God Does Not Want Robots" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              The dispute in the Heavenly Community as stated in{' '}
              <QuranRef reference="38:69" /> and described above proves that
              God&apos;s creatures possess the freedom of choice; they have
              minds of their own. The rebellion of a minuscule minority among
              God&apos;s creatures has served to emphasize the wonderful fact
              that God&apos;s creatures serve Him because they appreciate His
              infinite magnificence. Without the rebellion, we would have never
              known that freedom is God&apos;s gift to His creatures.
            </p>
          </section>

          <SectionDivider label="Most Gracious, Most Merciful" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              Even in our worldly dimension, any enterprise expects its
              employees to be loyal and devoted to the welfare of the
              enterprise. If an employee is not totally dedicated to the
              enterprise, or is shown to have divided loyalties, he is
              immediately dismissed. Since the humans and the jinns sided with
              Satan, then turned down God&apos;s offer to reconsider their
              rebellious acts, the angels expected Satan and his allies to be
              banished from God&apos;s kingdom (<QuranRef reference="2:30" />
              ). It was immense mercy from God that He granted us this
              additional chance to denounce our crime and redeem ourselves.
            </p>
            <p>
              To carry out this extremely merciful plan of redemption, God
              &ldquo;created death&rdquo; (<QuranRef reference="67:1-2" />
              ). The divine plan called for bringing the rebels into another
              existence, where they have no recollection of the heavenly feud.
              Under the circumstances of this life, the humans and the jinns
              receive both God&apos;s messages and Satan&apos;s messages, then
              freely choose either side. Based on their freewill decision, they
              are either redeemed to God&apos;s kingdom, or become permanently
              exiled with Satan.
            </p>
          </section>

          <SectionDivider label="Satan's Temporary Dominion" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              To emphasize the utter insignificance of Satan&apos;s projected
              dominion, God created a billion galaxies, a billion trillion
              stars, within a vast universe that spans billions of light years.
              If we travel towards the sun (93,000,000 miles) at the speed of
              light, we will reach it in eight minutes. If we keep going, we
              will reach the border of our Milky Way Galaxy after 50–70,000
              years at the speed of light. To reach the nearest galaxy, it will
              take us 2,000,000 years at the speed of light, and there are at
              least 2,000,000,000 galaxies in &ldquo;our universe.&rdquo; With
              the most powerful telescopes, the earth is utterly invisible from
              the edge of our own galaxy, let alone from the edge of our
              universe. As if our universe were not vast enough, God created six
              more, even larger universes surrounding our universe (
              <QuranRef reference="2:29" />, <QuranRef reference="67:3" />
              ). God then informed Satan that a tiny mote within the smallest
              and innermost universe, the planet Earth, shall be his dominion.
              God&apos;s plan called for placing the humans and jinns in a
              universe that cannot stand His physical presence (
              <QuranRef reference="7:143" />
              ). Thus, Satan rules his minute kingdom far from the physical
              presence of God, though with God&apos;s full knowledge and
              control. It should also be noted that the number of rebels who
              repented was so vast, that the planet earth could not possibly
              accommodate all of them. As it is, the animals vastly outnumber
              the humans on this planet. It would take an unmanageable earth to
              accommodate all the repentant rebels. Hence the placement of
              uncountable decillions of creatures in outer space.
            </p>
          </section>

          <SectionDivider label="Adam and Eve" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              The body of the first human being was shaped on earth by
              God&apos;s angels, in accordance with God&apos;s instructions (
              <QuranRef reference="7:11" />
              ). God then assigned the first person, Adam, to that body. When
              God informed the angels that they will be serving the humans
              throughout the test period—guarding them, driving the winds,
              distributing the rain and provisions, etc.—Satan was the only one
              who refused to &ldquo;fall prostrate&rdquo; (
              <QuranRef reference="2:34" />, <QuranRef reference="15:31" />,{' '}
              <QuranRef reference="38:74" />
              ). Adam&apos;s mate was cloned, with feminine features, from Adam,
              and God assigned the second human being to her body.
            </p>
            <p>
              While the empty (soulless) bodies of Adam and Eve remained here on
              earth, their souls, the real persons, resided in Heaven. Adam and
              Eve remained in Heaven for as long as they upheld God&apos;s
              commandments. Once they listened to Satan instead, they reflected
              a flawed human nature in all of us, and they immediately belonged
              to Satan&apos;s dominion down on Earth—&ldquo;their bodies became
              visible to them&rdquo; (<QuranRef reference="7:20" />,{' '}
              <QuranRef reference="20:121" />
              ). The rest is history.
            </p>
          </section>

          <SectionDivider label="Satan: Father of All the Jinns" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              Putting the jinns and the humans to the test stipulated that Satan
              shall reproduce whenever a human being is born. Every time a human
              being is born, a jinn being is born to serve as a constant
              companion of the human person. Every human being is subjected to
              the incessant persuasions of Satan&apos;s representative who lives
              in the same body from birth to death. Satan&apos;s representative
              tries to convince the human companion of Satan&apos;s point of
              view: that God alone is not enough. On the Day of Judgment, the
              jinn companion serves as a witness against the human counterpart (
              <QuranRef reference="43:38" />; <QuranRef reference="50:23" />,{' '}
              <QuranRef reference="50:27" />
              ). Many jinn companions are converted to God&apos;s point of view
              by the human companions.
            </p>
            <p>
              God did not leave the human being without preparation. To help the
              humans in their final chance to reconsider their blasphemy, every
              person is born with instinctive knowledge that God ALONE, and no
              one else, is our Lord and Master (
              <QuranRef reference="7:172-173" />
              ). The jinns were not given this instinctive knowledge, but they
              are given a much longer life span and greater abilities to study
              God&apos;s signs throughout the innermost universe. Since they
              represent Satan&apos;s point of view, their instinctive nature
              leans strongly in favor of polytheism. In addition to our built-in
              instinct to worship God alone, God sent messengers to help us
              redeem ourselves. With all these elements in view, we can
              appreciate the fact that the only unforgivable offense (if
              maintained until death) is idol worship: believing that anyone
              besides God possesses any power.
            </p>
          </section>

          <SectionDivider label="Forty Years Grace Period" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              The human being is given forty years to study, look around,
              reflect, and examine all points of view before making this most
              important decision—to uphold Satan&apos;s point of view, or
              God&apos;s absolute authority. Anyone who dies before the age of
              forty is chosen by God for redemption due to circumstances known
              only to God. Anyone who dies before the age of 40 goes to Heaven (
              <QuranRef reference="46:15" />,{' '}
              <Link
                href="/appendices/32"
                className="text-primary hover:underline text-sm"
              >
                Appendix 32
              </Link>
              ). God&apos;s immense mercy is evident from the fact that even
              those who believe in the Quran find it difficult to accept such a
              compassionate divine law.
            </p>
            <p>
              God&apos;s messengers delivered the good news of our God-given
              chance to redeem ourselves, and they were supported by formidable
              signs. When Moses went to Pharaoh, he was supported by such
              miracles as the turning of his staff into a serpent. Jesus created
              live birds from clay by God&apos;s leave, healed the leprous and
              the blind by God&apos;s leave, and revived the dead by God&apos;s
              leave. The prophet Muhammad, God&apos;s messenger who delivered
              this Final Testament, did not exhibit such miracles (
              <QuranRef reference="10:20" />
              ). The Quran itself was the miracle supporting Muhammad&apos;s
              mission (
              <QuranRef reference="29:50-51" />
              ). It was divine wisdom that separated the Miracle of the Quran
              from Muhammad by 14 centuries. Now that we understand the
              momentous dimensions of the Quran&apos;s mathematical miracle (
              <Link
                href="/appendices/1"
                className="text-primary hover:underline text-sm"
              >
                Appendix 1
              </Link>
              ), we realize that millions of people would have worshiped
              Muhammad as God incarnate if this Miracle were revealed through
              him.
            </p>
          </section>

          <SectionDivider label="Proof of Authenticity" />

          <div
            data-card
            className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Physical · Tangible · Irrefutable
            </p>
          </div>

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              With the advent of the computer age, we discover that the
              Quran&apos;s mathematical code is &ldquo;One of the great
              miracles&rdquo; as stated in <QuranRef reference="74:30-35" />.
              While the miracles given to previous messengers were limited in
              time and place, the Quran&apos;s miracle is perpetual. Only a few
              people witnessed the miracles of Moses and Jesus, but the
              Quran&apos;s miracle can be witnessed by anyone at any time.
              Furthermore, the Quran&apos;s miracle documents and proves all the
              previous miracles (<QuranRef reference="5:48" />
              ).
            </p>
            <p>
              As detailed in{' '}
              <Link
                href="/appendices/1"
                className="text-primary hover:underline text-sm"
              >
                Appendix 1
              </Link>
              , the Quran&apos;s mathematical miracle is based on the number
              &ldquo;19.&rdquo; The word &ldquo;GOD&rdquo; is printed throughout
              the English text in bold capital letters and the cumulative number
              of occurrences is shown at the lower left corner of every page.
              The total occurrence of this most important word is 2698—a
              multiple of 19. Additionally, when we add the numbers assigned to
              every verse where the word &ldquo;God&rdquo; occurs, the total
              comes to 118123, also a multiple of 19 (19×6217).
            </p>
          </section>

          <div
            data-card
            className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Proof of Authenticity to be Verified by the Reader
            </p>
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 text-primary font-mono text-xs">●</span>
              <span>
                Total count of the word &ldquo;God&rdquo; (lower left corner of
                every page):{' '}
                <span className="font-semibold">2698 (19 × 142)</span>
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 text-primary font-mono text-xs">●</span>
              <span>
                Total sum of verse numbers (lower right corner):{' '}
                <span className="font-semibold">118123 (19 × 6217)</span>
              </span>
            </div>
          </div>

          {/* ── Scientific facts ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <p className="text-base font-medium">
              In addition to the Quran&apos;s extraordinary mathematical
              composition, we find a large number of Quranic facts which are
              proven or theorized by modern science. Here are a few examples of
              such advance scientific information:
            </p>
            <ol className="space-y-2 text-sm text-foreground/90 leading-relaxed list-none">
              {(
                [
                  {
                    refs: ['10:24', '39:5', '79:30'],
                    text: 'The earth is egg-shaped',
                    extra: <AnimatedEarth />,
                  },
                  {
                    refs: ['27:88'],
                    text: 'The earth is not standing still; it moves constantly',
                  },
                  {
                    refs: ['10:5', '25:61', '71:16'],
                    text: 'The sun is a source of light, while the moon reflects it',
                  },
                  {
                    refs: ['6:125'],
                    text: 'The proportion of oxygen diminishes as we climb towards the sky',
                  },
                  {
                    refs: ['21:30'],
                    text: 'The "Big Bang Theory" is confirmed',
                  },
                  {
                    refs: ['51:47'],
                    text: 'The "Expansion of the Universe Theory" is confirmed',
                  },
                  {
                    refs: ['41:11'],
                    text: 'The universe started out as a gaseous mass',
                  },
                  {
                    refs: [
                      '21:30',
                      '24:45',
                      '32:7-9',
                      '18:37',
                      '15:28-29',
                      '7:11',
                      '71:13-14',
                    ],
                    text: 'Evolution is a fact; within a given species, it is a divinely guided process',
                    appendix: 31,
                  },
                  {
                    refs: ['53:45-46'],
                    text: "The man's seminal fluid decides the baby's gender",
                  },
                ] as {
                  refs: string[]
                  text: string
                  appendix?: number
                  extra?: React.ReactNode
                }[]
              ).map((item, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span>
                    {item.text}
                    {item.extra} (
                    {item.refs.map((ref, j) => (
                      <span key={ref}>
                        {j > 0 && ', '}
                        <QuranRef reference={ref} />
                      </span>
                    ))}
                    {item.appendix && (
                      <>
                        ,{' '}
                        <Link
                          href={`/appendices/${item.appendix}`}
                          className="text-primary hover:underline text-sm"
                        >
                          Appendix {item.appendix}
                        </Link>
                      </>
                    )}
                    ).
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── No Nonsense ─────────────────────────────────────────────────── */}
          <SectionDivider label="No Nonsense" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              Equally miraculous is the absence of any nonsense in the Quran.
              This is particularly significant in view of the dominance of
              ignorance and superstition at the time of revelation of the Quran.
              For example, the most respected exegesis among the traditional
              Muslims is that of Ibn Kathir. In this famous reference, written
              centuries after the Prophet, we read that the earth is carried on
              40,000 horns of a giant bull, who stands on top of a giant whale
              (see Ibn Kathir&apos;s interpretation of Verse 68:1).
            </p>
            <p>
              As recently as 1975, and in the same location where the Quran was
              revealed, the president of the Islamic University of Medina, Saudi
              Arabia, Sheikh Abdul Aziz Ben Baz, declared that the earth is flat
              and standing still (see insert)!!
            </p>
            <div className="border-l-4 border-primary/30 pl-5 py-1 space-y-3">
              {/* Original Arabic scan — landscape */}
              <div className="rounded-lg border border-border/30 overflow-hidden bg-muted/20">
                <Image
                  src="/ben_baz_quote.png"
                  alt="Original Arabic text of the Ben Baz quote"
                  width={800}
                  height={200}
                  className="w-full h-auto"
                />
              </div>
              {/* Translation and source */}
              <div className="space-y-2">
                <p className="italic text-foreground/90 leading-relaxed">
                  &ldquo;If the earth is rotating as they claim, the countries,
                  the mountains, the trees, the rivers, and the oceans will have
                  no bottom and the people will see the eastern countries move
                  to the west and the western countries move to the east.&rdquo;
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground">
                    Translation from Ben Baz&apos; book, Page 23
                  </p>
                  <a
                    href="/الأدلة النقلية والحسية على إمكان الصعود إلى الكواكب.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
                  >
                    <FileText className="size-3" />
                    Source, page 11, left side
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <SectionDivider label="Perfect Happiness: Now and Forever" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              One of the most elusive objectives of every human being is
              &ldquo;Happiness.&rdquo; The Quran reveals the secret of attaining
              perfect happiness in this life and forever. We learn from the
              Quran that happiness is an exclusive quality of the soul. Thus, a
              body that attains all the material successes it longs for—money,
              power, fame, etc.—often belongs to an unhappy person. Happiness
              depends totally on the degree of growth and development attained
              by the soul, the real person. The Quran provides a detailed map
              towards perfect happiness for both body and soul, both in this
              world and in the eternal Hereafter (
              <Link
                href="/appendices/15"
                className="text-primary hover:underline text-sm"
              >
                Appendix 15
              </Link>
              ).
            </p>
            <p>
              In the numerous verses throughout this proven Testament, God
              personally guarantees the believers&apos; happiness, now and
              forever:
            </p>
          </section>

          <div
            data-card
            className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3"
          >
            <p className="text-base leading-relaxed italic">
              Absolutely, God&apos;s allies will have nothing to fear, nor will
              they grieve. They are those who believe and lead a righteous life.
              For them happiness in this life, and in the Hereafter. Such is
              God&apos;s inviolable law. This is the true triumph.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              <QuranRef reference="10:62-64" />
            </p>
          </div>

          <SectionDivider label="All Believers Constitute the One Acceptable Religion" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              As expected from the Creator&apos;s final message, one of the
              prominent themes in the Quran is the call for unity among all
              believers, and the repeated prohibition of making any distinction
              among God&apos;s messengers. If the object of worship is one and
              the same, there will be absolute unity among all believers. It is
              the human factor—devotion and prejudice to such powerless humans
              as Jesus, Muhammad, and the saints—that causes division, hatred,
              and bitter wars among the misguided believers. A guided believer
              is devoted to God ALONE, and rejoices in seeing any other believer
              who is devoted to God ALONE, regardless of the name such a
              believer calls his or her religion.
            </p>
          </section>

          <div
            data-card
            className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2"
          >
            <p className="text-base leading-relaxed">
              Surely, those who believe, those who are Jewish, the Christians,
              and the converts; anyone who (1) believes in God, (2) believes in
              the Last Day, and (3) leads a righteous life, will receive their
              recompense from their Lord; they have nothing to fear, nor will
              they grieve.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              <QuranRef reference="2:62" /> · <QuranRef reference="5:69" />
            </p>
          </div>

          <SectionDivider label="God's Messenger of the Covenant" />

          <section className="space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              As detailed in{' '}
              <Link
                href="/appendices/2"
                className="text-primary hover:underline text-sm"
              >
                Appendix 2
              </Link>
              , the publication of this book marks the advent of a new era—the
              era where God&apos;s messages, delivered by all His prophets, are
              consolidated into one. God&apos;s one and only religion,
              &ldquo;Submission,&rdquo; shall dominate all other religions (
              <QuranRef reference="9:33" />, <QuranRef reference="48:28" />, and{' '}
              <QuranRef reference="61:9" />
              ). Today&apos;s corrupted religions, including Judaism,
              Christianity, Hinduism, Buddhism, and Islam, will simply die out,
              and &ldquo;Submission&rdquo; will prevail. This is not the wishful
              thinking of a human being or a collection of humans; this is
              God&apos;s inviolable law (
              <QuranRef reference="3:19" />, <QuranRef reference="9:33" />,{' '}
              <QuranRef reference="41:53" />, <QuranRef reference="48:28" />,{' '}
              <QuranRef reference="61:9" />, <QuranRef reference="110:1" />
              ).
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="text-sm text-muted-foreground leading-relaxed space-y-1 text-right">
            <p className="font-medium text-foreground/70">Rashad Khalifa</p>
            <p>
              Tucson · Ramadan 26, 1409
              <br />
              <br />
              <br />
            </p>

            <hr className="flex-1 border-border/50" />
            <p>
              * The final draft of the first printing was completed in the Night
              of Destiny 1409. If we add the day, month, and year of this date,
              we get 1444, or 19x19x4 [Ramadan 26, 1409: 9+26+1409 = 1444.]
            </p>
            <hr className="flex-1 border-border/50" />
          </section>

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4">
            <Link
              href="/quran"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="size-4" />
              Back to Quran
            </Link>
            <Link
              href="/quran#appendices"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Appendices →
            </Link>
          </div>
        </article>
      </main>
    </ArticleAnimations>
  )
}
