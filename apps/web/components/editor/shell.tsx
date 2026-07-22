/**
 * Editorial control-room chrome: AppShell composes the persistent EditorSidebar
 * (shared shadcn Sidebar primitive) with a TopBar and a main workspace inside a
 * SidebarInset. The sidebar's expanded/collapsed state is persisted to the
 * sidebar_state cookie, which is read here so the first server render matches.
 * Server component; the interactive pieces (sidebar, trigger) are client.
 */
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { EditorSidebar, type EditorViewer } from './sidebar'
import { IChevR } from './icons'

export type { EditorViewer }

export type SaveState = 'saved' | 'saving' | 'unsaved'

export interface TopBarProps {
  crumb?: string[]
  cur?: string
  save?: SaveState
  actions?: ReactNode
}

interface TopBarInternalProps extends TopBarProps {
  isAdmin: boolean
  initial: string
}

const SAVE_TEXT: Record<SaveState, string> = {
  saved: 'All changes saved',
  saving: 'Saving…',
  unsaved: 'Unsaved changes',
}

function TopBar({ crumb = [], cur, save, actions, isAdmin, initial }: TopBarInternalProps) {
  return (
    <header className="topbar">
      <SidebarTrigger className="-ml-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]" />
      <div className="tb-crumb">
        {crumb.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && (
              <span className="sep">
                <IChevR size={12} />
              </span>
            )}
            <span>{c}</span>
          </span>
        ))}
        {cur && (
          <>
            <span className="sep">
              <IChevR size={12} />
            </span>
            <span className="cur">{cur}</span>
          </>
        )}
      </div>
      <div className="tb-spacer" />
      <div className="tb-right">
        {actions}
        {save && (
          <span className={'save-pill ' + save}>
            <span className="d" />
            {SAVE_TEXT[save]}
          </span>
        )}
        <span className="badge admin">{isAdmin ? 'Admin' : 'Editor'}</span>
        <span className="tb-avatar">{initial}</span>
      </div>
    </header>
  )
}

export interface AppShellProps {
  viewer: EditorViewer
  modules: Record<string, boolean>
  signOutAction: () => void
  topBar?: TopBarProps
  children: ReactNode
}

export async function AppShell({ viewer, modules, signOutAction, topBar, children }: AppShellProps) {
  // Match the first server render to the persisted collapsed/expanded state.
  const defaultOpen = (await cookies()).get('sidebar_state')?.value !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-full min-h-0 overflow-hidden">
      <EditorSidebar viewer={viewer} modules={modules} signOutAction={signOutAction} />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <TopBar
          {...topBar}
          isAdmin={viewer.isAdmin}
          initial={viewer.name.charAt(0).toUpperCase()}
        />
        <div className="workspace">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
