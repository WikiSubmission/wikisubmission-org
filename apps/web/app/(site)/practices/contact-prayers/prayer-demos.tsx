'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Play, Volume2, Users, Calendar, Video, AlertCircle } from 'lucide-react'
import { F } from '../../_sections/shared/server'
import Image from 'next/image'
import { PRAYER_DEMO_VIDEOS, type ContactPrayerVideo } from './video-library'

const VideoModal = dynamic(
  () => import('../../_sections/shared/video-modal').then((m) => ({ default: m.VideoModal })),
  { ssr: false },
)

export function PrayerDemos() {
  const [activeDemo, setActiveDemo] = useState<ContactPrayerVideo | null>(null)

  return (
    <>
    <div className="w-full">
      <div>
        <div className="space-y-8 md:space-y-12">
          {/* ── Header removed ── */}
              <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/20 p-5 md:p-6 text-left space-y-4">
                <div className="space-y-2">
                  <p>The five daily prayers consist of varying units:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[var(--ed-fg)]">
                    <li>Dawn (2 units)</li>
                    <li>Noon (4 units)</li>
                    <li>Afternoon (4 units)</li>
                    <li>Sunset (3 units)</li>
                    <li>Night (4 units)</li>
                  </ul>
                </div>
                <p>
                  All the 4-unit prayers are done the same way. The only difference is that the intention is for the specific prayer (e.g., &quot;I intend to pray the Noon Prayer&quot; or &quot;I intend to pray the Afternoon Prayer&quot; or &quot;I intend to pray the Night Prayer&quot;). Everything else is identical for those three prayers. The unique ones are Dawn (2 units) and Sunset (3 units).
                </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRAYER_DEMO_VIDEOS.map((demo) => (
              <button
                type="button"
                key={demo.title}
                className="group relative flex w-full flex-col overflow-hidden border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 text-left transition-all duration-500 hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ed-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ed-bg)]"
                onClick={() => setActiveDemo(demo)}
              >
                <div className="w-full aspect-video bg-black/5 relative overflow-hidden flex items-center justify-center border-b border-[var(--ed-rule)]">
                  {demo.thumbnail && (
                    <Image src={demo.thumbnail} alt={demo.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0 mix-blend-luminosity group-hover:mix-blend-normal" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <div className="size-12 bg-[var(--ed-bg)]/80 flex items-center justify-center z-20 group-hover:scale-110 group-hover:bg-[var(--ed-accent)] group-hover:text-[var(--ed-bg)] transition-all border border-[var(--ed-rule)]">
                    <Play size={18} className="fill-current ml-1" />
                  </div>
                </div>
                
                <div className="p-5 md:p-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg md:text-xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                      {demo.title}
                    </h3>
                    <span 
                      className="text-[10px] uppercase tracking-widest text-[var(--ed-accent)] font-bold shrink-0"
                      style={{ fontFamily: F.glacial }}
                    >
                      {demo.units}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
                    {demo.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 md:mt-16 flex flex-col gap-6 md:gap-8">
            <div className="border-y sm:border border-[var(--ed-rule)] bg-[var(--ed-surface)]/20 p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start relative overflow-hidden">
              <div className="absolute top-0 left-0 sm:w-1 sm:h-full h-1 w-full bg-[var(--ed-accent)]" />

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 flex items-center justify-center shrink-0 border border-[var(--ed-rule)] bg-[var(--ed-surface)]/40">
                    <AlertCircle size={20} className="text-[var(--ed-accent)]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                    Missed Prayers Are Gone
                  </h3>
                </div>
                <p className="text-[var(--ed-fg-muted)] leading-relaxed text-[15px]" style={{ fontFamily: F.serif }}>
                  When you miss a prayer at its appointed time, <span className="text-[var(--ed-fg)] font-medium">it is gone and cannot be &ldquo;made up.&rdquo;</span> You must seek forgiveness from God for neglecting your contact with Him, and be steadfast in ensuring you observe the next prayers on time.
                </p>
              </div>

              <div className="flex-[1.5] border-l-2 border-[var(--ed-rule)] pl-6 md:pl-8 space-y-4 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-accent)] font-bold" style={{ fontFamily: F.glacial }}>
                    Sura 4:103
                  </span>
                  <div className="h-px w-6 bg-[var(--ed-rule)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]" style={{ fontFamily: F.glacial }}>
                    Scriptural Instruction
                  </span>
                </div>
                <p className="text-[15px] italic text-[var(--ed-fg-muted)] leading-relaxed" style={{ fontFamily: F.serif }}>
                  &quot;Once you complete your Contact Prayer (Salat), you shall remember GOD while standing, sitting, or lying down. Once the war is over, you shall observe the Contact Prayers (Salat); <span className="text-[var(--ed-accent)] font-medium not-italic px-1 py-0.5 bg-[var(--ed-accent)]/10 underline underline-offset-4 decoration-[var(--ed-accent)]/40">the Contact Prayers (Salat) are decreed for the believers at specific times.</span>&quot;
                </p>
              </div>
            </div>

            <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 border border-[var(--ed-rule)] bg-[var(--ed-bg)] flex items-center justify-center">
                    <Volume2 size={20} className="text-[var(--ed-accent)]" />
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                    Tone of Voice
                  </h3>
                </div>
                <p className="text-[var(--ed-fg-muted)] leading-relaxed text-[15px]" style={{ fontFamily: F.serif }}>
                  Do not be too loud or completely silent. Maintain an intermediate tone.
                </p>
              </div>
              
              <div className="flex-[1.5] border-l-2 border-[var(--ed-accent)]/30 pl-6 md:pl-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg)] font-bold" style={{ fontFamily: F.glacial }}>
                    Sura 17:110
                  </span>
                  <div className="h-px w-6 bg-[var(--ed-rule)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]" style={{ fontFamily: F.glacial }}>
                    Scriptural Instruction
                  </span>
                </div>
                <p className="text-[15px] italic text-[var(--ed-fg-muted)] leading-relaxed" style={{ fontFamily: F.serif }}>
                  &quot;Say, &apos;Call Him GOD, or call Him Most Gracious; whichever name you use, to Him belongs the best names.&apos; <span className="text-[var(--ed-accent)] font-medium not-italic px-1 py-0.5 bg-[var(--ed-accent)]/10 underline underline-offset-4 decoration-[var(--ed-accent)]/40">You shall not utter your Contact Prayers (Salat) too loudly, nor secretly; use a moderate tone.</span>&quot;
                </p>
              </div>
            </div>

            <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 border border-[var(--ed-rule)] bg-[var(--ed-bg)] flex items-center justify-center shrink-0">
                    <Users size={20} className="text-[var(--ed-accent)]" />
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                    The Group Prayer
                  </h3>
                </div>
                <div className="text-[var(--ed-fg-muted)] leading-relaxed text-[15px] space-y-4" style={{ fontFamily: F.serif }}>
                  <p>
                    Two or more people may observe the Contact Prayers together. One person leads the group prayer, uttering &ldquo;The Key&rdquo; (Al-Fatiha) in a loud enough voice to be heard by everyone in the group. Other utterances must be silent.
                  </p>
                  <p>
                    Anyone may join the group late, in the middle of the prayer. He or she must make the same moves as the group, then, at the end of the prayer, he or she must stand up and make up whatever portion was missed.
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={() => setActiveDemo({
                      id: 'group-prayer',
                      title: 'The Group Prayer',
                      units: 'Example',
                      subtitle: 'Dr. Rashad Khalifa',
                      description: 'An explanation of group prayer and how followers observe behind the imam.',
                      youtubeId: 'tbxOH3KNOvA',
                      youtubeStart: 4339,
                      youtubeEnd: 4443
                    })}
                    className="group inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-300 w-full md:w-auto"
                  >
                    <div className="size-5 border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video size={10} fill="currentColor" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: F.glacial }}>
                      Watch Video
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 p-6 md:p-10 flex flex-col gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 border border-[var(--ed-rule)] bg-[var(--ed-bg)] flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-[var(--ed-accent)]" />
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
                    The Friday Prayer
                  </h3>
                </div>
                <div className="text-[var(--ed-fg-muted)] leading-relaxed text-[15px] space-y-4" style={{ fontFamily: F.serif }}>
                  <p>
                    The Friday Congregational Prayer (Salat Al-Jum&apos;ah) is so important, a whole sura is entitled &ldquo;Friday&rdquo; (Jum&apos;ah) and a commandment is decreed in verse nine to observe this prayer. Every Submitter (man, woman, and child) is commanded by God to observe the Friday Congregational Prayer.
                  </p>
                  <p>
                    The Friday Prayer replaces the Noon Prayer every Friday. Instead of 4 units, the Friday Prayer consists of listening to two sermons delivered by the Imam, and two units of prayer. Each sermon must begin with &ldquo;Al-Hamdu Lillah&rdquo; (Praise be to God), &ldquo;Laa ElaahaElla Allah&rdquo; (No other god beside God). Each sermon should last 10-15 minutes and must be delivered in the language of the congregation.
                  </p>
                  <p>
                    At the end of the first sermon, the congregation is asked to repent, &ldquo;Tooboo Ela Allah.&rdquo; The Imam then sits down for about a minute and makes his repentance together with the congregation, then stands up for the second sermon. The second sermon ends by asking one of the people to say the Azaan. The Imam then leads the 2-unit prayer.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-[var(--ed-accent)]/30 pl-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg)] font-bold" style={{ fontFamily: F.glacial }}>
                    Sura 62:9
                  </span>
                  <div className="h-px w-6 bg-[var(--ed-rule)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ed-fg-muted)]" style={{ fontFamily: F.glacial }}>
                    Scriptural Instruction
                  </span>
                </div>
                <p className="text-[15px] italic text-[var(--ed-fg-muted)] leading-relaxed" style={{ fontFamily: F.serif }}>
                  &quot;O you who believe, when the Congregational Prayer (Salat Al-Jumu&apos;ah) is announced on Friday, <span className="text-[var(--ed-accent)] font-medium not-italic px-1 py-0.5 bg-[var(--ed-accent)]/10 underline underline-offset-4 decoration-[var(--ed-accent)]/40">you shall hasten to the commemoration of GOD</span>, and drop all business. This is better for you, if you only knew.&quot;
                </p>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => setActiveDemo({
                    id: 'friday-prayer-principles',
                    title: 'Friday Prayer',
                    units: 'Principles of Friday Prayer',
                    subtitle: 'Dr. Rashad Khalifa',
                    description: 'A video explanation of the Friday congregational prayer.',
                    youtubeId: 'K7suTQM7fno',
                    youtubeStart: 1
                  })}
                  className="group inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-300 w-full md:w-auto self-start"
                >
                  <div className="size-5 border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video size={10} fill="currentColor" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: F.glacial }}>
                    Watch Video
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {activeDemo && (
      <VideoModal
        isOpen={activeDemo !== null}
        onClose={() => setActiveDemo(null)}
        title={activeDemo.title}
        subtitle={activeDemo.units}
        videoSrc={activeDemo.videoSrc}
        youtubeId={activeDemo.youtubeId}
        youtubeStart={activeDemo.youtubeStart}
        youtubeEnd={activeDemo.youtubeEnd}
      />
    )}
    </>
  )
}
