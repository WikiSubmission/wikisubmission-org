"use client"

import { BookIcon, ChevronDown, DownloadIcon, HeartIcon, Music2Icon, MoonIcon, SearchIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"

const modes = {
  home: {
    label: "Home",
    icon: "/brand-assets/logo-transparent.png",
    href: "/",
  },
  quran: {
    label: "Quran",
    icon: <BookIcon className="size-4" />,
    href: "/quran",
  },
  bible: {
    label: "Bible",
    icon: <BookIcon className="size-4" />,
    href: "/bible",
    comingSoon: true,
  },
  music: {
    label: "Music",
    icon: <Music2Icon className="size-4" />,
    href: "/music",
  },
  search: {
    label: "Search",
    icon: <SearchIcon className="size-4" />,
    href: "/search"
  },
  prayertimes: {
    label: "Prayer Times",
    icon: <HeartIcon className="size-4" />,
    href: "/prayer-times",
  },
  ramadan: {
    label: "Ramadan",
    icon: <MoonIcon className="size-4" />,
    href: "/ramadan"
  },
  downloads: {
    label: "Downloads",
    icon: <DownloadIcon className="size-4" />,
    href: "/downloads",
  },
}

type Mode = keyof typeof modes

interface ModeSwitcherProps {
  currentPage: Mode
}

export function PageSwitcher({ currentPage }: ModeSwitcherProps) {
  const currentIcon = modes[currentPage].icon
  const isString = typeof currentIcon === "string"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="z-10 flex items-center gap-2 px-3 h-8 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/40">
        {isString ? (
          <Image src={currentIcon} alt="" width={500} height={500} className="size-6 rounded-full" />
        ) : (
          currentIcon
        )}
        <span className="text-base font-light">{modes[currentPage].label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {Object.entries(modes).map(([key, mode]) => {
          const modeIcon = mode.icon
          const isIconString = typeof modeIcon === "string"
          const isActive = key === currentPage

          return (
            <DropdownMenuItem key={key} asChild disabled={'comingSoon' in mode}>
              <Link
                href={mode.href}
                className={`flex items-center gap-2 ${isActive ? "bg-accent" : ""
                  } ${'comingSoon' in mode ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isIconString ? (
                  <Image
                    src={modeIcon}
                    alt=""
                    width={500}
                    height={500}
                    className={`size-4 rounded-full ${isActive ? "opacity-100" : "opacity-100"}`}
                  />
                ) : (
                  modeIcon
                )}
                <span className={`text-xs ${isActive ? "text-violet-600" : "text-primary"}`}>{mode.label}{'comingSoon' in mode ? " (coming soon)" : ""}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

