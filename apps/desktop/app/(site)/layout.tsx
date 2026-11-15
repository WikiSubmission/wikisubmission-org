import { QuranPlayer } from '@/components/quran-player/now-playing-bar'
import { DesktopNav } from '@/components/desktop-nav'

// Pages outside the reader: appendices, introduction, proclamation, the
// miracle, and the user's own study pages. Same top bar as the reader, and the
// audio player stays mounted so recitation keeps playing while browsing.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <DesktopNav />
      </div>
      <div className="pt-16 pb-24">{children}</div>
      <QuranPlayer />
    </>
  )
}
