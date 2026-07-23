'use client'

import BookmarksScreen from '@/components/me/bookmarks-screen'

// Category detail arrives via ?id= (BookmarksScreen reads it inside a Suspense
// boundary); with no id it redirects back to the dashboard bookmarks section.
export default function BookmarksPage() {
  return <BookmarksScreen />
}
