import { redirect } from 'next/navigation'

/**
 * Editorial grants moved into the unified access console at /admin/access, which
 * grants role, games and editorial access in one place. This redirect keeps old
 * links and bookmarks working.
 */
export default function EditorAdminPage() {
  redirect('/admin/access')
}
