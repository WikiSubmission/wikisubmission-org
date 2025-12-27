import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ws } from "@/lib/wikisubmission-sdk";
import { DownloadIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { Fonts } from "@/constants/fonts";
import Image from "next/image";

export default async function QuranUtilitiesRow() {
    const randomVerse = await ws.Quran.randomVerse();
    return (
        <main className="p-2 flex items-center justify-between rounded-2xl space-x-4">
            <div>
                <Link href="/quran">
                    <div className={`flex items-center ${Fonts.geistMono.className} bg-muted/50 rounded-lg text-center`}>
                        <Image src="/brand-assets/logo-transparent.png" alt="Quran" width={24} height={24} className="pb-0.5 pl-1" />
                        <p className="p-2 text-xs">
                            THE FINAL TESTAMENT
                        </p>
                    </div>
                </Link>
            </div>
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