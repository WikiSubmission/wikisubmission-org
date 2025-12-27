"use client";

import { useQuranMetrics } from "@/hooks/use-quran-metrics";
import { HistoryIcon } from "lucide-react";

export default function HomeScreenMetrics() {
    const quranMetrics = useQuranMetrics();
    return (
        <main>
            {quranMetrics.lastQueryMetadata && (
                <a href={`/quran/${quranMetrics.lastChapter}`} className="hover:cursor-pointer text-xs">
                    <div className="rounded-2xl space-y-2 text-violet-500 [&>*]:hover:text-violet-600">
                        <div className="flex items-center gap-1">
                            <HistoryIcon className="size-3" />
                            <p>
                                {quranMetrics.lastQueryMetadata?.formattedQuery}
                            </p>
                        </div>
                    </div>
                </a>
            )}
        </main>
    )
}