/**
 * Editorial control-room chrome: AppShell composes the persistent Sidebar with a
 * TopBar and a main workspace. Server component; the only interactive piece is
 * the client Sidebar (active-state + sign-out).
 */
import type { ReactNode } from 'react'
import { Sidebar, type EditorViewer } from './sidebar'
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

export function AppShell({ viewer, modules, signOutAction, topBar, children }: AppShellProps) {
  return (
    <div className="app">
      <Sidebar viewer={viewer} modules={modules} signOutAction={signOutAction} />
      <div className="main">
        <TopBar
          {...topBar}
          isAdmin={viewer.isAdmin}
          initial={viewer.name.charAt(0).toUpperCase()}
        />
        <div className="workspace">{children}</div>
      </div>
    </div>
  )
}
