'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpenTextIcon,
  CrossIcon,
  LanguagesIcon,
  SettingsIcon,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useBiblePreferences } from '@/hooks/use-bible-preferences'

function SettingTile({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium leading-none">{label}</span>
          <span className="text-xs text-muted-foreground leading-snug">{description}</span>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  )
}

export default function BibleSettings() {
  const prefs = useBiblePreferences()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Bible settings" size="icon-sm">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        {/* Footnotes */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500">
          <BookOpenTextIcon className="size-4" />
          <strong>Footnotes</strong>
        </DropdownMenuLabel>

        <div className="space-y-0.5 pb-1">
          <SettingTile
            icon={<BookOpenTextIcon className="size-3.5" />}
            label="Manuscript footnotes"
            description="Textual variants and translation notes"
            checked={prefs.manuscriptFootnotes}
            onCheckedChange={(v) =>
              prefs.setPreferences({ ...prefs, manuscriptFootnotes: v })
            }
          />
          <SettingTile
            icon={<CrossIcon className="size-3.5" />}
            label="Theological footnotes"
            description="Commentary and cross-references"
            checked={prefs.theologicalFootnotes}
            onCheckedChange={(v) =>
              prefs.setPreferences({ ...prefs, theologicalFootnotes: v })
            }
          />
        </div>

        {/* Language */}
        <DropdownMenuLabel className="flex items-center gap-2 text-violet-500 mt-1">
          <LanguagesIcon className="size-4" />
          <strong>Language</strong>
        </DropdownMenuLabel>
        <div className="px-3 py-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            English
          </span>
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
            More translations coming soon.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
