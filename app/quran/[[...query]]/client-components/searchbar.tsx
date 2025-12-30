'use client';

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function QuranSearchbar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q')?.toString() || "");
    const prevUrlQueryRef = useRef(searchParams.get('q')?.toString() || "");

    // Sync state with URL params when they change externally (e.g., clicking a link)
    useEffect(() => {
        const urlQuery = searchParams.get('q')?.toString() || "";
        if (prevUrlQueryRef.current !== urlQuery) {
            prevUrlQueryRef.current = urlQuery;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchQuery(urlQuery);
        }
    }, [searchParams]);

    const performSearch = useCallback((queryToSearch: string) => {
        if (queryToSearch) {
            // If there's a search query, reset to root /quran and only include the 'q' param
            replace(`/quran?q=${decodeURIComponent(queryToSearch)}`);
        } else {
            // If cleared, just remove 'q' from existing params and stay on current pathname
            const params = new URLSearchParams(searchParams);
            params.delete('q');
            const queryString = params.toString();
            replace(`${pathname}${queryString ? `?${decodeURIComponent(queryString)}` : ""}`);
        }
    }, [pathname, replace, searchParams]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const currentQ = searchParams.get('q')?.toString() || "";
            if (searchQuery === currentQ) return;

            performSearch(searchQuery);
        }, 700);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchParams, performSearch]);

    return (
        <form
            className="relative w-full"
            onSubmit={(e) => {
                e.preventDefault();
                performSearch(searchQuery);
            }}
        >
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
            <Input
                type="search"
                placeholder="Search Quran"
                className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                }}
            />
        </form>
    );
}