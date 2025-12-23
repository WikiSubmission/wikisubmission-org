"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
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
    icon: "/graphics/book.png",
    href: "/quran",
  },
}

type Mode = keyof typeof modes

interface ModeSwitcherProps {
  currentMode: Mode
}

export function PageSwitcher({ currentMode }: ModeSwitcherProps) {
  const currentIcon = modes[currentMode].icon
  const isString = typeof currentIcon === "string"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 h-8 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/40">
        {isString ? (
          <Image src={currentIcon} alt="" width={500} height={500} className="size-6 rounded-full" />
        ) : (
          React.createElement(currentIcon, { className: "size-4 text-primary" })
        )}
        <span className="text-base font-light">{modes[currentMode].label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {Object.entries(modes).map(([key, mode]) => {
          const modeIcon = mode.icon
          const isIconString = typeof modeIcon === "string"
          const isActive = key === currentMode

          return (
            <DropdownMenuItem key={key} asChild>
              <Link
                href={mode.href}
                className={`flex items-center gap-2 ${isActive ? "bg-accent" : ""
                  }`}
              >
                {isIconString ? (
                  <Image
                    src={modeIcon}
                    alt=""
                    width={500}
                    height={500}
                    className={`size-4 rounded-full ${isActive ? "opacity-100" : "opacity-60"}`}
                  />
                ) : (
                  React.createElement(modeIcon, {
                    className: `size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`
                  })
                )}
                <span>{mode.label}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

