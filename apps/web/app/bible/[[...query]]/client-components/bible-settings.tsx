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
  ZoomInIcon,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useBiblePreferences } from '@/hooks/use-bible-preferences'
import { ZOOM_LEVELS } from '@/lib/quran-zoom'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
          <span className="text-xs text-muted-foreground leading-snug">
            {description}
          </span>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  )
}

export default function BibleSettings() {
  const prefs = useBiblePreferences()
  const t = useTranslations('settings')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Bible settings" size="icon-sm">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        {/* Zoom */}
        <DropdownMenuLabel className="flex items-center gap-2 text-primary">
          <ZoomInIcon className="size-4" />
          <strong>{t('zoom')}</strong>
        </DropdownMenuLabel>

        <div className="px-3 py-2 w-80">
          <div className="flex gap-1.5 flex-wrap">
            {ZOOM_LEVELS.map((level) => {
              const labelKey =
                `zoom${level.charAt(0).toUpperCase()}${level.slice(1)}` as
                  | 'zoomCompact'
                  | 'zoomNormal'
                  | 'zoomComfortable'
                  | 'zoomWide'
                  | 'zoomFull'
              const isActive = (prefs.zoomLevel ?? 'comfortable') === level
              return (
                <button
                  key={level}
                  onClick={() =>
                    prefs.setPreferences({ ...prefs, zoomLevel: level })
                  }
                  className={cn(
                    'flex-1 px-1.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
                  )}
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footnotes */}
        <DropdownMenuLabel className="flex items-center gap-2 text-primary mt-1">
          <BookOpenTextIcon className="size-4" />
          <strong>{t('footnotes')}</strong>
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
        <DropdownMenuLabel className="flex items-center gap-2 text-primary mt-1">
          <LanguagesIcon className="size-4" />
          <strong>{t('language')}</strong>
        </DropdownMenuLabel>
        <div className="px-3 py-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {t('english')}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
            {t('more')}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
