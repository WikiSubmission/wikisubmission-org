import BookmarksScreen from '@/components/me/bookmarks-screen'

// Auth is enforced by the /me layout. The category id travels in ?id=; with no
// id, BookmarksScreen redirects to the dashboard's bookmarks section.
export default function BookmarksPage() {
  return <BookmarksScreen />
}
