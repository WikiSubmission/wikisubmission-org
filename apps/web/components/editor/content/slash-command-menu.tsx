'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

export interface SlashCommand {
  id: string
  title: string
  description: string
  category: 'Scripture & Media' | 'Basic Blocks' | 'Lists & Citations'
  icon: React.ReactNode
  keywords: string[]
  action: () => void
}

interface SlashCommandMenuProps {
  isOpen: boolean
  onClose: () => void
  query: string
  onQueryChange: (q: string) => void
  commands: SlashCommand[]
  position?: { top: number; left: number } | null
}

export function SlashCommandMenu({
  isOpen,
  onClose,
  query,
  onQueryChange,
  commands,
  position,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevQuery, setPrevQuery] = useState(query)
  const menuRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset selected index when query changes
  if (query !== prevQuery) {
    setPrevQuery(query)
    setSelectedIndex(0)
  }

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return commands
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }, [commands, query])

  // Handle keyboard events (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev + 1 >= filteredCommands.length ? 0 : prev + 1
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeItem = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  // Group commands by category
  const categories = Array.from(
    new Set(filteredCommands.map((c) => c.category))
  )

  return (
    <div
      ref={menuRef}
      className="ws-slash-menu fixed z-50 w-80 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: position ? `${position.top}px` : '40%',
        left: position ? `${position.left}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
      }}
    >
      {/* Top Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/40">
        <span className="font-mono text-xs font-semibold text-primary">/</span>
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-xs font-[family-name:var(--font-jetbrains)] text-foreground placeholder:text-muted-foreground"
          placeholder="Type a command or filter…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          ESC to close
        </span>
      </div>

      {/* Command Groups List */}
      <div ref={listRef} className="max-h-72 overflow-y-auto p-1.5 space-y-1">
        {filteredCommands.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No commands matching &ldquo;{query}&rdquo;
          </div>
        ) : (
          categories.map((cat) => {
            const catCommands = filteredCommands.filter(
              (c) => c.category === cat
            )
            return (
              <div key={cat} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[9.5px] font-[family-name:var(--font-glacial)] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {cat}
                </div>
                {catCommands.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd)
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      data-index={globalIndex}
                      onClick={() => {
                        cmd.action()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-accent text-accent-foreground shadow-xs'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div
                        className={`size-7 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border'
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium font-[family-name:var(--font-source-serif)] leading-none text-foreground">
                          {cmd.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-[family-name:var(--font-source-serif)] truncate mt-0.5">
                          {cmd.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Navigation Tip */}
      <div className="px-3 py-1.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[10.5px] text-muted-foreground font-[family-name:var(--font-jetbrains)]">
        <span>↑↓ to navigate</span>
        <span>↵ to select</span>
      </div>
    </div>
  )
}
