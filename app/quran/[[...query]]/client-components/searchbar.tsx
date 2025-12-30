'use client';

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export default function QuranSearchbar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q')?.toString() || "");
    const prevUrlQueryRef = useRef(searchParams.get('q')?.toString() || "");

    const [strictMode, setStrictMode] = useLocalStorage<boolean>("quran-search-strict-mode", false);
    const [mounted, setMounted] = useState(false);
    const [focused, setFocused] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync state with URL params when they change externally (e.g., clicking a link)
    useEffect(() => {
        const urlQuery = searchParams.get('q')?.toString() || "";
        if (prevUrlQueryRef.current !== urlQuery) {
            prevUrlQueryRef.current = urlQuery;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchQuery(urlQuery);
        }
    }, [searchParams]);

    const performSearch = useCallback((queryToSearch: string, isStrict: boolean) => {
        if (queryToSearch) {
            // If there's a search query, reset to root /quran and only include the 'q' param
            const strictParam = isStrict ? "&strict=true" : "";
            replace(`/quran?q=${decodeURIComponent(queryToSearch)}${strictParam}`);
        } else {
            // If cleared, just remove 'q' from existing params and stay on current pathname
            const params = new URLSearchParams(searchParams);
            params.delete('q');
            params.delete('strict');
            const queryString = params.toString();
            replace(`${pathname}${queryString ? `?${decodeURIComponent(queryString)}` : ""}`);
        }
    }, [pathname, replace, searchParams]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const currentQ = searchParams.get('q')?.toString() || "";
            const currentStrict = searchParams.get('strict') === "true";

            if (searchQuery === currentQ && strictMode === currentStrict) return;

            performSearch(searchQuery, strictMode);
        }, 700);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchParams, performSearch, strictMode]);

    if (!mounted) {
        return (
            <div className="relative w-full">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                <Input
                    type="search"
                    placeholder="Search Quran"
                    className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                    value={searchQuery}
                    onChange={() => { }}
                />
            </div>
        )
    }

    const showOptions = searchQuery && focused;

    return (
        <form
            ref={formRef}
            className="relative w-full"
            onSubmit={(e) => {
                e.preventDefault();
                performSearch(searchQuery, strictMode);
            }}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
                if (!formRef.current?.contains(e.relatedTarget as Node)) {
                    setFocused(false);
                }
            }}
        >
            <SearchIcon className="absolute left-2 top-2.5 size-3.5 text-muted-foreground/60 z-10" />
            <Input
                type="search"
                placeholder="Search Quran"
                className={cn(
                    "pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-all duration-200",
                    showOptions && "rounded-b-none"
                )}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                }}
            />
            {showOptions && (
                <div className="absolute top-full left-0 w-full bg-secondary rounded-b-md px-2 py-2 z-20 shadow-sm animate-in fade-in slide-in-from-top-1 flex items-start gap-2">
                    <Checkbox
                        id="strict-mode"
                        checked={strictMode}
                        onCheckedChange={(checked) => {
                            const newValue = checked === true;
                            setStrictMode(newValue);
                            // Immediate search on toggle if query exists
                            if (searchQuery) {
                                performSearch(searchQuery, newValue);
                            }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground/50"
                    />
                    <Label htmlFor="strict-mode" className="flex flex-col items-start gap-1 text-xs text-primary font-normal cursor-pointer select-none">
                        Strict Mode
                        <span className="text-xs text-muted-foreground font-normal cursor-pointer select-none">
                            (Only exact matches)
                        </span>
                    </Label>
                </div>
            )}
        </form>
    );
}