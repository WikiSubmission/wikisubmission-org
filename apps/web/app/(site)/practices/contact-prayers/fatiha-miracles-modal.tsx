'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { F } from '../../_sections/shared/server'

const SLIDES = [
  {
    title: 'The 19 Lips Touching',
    content: (
      <div className="space-y-4">
        <p>When you recite &ldquo;The Key&rdquo; in Arabic, your lips touch each other precisely 19 times. Furthermore, your lips touch each other where the letters &ldquo;B&rdquo; and &ldquo;M&rdquo; occur. There are 4 &ldquo;B&apos;s&rdquo; and 15 &ldquo;M&apos;s&rdquo; and this adds up to 19.</p>
        <p>The gematrical value of the 4 &ldquo;B&apos;s&rdquo; is 4x2=8, and the gematrical value of the 15 &ldquo;M&apos;s&rdquo; is 15x40=600. The total gematrical value of the 4 &ldquo;B&apos;s&rdquo; and 15 &ldquo;M&apos;s&rdquo; is 608, that is 19x32.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border border-[var(--ed-rule)]">
            <thead>
              <tr className="bg-[var(--ed-surface)]/50">
                <th className="border border-[var(--ed-rule)] p-2">Word</th>
                <th className="border border-[var(--ed-rule)] p-2">Letter</th>
                <th className="border border-[var(--ed-rule)] p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1. Bism', 'B', '2'], ['2. Bism', 'M', '40'], ['3. Rahman', 'M', '40'], ['4. Rahim', 'M', '40'],
                ['5. Al-Hamdu', 'M', '40'], ['6. Rub', 'B', '2'], ['7. `Alamin', 'M', '40'], ['8. Rahman', 'M', '40'],
                ['9. Rahim', 'M', '40'], ['10. Malik', 'M', '40'], ['11. Yawm', 'M', '40'], ['12. Na\'budu', 'B', '2'],
                ['13. Mustaqim', 'M', '40'], ['14. Mustaqim', 'M', '40'], ['15. An`amta', 'M', '40'], ['16. `Alayhim', 'M', '40'],
                ['17. Maghdub', 'M', '40'], ['18. Maghdub', 'B', '2'], ['19. `Alayhim', 'M', '40']
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[var(--ed-surface)]/20 transition-colors">
                  <td className="border border-[var(--ed-rule)] p-2">{row[0]}</td>
                  <td className="border border-[var(--ed-rule)] p-2 font-bold">{row[1]}</td>
                  <td className="border border-[var(--ed-rule)] p-2">{row[2]}</td>
                </tr>
              ))}
              <tr className="bg-[var(--ed-surface)]/50 font-bold">
                <td className="border border-[var(--ed-rule)] p-2" colSpan={2}>Total</td>
                <td className="border border-[var(--ed-rule)] p-2 text-[var(--ed-accent)]">608 (19x32)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    title: '[1] Unit Correlation',
    content: (
      <div className="space-y-4">
        <p>Sura 1 is God&apos;s gift to us, to establish contact with Him (Salat).</p>
        <p>Write the sura number and the number of verses next to each other and you get 17, the total number of units in the 5 daily prayers.</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-3xl md:text-5xl tracking-[0.5em] font-mono text-[var(--ed-accent)]">
          17
        </div>
      </div>
    )
  },
  {
    title: '[2] Verse Sequencing',
    content: (
      <div className="space-y-4">
        <p>Let us write down the sura number, followed by the number of every verse in the sura. This is what we get:</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-2xl md:text-4xl tracking-widest font-mono text-[var(--ed-accent)] break-all">
          1 1 2 3 4 5 6 7
        </div>
        <p>This number is a multiple of 19.</p>
      </div>
    )
  },
  {
    title: '[3] Letter Counting',
    content: (
      <div className="space-y-4">
        <p>Now, let us replace each verse number by the number of letters in that verse. This is what we get:</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-2xl md:text-4xl tracking-widest font-mono text-[var(--ed-accent)] break-all">
          1 19 17 12 11 19 18 43
        </div>
        <p>Also a multiple of 19. Theoretically, one can alter the letters of Sura 1, and still keep the same number of letters, however, the following mathematical phenomena rule out that possibility. For the gematrical value of every single letter is taken into consideration.</p>
      </div>
    )
  },
  {
    title: '[4] Gematrical Inclusion',
    content: (
      <div className="space-y-4">
        <p>Let us include the gematrical value of every verse, and write it down following the number of letters in each verse:</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-xl md:text-3xl tracking-wider font-mono text-[var(--ed-accent)] break-all">
          1 19 786 17 581 12 618 11 241 19 836 18 1072 43 6009
        </div>
        <p>Also a multiple of 19.</p>
      </div>
    )
  },
  {
    title: '[5] The Combined Sequence',
    content: (
      <div className="space-y-4">
        <p>Now, let us add the number of each verse, to be followed by the number of letters in that verse, then the gematrical value of that verse. This is what we get:</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-lg md:text-2xl tracking-wider font-mono text-[var(--ed-accent)] break-all">
          1 1 19 786 2 17 581 3 12 618 4 11 241 5 19 836 6 18 1072 7 43 6009
        </div>
        <p>A multiple of 19.</p>
      </div>
    )
  },
  {
    title: '[6] The Letter Sequence',
    content: (
      <div className="space-y-4">
        <p>Instead of the gematrical values of every verse, let us write down the gematrical values of every individual letter in Sura 1. This truly awesome miracle shows that the resulting long number, consisting of 274 digits, is also a multiple of 19. ALLAHU AKBAR.</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-sm md:text-base font-mono text-[var(--ed-accent)] break-all">
          1 7 1 19 2 60 40 1 30 30 5 1 30 200 8 40 50 1 30 200 8 10 40 2 17 ... 50
        </div>
        <p className="text-sm text-[var(--ed-fg-muted)]">This number starts with the sura number, followed by the number of verses in the sura, followed by the verse number, followed by the number of letters in this verse, followed by the gematrical values of every letter in this verse, followed by the number of the next verse, followed by the number of letters in this verse, followed by the gematrical values of every letter in this verse, and so on to the end of the sura. Thus, the last component is 50, the value of &ldquo;N&rdquo; (last letter).</p>
      </div>
    )
  },
  {
    title: '[7] The Master Sequence',
    content: (
      <div className="space-y-4">
        <p>If we write down the number of the sura, followed by its number of verses, we get 17, the number of units (Rak&apos;aas) in the 5 daily prayers. Next to the 17, write down the number of the first prayer (1), followed by its number of Rak&apos;aas, which is 2, then two [*]&apos;s (the 274 digit letter sequence), followed by the number of the second prayer (2), followed by the number of Rak&apos;aas in the second prayer (4), followed by four [*]&apos;s, and so on.</p>
        <div className="p-6 bg-[var(--ed-surface)]/30 border border-[var(--ed-rule)] text-center text-lg md:text-xl tracking-widest font-mono text-[var(--ed-accent)] break-all">
          17 12[*][*] 24[*][*][*][*] 34[*][*][*][*] 43[*][*][*] 54[*][*][*][*]
        </div>
        <p>Not only is the resulting long number a multiple of 19, but also the number of its component digits is 4636 (19x244).</p>
      </div>
    )
  },
  {
    title: 'Submitter Perspectives',
    content: (
      <div className="space-y-4 text-sm md:text-base leading-relaxed">
        <p>Sura 1 is God&apos;s gift to us to establish contact with Him through the daily Contact Prayers. This fact is supported by an earth-shattering, simple-to-understand-but-impossible-to-imitate mathematical composition that challenges the greatest mathematicians on earth, and stumps them; it is far beyond human capabilities:</p>
        <ul className="list-decimal pl-5 space-y-2 text-[var(--ed-fg-muted)]">
          <li>The sura number, followed by the numbers of verses, next to each other, give 1 1 2 3 4 5 6 7. (19x)</li>
          <li>If we substitute the number of letters per verse in place of verse numbers, we get 1 19 17 12 11 19 18 43. (19x)</li>
          <li>If we insert the total gematrical value of every verse, we get 1 19 786 17 581 12 618 11 241 19 836 18 1072 43 6009. (19x)</li>
          <li>The number shown above includes all parameters of Sura 1, and consists of 38 digits (19x2).</li>
          <li>It is noteworthy that this 38-digit number is still divisible by 19 when we write its components backwards, from right to left as practiced by the Arabs. Thus, 6009 43 1072 18 836 19 241 11 618 12 581 17 786 19 1 is also a multiple of 19.</li>
          <li>The mathematical representations mentioned above participate in numerous extraordinary mathematical phenomena to confirm all details of the five daily Contact Prayers.</li>
        </ul>
        <p className="mt-4 italic text-[var(--ed-accent)]">Thus, the reader is handed at the outset tangible proof that this is God&apos;s message to the world.</p>
      </div>
    )
  }
]

export function FatihaMiraclesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Reset after the open commit to avoid cascading render work in the effect body.
  useEffect(() => {
    if (!isOpen) return
    const resetId = window.setTimeout(() => setCurrentIndex(0), 0)
    return () => window.clearTimeout(resetId)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => Math.min(SLIDES.length - 1, prev + 1))
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => Math.max(0, prev - 1))
      if (e.key === 'Tab') {
        const root = modalRef.current
        if (!root) return
        const nodes = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement)
        if (!nodes.length) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        const active = document.activeElement
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    const focusId = window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      window.clearTimeout(focusId)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const slide = SLIDES[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fatiha-miracles-title"
        className="relative w-full max-w-4xl bg-[var(--ed-bg)] border border-[var(--ed-rule)] shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--ed-rule)] bg-[var(--ed-surface)]/20">
          <div>
            <h2 id="fatiha-miracles-title" className="text-xl md:text-2xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
              The Miracles of &ldquo;The Key&rdquo;
            </h2>
            <p className="text-xs md:text-sm text-[var(--ed-accent)] mt-1 tracking-widest uppercase font-bold" style={{ fontFamily: F.glacial }}>
              Slide {currentIndex + 1} of {SLIDES.length}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close miracles modal"
            className="grid size-11 place-items-center text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] hover:bg-[var(--ed-surface)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-2xl md:text-3xl font-medium text-[var(--ed-fg)]" style={{ fontFamily: F.serif }}>
              {slide.title}
            </h3>
            <div className="text-[15px] md:text-base leading-relaxed text-[var(--ed-fg-muted)]" style={{ fontFamily: F.serif }}>
              {slide.content}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 md:p-6 border-t border-[var(--ed-rule)] bg-[var(--ed-surface)]/20">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex min-h-11 items-center gap-2 px-4 py-2 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs uppercase tracking-widest font-bold text-[var(--ed-fg)]"
            style={{ fontFamily: F.glacial }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                type="button"
                key={i} 
                aria-label={`Go to miracle slide ${i + 1}`}
                aria-current={i === currentIndex ? 'true' : undefined}
                className={`h-11 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[var(--ed-accent)]' : 'w-4 bg-[var(--ed-rule)] hover:bg-[var(--ed-fg-muted)] cursor-pointer'}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentIndex === SLIDES.length - 1}
            className="flex min-h-11 items-center gap-2 px-4 py-2 border border-[var(--ed-rule)] hover:bg-[var(--ed-surface)] disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs uppercase tracking-widest font-bold text-[var(--ed-fg)]"
            style={{ fontFamily: F.glacial }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  )
}
