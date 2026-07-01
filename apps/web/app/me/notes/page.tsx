import NotesScreen from '@/components/me/notes-screen'

// Auth is enforced by the /me layout (server-side redirect). This page is a thin
// wrapper around the shared NotesScreen client component.
export default function NotesPage() {
  return <NotesScreen />
}
