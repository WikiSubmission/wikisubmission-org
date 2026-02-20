'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <Sun className="h-fit w-fit scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-fit w-fit scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <h1 className="text-sm font-semibold p-2">Theme</h1>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light {theme === 'light' ? '(current)' : ''}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark {theme === 'dark' ? '(current)' : ''}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System {theme === 'system' ? '(current)' : ''}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
