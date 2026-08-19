'use client'

import {
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, KeyRound, Search } from 'lucide-react'

import type {
  EditorGame,
  EditorialEditor,
} from '@/lib/editorial-content-client'
import { callAdminAction } from '@/lib/call-admin-action'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STATUS_META } from '@/components/editor/content/status'
import {
  Chip,
  GrantRow,
  GrantSectionHeading,
  TriState,
  type GrantLevel,
} from '@/components/admin/grants/grant-controls'
import {
  CONTENT_MODULES,
  grantStateToInput,
  grantSummary,
  initialGrantState,
  type GrantState,
} from '@/components/admin/grants/grant-state'
import { saveAccessAction } from './actions'

export type AccessRole = 'member' | 'editor' | 'game_editor' | 'admin'

const ROLE_OPTIONS: Array<{
  value: AccessRole
  label: string
  description: string
}> = [
  {
    value: 'member',
    label: 'Member',
    description: 'Default access for every account.',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Access to granted site CMS sections.',
  },
  {
    value: 'game_editor',
    label: 'Game editor',
    description: 'Access to granted game tools.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to every administrative and editorial surface.',
  },
]

interface VersionOption {
  id: number
  name: string
}

interface AccessClientProps {
  editors: EditorialEditor[]
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  games: EditorGame[]
  loadError: string | null
}

export function AccessClient({
  editors,
  quranVersions,
  bibleVersions,
  games,
  loadError,
}: AccessClientProps) {
  const [rows, setRows] = useState(editors)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<AccessRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selected, setSelected] = useState<EditorialEditor | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((user) => {
      if (
        needle &&
        !user.email.toLowerCase().includes(needle) &&
        !(user.display_name ?? '').toLowerCase().includes(needle)
      )
        return false
      if (roleFilter !== 'all' && !user.roles.includes(roleFilter)) return false
      if (statusFilter === 'active' && !user.is_active) return false
      if (statusFilter === 'inactive' && user.is_active) return false
      return true
    })
  }, [query, roleFilter, rows, statusFilter])

  const columns = useMemo<ColumnDef<EditorialEditor>[]>(
    () => [
      {
        id: 'user',
        accessorFn: (user) => (user.display_name || user.email).toLowerCase(),
        header: ({ column }) => (
          <SortButton
            label="User"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <div className="font-[family-name:var(--font-source-serif)] text-[16px] font-medium text-foreground">
              {row.original.display_name || row.original.email}
            </div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[12px] text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        id: 'roles',
        accessorFn: (user) => user.roles.join(' '),
        header: 'Roles',
        cell: ({ row }) => (
          <RoleBadges roles={row.original.roles as AccessRole[]} />
        ),
      },
      {
        id: 'permissions',
        accessorFn: (user) => grantSummary(user),
        header: 'Permissions',
        cell: ({ row }) => (
          <span className="block max-w-[360px] truncate text-[13px] text-muted-foreground">
            {grantSummary(row.original)}
          </span>
        ),
      },
      {
        id: 'status',
        accessorFn: (user) => (user.is_active ? 'active' : 'inactive'),
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={row.original.is_active ? 'secondary' : 'outline'}
            className="font-[family-name:var(--font-glacial)] text-[10.5px] uppercase tracking-[0.1em]"
          >
            {row.original.is_active ? 'Active' : 'Deactivated'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected(row.original)}
            >
              <KeyRound className="size-3.5" /> Manage access
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  const updateRow = (next: EditorialEditor) => {
    setRows((current) =>
      current.map((user) => (user.user_id === next.user_id ? next : user))
    )
    setSelected(next)
  }

  return (
    <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <p className="m-0 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-1.5 mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(32px,5vw,48px)]">
          Access
        </h1>
        <p className="max-w-[720px] text-[15px] leading-relaxed text-muted-foreground">
          Assign one or more roles, then grant read or write access to the
          sections each role unlocks. Member is the default role; admins have
          full access.
        </p>
      </header>

      {loadError && (
        <p className="mb-3 text-[14px] text-destructive">{loadError}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2.5">
        <label className="relative min-w-[260px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder="Filter by name or email…"
            className="pl-9"
          />
        </label>
        <FilterSelect
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as AccessRole | 'all')}
          ariaLabel="Filter by role"
        >
          <option value="all">All roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
          ariaLabel="Filter by account status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </FilterSelect>
      </div>

      <div className="overflow-hidden rounded-[3px] border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  No users match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
        <span>
          {filtered.length} user{filtered.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {selected && (
        <AccessDialog
          key={selected.user_id}
          editor={selected}
          quranVersions={quranVersions}
          bibleVersions={bibleVersions}
          games={games}
          open
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
          onSaved={updateRow}
        />
      )}
    </section>
  )
}

function AccessDialog({
  editor,
  quranVersions,
  bibleVersions,
  games,
  open,
  onOpenChange,
  onSaved,
}: {
  editor: EditorialEditor
  quranVersions: VersionOption[]
  bibleVersions: VersionOption[]
  games: EditorGame[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (editor: EditorialEditor) => void
}) {
  const [roles, setRoles] = useState<AccessRole[]>(() =>
    normalizeRoles(editor.roles)
  )
  const [state, setState] = useState<GrantState>(() =>
    initialGrantState(editor)
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (updater: (previous: GrantState) => GrantState) => {
    setState(updater)
    setMessage(null)
    setError(null)
  }
  const toggleRole = (role: AccessRole) => {
    if (role === 'member') return
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    )
    setMessage(null)
    setError(null)
  }
  const isAdmin = roles.includes('admin')
  const isEditor = roles.includes('editor')
  const isGameEditor = roles.includes('game_editor')

  const save = () =>
    startTransition(async () => {
      const grants = grantStateToInput(state)
      const result = await callAdminAction(() =>
        saveAccessAction({ userId: editor.user_id, roles, grants })
      )
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved({
        ...editor,
        role: roles.includes('admin')
          ? 'admin'
          : roles.includes('editor')
            ? 'editor'
            : 'member',
        roles,
        modules: grants.modules,
        quran_versions: grants.quran_versions,
        bible_versions: grants.bible_versions,
        games: grants.games ?? [],
      })
      setMessage('Access saved.')
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-cormorant)] text-[30px]">
            Manage access
          </DialogTitle>
          <DialogDescription>
            {editor.display_name || editor.email} · {editor.email}
          </DialogDescription>
        </DialogHeader>

        <GrantSectionHeading>Roles</GrantSectionHeading>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLE_OPTIONS.map((role) => {
            const checked = roles.includes(role.value)
            return (
              <label
                key={role.value}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-[3px] border p-3',
                  checked && 'border-primary bg-primary/5',
                  role.value === 'member' && 'cursor-default'
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={pending || role.value === 'member'}
                  onCheckedChange={() => toggleRole(role.value)}
                />
                <span>
                  <span className="block text-[15px] font-medium">
                    {role.label}
                  </span>
                  <span className="block text-[12.5px] leading-snug text-muted-foreground">
                    {role.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        {isAdmin && (
          <p className="mt-3 rounded-[3px] bg-muted px-3 py-2 text-[14px] text-muted-foreground">
            Admin provides full access. Editor and Game editor may remain
            selected independently for future demotion.
          </p>
        )}

        {isEditor && (
          <>
            <GrantSectionHeading>Site CMS</GrantSectionHeading>
            {CONTENT_MODULES.map(({ key, label }) => (
              <div key={key}>
                <GrantRow label={label} labelWidth="w-[190px]">
                  <TriState
                    value={state.modules[key]}
                    disabled={pending}
                    onChange={(value) =>
                      patch((previous) => ({
                        ...previous,
                        modules: { ...previous.modules, [key]: value },
                      }))
                    }
                  />
                </GrantRow>
                {key === 'quran' &&
                  state.modules.quran !== 'none' &&
                  quranVersions.map((version) => {
                    const grant = state.quran[version.id] ?? {
                      access: 'none' as GrantLevel,
                      approve: false,
                    }
                    return (
                      <GrantRow
                        key={version.id}
                        label={version.name}
                        labelWidth="w-[190px]"
                        indent
                      >
                        <TriState
                          value={grant.access}
                          disabled={pending}
                          onChange={(access) =>
                            patch((previous) => ({
                              ...previous,
                              quran: {
                                ...previous.quran,
                                [version.id]: { ...grant, access },
                              },
                            }))
                          }
                        />
                        <Chip
                          active={grant.approve}
                          disabled={pending}
                          onClick={() =>
                            patch((previous) => ({
                              ...previous,
                              quran: {
                                ...previous.quran,
                                [version.id]: {
                                  ...grant,
                                  approve: !grant.approve,
                                },
                              },
                            }))
                          }
                        >
                          approver
                        </Chip>
                      </GrantRow>
                    )
                  })}
                {key === 'bible' &&
                  state.modules.bible !== 'none' &&
                  bibleVersions.map((version) => (
                    <GrantRow
                      key={version.id}
                      label={version.name}
                      labelWidth="w-[190px]"
                      indent
                    >
                      <TriState
                        value={state.bible[version.id] ?? 'none'}
                        disabled={pending}
                        onChange={(access) =>
                          patch((previous) => ({
                            ...previous,
                            bible: { ...previous.bible, [version.id]: access },
                          }))
                        }
                      />
                    </GrantRow>
                  ))}
              </div>
            ))}
            <p className="mt-3 text-[13px] text-muted-foreground">
              Categories are managed inside Articles and inherit its access.
              Author management is admin-only.
            </p>
          </>
        )}

        {isGameEditor && (
          <>
            <GrantSectionHeading hint="per-game access works without the global grant">
              Games
            </GrantSectionHeading>
            <GrantRow label="All games" labelWidth="w-[190px]">
              <TriState
                value={state.allGames}
                disabled={pending}
                onChange={(allGames) =>
                  patch((previous) => ({ ...previous, allGames }))
                }
              />
            </GrantRow>
            {games.map((game) => (
              <GrantRow
                key={game.key}
                label={game.name}
                labelWidth="w-[190px]"
                indent
              >
                <TriState
                  value={state.games[game.key] ?? 'none'}
                  disabled={pending}
                  onChange={(access) =>
                    patch((previous) => ({
                      ...previous,
                      games: { ...previous.games, [game.key]: access },
                    }))
                  }
                />
              </GrantRow>
            ))}
            {games.length === 0 && (
              <p className="text-[14px] text-muted-foreground">
                No games are registered yet.
              </p>
            )}
          </>
        )}

        <DialogFooter className="items-center gap-3 sm:justify-between">
          <div className="min-h-5 text-[12px] uppercase tracking-[0.1em]">
            {message && (
              <span className={STATUS_META.published.text}>{message}</span>
            )}
            {error && <span className={STATUS_META.changed.text}>{error}</span>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? 'Saving…' : 'Save access'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SortButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={onClick}>
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  )
}
function RoleBadges({ roles }: { roles: AccessRole[] }) {
  return (
    <div className="flex min-w-[190px] flex-wrap gap-1">
      {roles.map((role) => (
        <Badge
          key={role}
          variant={role === 'admin' ? 'default' : 'outline'}
          className="font-[family-name:var(--font-glacial)] text-[10px] uppercase tracking-[0.08em]"
        >
          {role.replace('_', ' ')}
        </Badge>
      ))}
    </div>
  )
}
function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="h-9 rounded-[2px] border border-input bg-background px-3 text-[14px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {children}
    </select>
  )
}
function normalizeRoles(roles: readonly string[]): AccessRole[] {
  const valid = roles.filter(
    (role): role is AccessRole =>
      role === 'member' ||
      role === 'editor' ||
      role === 'game_editor' ||
      role === 'admin'
  )
  return ['member', ...valid.filter((role) => role !== 'member')]
}
