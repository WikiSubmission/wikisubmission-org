"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";

export default function HomeScreenSuggestions() {
    const suggestions = [
        { label: "Story of Moses", query: "7:103" },
        { label: "Charity", query: "2:261" },
        { label: "Abraham's Religion", query: "2:124" },
        { label: "Jesus", query: "19:22" },
        { label: "Story of Joseph", query: "12:0" },
        { label: "No Compulsion", query: "2:256" },
        { label: "Creation", query: "21:30" },
        { label: "Forbidden Food", query: "6:145" },
    ];

    return (
        <main className="space-y-2 flex flex-col items-center max-w-lg mx-auto">
            <div className="flex flex-wrap gap-1 justify-center">
                {suggestions.map((suggestion, index) => (
                    <Link
                        key={index}
                        href={`/quran/?q=${(suggestion.query)}`}
                        className="group"
                    >
                        <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-muted/30 border border-border/40 hover:bg-muted/50 hover:border-violet-500/30 transition-all duration-200">
                            <SearchIcon className="size-3 text-muted-foreground/60 group-hover:text-violet-500 transition-colors" />
                            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                {suggestion.label}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
