import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QuranSidebar } from "./client-components/sidebar";
import { PageSwitcher } from "@/components/page-switcher";
import { ws } from "@/lib/wikisubmission-sdk";
import QuranSearchbar from "./client-components/searchbar";
import QuranSettings from "./client-components/settings";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function QuranLayout({ children }: { children: React.ReactNode }) {

    const chaptersResult = await ws.supabase.from("ws_quran_chapters").select("*");
    const appendicesResult = await ws.supabase.from("ws_quran_appendices").select("*");

    if (chaptersResult.data && appendicesResult.data) {
        return (
            <SidebarProvider>
                {/* Sidebar (left space) */}
                <QuranSidebar chapters={chaptersResult.data} appendices={appendicesResult.data} />
                {/* Main content (right space) */}
                <SidebarInset>
                    {/* Header */}
                    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                        <SidebarTrigger className="-ml-1 bg-secondary/50 rounded-full p-4 hover:bg-secondary/70 cursor-pointer lg:hidden" />
                        <PageSwitcher currentMode="quran" />
                        <Link href="/quran">
                            <Button size="icon-sm" variant="ghost">
                                <ChevronLeftIcon />
                            </Button>
                        </Link>
                        <QuranSearchbar />
                        <QuranSettings />
                    </header>
                    {/* Main content */}
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    } else {
        return (
            <div>
                <p>Something went wrong</p>
            </div>
        );
    }

}