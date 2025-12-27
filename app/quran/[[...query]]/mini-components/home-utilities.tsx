import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ws } from "@/lib/wikisubmission-sdk";
import { DownloadIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";

export default async function QuranUtilitiesRow() {
    const randomVerse = await ws.Quran.randomVerse();
    return (
        <main className="p-2 flex items-center justify-end rounded-2xl space-x-4">
            <div className="flex justify-end space-y-2 space-x-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon-sm" asChild>
                            <Link href={`/quran/${randomVerse.data ? `${randomVerse.data.chapter_number}?verse=${randomVerse.data.verse_number}` : `/quran/1?verse=1`}`}>
                                <SparkleIcon className="size-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Random Verse</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon-sm" asChild>
                            <Link href="/downloads">
                                <DownloadIcon className="size-4" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Downloads</p>
                    </TooltipContent>
                </Tooltip>
                <ThemeToggle />
            </div>
        </main>
    )
}