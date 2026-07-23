'use client'

/**
 * Editor sidebar, built on the shared shadcn Sidebar primitive. Lives in the
 * editor layout as persistent chrome, so it stays mounted across navigations and
 * keeps its collapsed/expanded state (persisted to the sidebar_state cookie by
 * SidebarProvider). Active state is derived from the pathname. The navigation is
 * built from the modules the caller can read; nothing the backend has not
 * granted is shown.
 */
import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  IArticles,
  IQuran,
  IBibleBook,
  IUsers,
  IIdCard,
  ITag,
  ILibrary,
  IShield,
  type IconProps,
} from './icons'
import { EditorUserMenu } from './user-menu'

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

interface EditorSidebarProps {
  viewer: EditorViewer
  modules: Record<string, boolean>
  signOutAction: () => void
}

export function EditorSidebar({ viewer, modules, signOutAction }: EditorSidebarProps) {
  const pathname = usePathname()
  const nav = buildNav(modules, viewer.isAdmin)
  // /editor/quran/... -> "quran"; /editor -> "" (landing, nothing active)
  const activeKey = pathname.replace(/^\/editor\/?/, '').split('/')[0]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="WikiSubmission Editor">
              <Link href="/editor">
                <span className="flex aspect-square size-8 items-center justify-center rounded-[3px] bg-sidebar-primary font-[family-name:var(--font-cormorant)] text-base font-semibold text-sidebar-primary-foreground">
                  W
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-[family-name:var(--font-cormorant)] text-[18px] font-semibold tracking-[-0.015em]">
                    WikiSubmission
                  </span>
                  <span className="font-[family-name:var(--font-glacial)] text-[9px] uppercase tracking-[0.22em] text-primary">
                    Editor
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {GROUP_ORDER.filter((g) => nav.has(g)).map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="font-[family-name:var(--font-glacial)] text-[9.5px] uppercase tracking-[0.2em]">
              {group}
            </SidebarGroupLabel>
            <SidebarMenu>
              {nav.get(group)!.map((item) => {
                const Ico = item.icon
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.key === activeKey}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Ico size={17} />
                        <span className="font-[family-name:var(--font-source-serif)] text-[14.5px]">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <EditorUserMenu viewer={viewer} signOutAction={signOutAction} />
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
