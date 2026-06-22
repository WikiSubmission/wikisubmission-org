'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Megaphone, Play } from 'lucide-react'
import { F } from '../../_sections/shared/server'

const VideoModal = dynamic(
  () => import('../../_sections/shared/video-modal').then((m) => ({ default: m.VideoModal })),
  { ssr: false },
)

export function AzaanCard() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12 w-full">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="text-[var(--ed-accent)] transition-all duration-500" style={{ fontFamily: F.display }}>
            <Megaphone size={56} strokeWidth={1} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
              The Call to Prayer (Azaan)
            </h3>
            <p className="text-base leading-relaxed text-[var(--ed-fg-muted)] max-w-xl" style={{ fontFamily: F.serif }}>
              Azaan is not part of the Contact Prayer and is not required when praying alone. It is a public call used when a group is ready to pray.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 group inline-flex items-center gap-4 px-8 py-4 bg-[var(--ed-fg)] text-[var(--ed-bg)] hover:bg-[var(--ed-accent)] transition-all duration-500"
            >
              <div className="size-8 border border-[var(--ed-bg)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={14} className="fill-current ml-0.5" />
              </div>
              <span
                className="text-[12px] uppercase tracking-[0.25em] font-bold"
                style={{ fontFamily: F.glacial }}
              >
                Watch Video Guide
              </span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end justify-center gap-3 border-t md:border-t-0 border-[var(--ed-rule)] pt-5 md:pt-0 shrink-0">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--ed-accent)]" style={{ fontFamily: F.glacial }}>Correct Form</span>
          <div className="text-base text-[var(--ed-fg)] font-medium space-y-1.5" style={{ fontFamily: F.serif }}>
            <div>Allahu Akbar, Allahu Akbar.</div>
            <div>Allahu Akbar, Allahu Akbar.</div>
            <div>La Elaaha Ella Allah.</div>
          </div>
        </div>
      </div>
    </div>

    {isModalOpen && (
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Azaan"
        subtitle="The Call to Prayer"
        youtubeId="Pulv7-MY18E"
      />
    )}
    </>
  )
}
