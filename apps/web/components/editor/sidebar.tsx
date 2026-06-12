'use client'

/**
 * Editor sidebar. Lives in the editor layout as persistent chrome, so it stays
 * mounted across navigations. Active state is derived from the pathname rather
 * than passed down, which keeps the layout a server component. The navigation is
 * built from the modules the caller can read; nothing the backend has not
 * granted is shown.
 */
import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IArticles,
  IQuran,
  IBibleBook,
  IUsers,
  IIdCard,
  ITag,
  ILibrary,
  IShield,
  ILogout,
  type IconProps,
} from './icons'

interface ModuleMeta {
  label: string
  icon: ComponentType<IconProps>
  group: string
}

// Module keys mirror the backend editor_module enum.
const MODULE_META: Record<string, ModuleMeta> = {
  article: { label: 'Articles', icon: IArticles, group: 'Content' },
  quran: { label: 'Quran', icon: IQuran, group: 'Content' },
  bible: { label: 'Bible', icon: IBibleBook, group: 'Content' },
  community: { label: 'Communities', icon: IUsers, group: 'Content' },
  appendix: { label: 'Appendices', icon: ILibrary, group: 'Content' },
  author: { label: 'Authors', icon: IIdCard, group: 'People' },
  category: { label: 'Categories', icon: ITag, group: 'People' },
}

const GROUP_ORDER = ['Content', 'People', 'System'] as const

interface NavItem {
  key: string
  label: string
  href: string
  icon: ComponentType<IconProps>
}

function buildNav(modules: Record<string, boolean>, isAdmin: boolean): Map<string, NavItem[]> {
  const groups = new Map<string, NavItem[]>()
  const push = (group: string, item: NavItem) => {
    const list = groups.get(group) ?? []
    list.push(item)
    groups.set(group, list)
  }

  for (const key of Object.keys(MODULE_META)) {
    if (!isAdmin && modules[key] === undefined) continue
    const meta = MODULE_META[key]
    push(meta.group, { key, label: meta.label, href: `/editor/${key}`, icon: meta.icon })
  }

  if (isAdmin) {
    push('System', { key: 'admin', label: 'Admin Tools', href: '/editor/admin', icon: IShield })
  }

  return groups
}

export interface EditorViewer {
  name: string
  handle: string
  isAdmin: boolean
}

interface SidebarProps {
  viewer: EditorViewer
  modules: Record<string, boolean>
  signOutAction: () => void
}

export function Sidebar({ viewer, modules, signOutAction }: SidebarProps) {
  const pathname = usePathname()
  const nav = buildNav(modules, viewer.isAdmin)
  // /editor/quran/... -> "quran"; /editor -> "" (landing, nothing active)
  const activeKey = pathname.replace(/^\/editor\/?/, '').split('/')[0]

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="wm">
          <b>WikiSubmission</b>
          <small>Editor</small>
        </span>
      </div>
      <div className="sb-scroll">
        {GROUP_ORDER.filter((g) => nav.has(g)).map((group) => (
          <div className="sb-group" key={group}>
            <div className="sb-group-label">{group}</div>
            {nav.get(group)!.map((item) => {
              const Ico = item.icon
              const className = 'sb-item' + (item.key === activeKey ? ' is-active' : '')
              return (
                <Link key={item.key} href={item.href} className={className}>
                  <span className="ico">
                    <Ico size={17} />
                  </span>
                  <span className="lbl">{item.label}</span>
                  <span />
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      <div className="sb-user">
        <span className="sb-avatar">{viewer.name.charAt(0).toUpperCase()}</span>
        <span className="who">
          <b>{viewer.name}</b>
          <small>@{viewer.handle}</small>
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="iconbtn"
            style={{ width: 26, height: 26 }}
            aria-label="Sign out"
          >
            <ILogout size={15} />
          </button>
        </form>
      </div>
    </aside>
  )
}
