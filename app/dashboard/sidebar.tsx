'use client';

import Image from "next/image"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import { Bell, Home, Music, User } from "lucide-react"
import Link from "next/link"

// Menu items.
const developerSection = [
    {
        title: "Overview",
        url: "/dashboard/developer",
        icon: Home,
    },
    {
        title: "Notifications",
        url: "/dashboard/developer/notifications",
        icon: Bell,
    },
    {
        title: "Music",
        url: "/dashboard/developer/music",
        icon: Music,
    },
]

const contributorSection = [
    {
        title: "Welcome",
        url: "/dashboard/contributor",
        icon: User,
    },
]

export function DashboardSidebar() {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4 space-y-1">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/brand-assets/logo-transparent.png" alt="WikiSubmission Logo" className="size-12 rounded-full" width={500} height={500} />
                </Link>
            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Contributor
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {contributorSection.map((item) => (
                                <SidebarMenuItem key={item.title} className={`rounded-lg ${pathname === item.url ? "bg-primary text-primary-foreground" : ""}`}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


                <SidebarGroup>
                    <SidebarGroupLabel>Developer</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {developerSection.map((item) => (
                                <SidebarMenuItem key={item.title} className={`rounded-lg ${pathname === item.url ? "bg-primary text-primary-foreground" : ""}`}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}